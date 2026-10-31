/* Pure schedule and validation logic, shared by the browser and Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RiftSchedule = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const DAY = 86400000;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  function problem(code, message) { const error = new Error(message); error.code = code; throw error; }
  function record(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function date(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) && Number.isFinite(Date.parse(value)); }
  function validate(data) {
    if (!record(data) || data.version !== 1 || !date(data.updatedAt)) problem('CONFIG_FORMAT', 'Schedule data is missing or uses an unsupported format.');
    if (!record(data.publication) || typeof data.publication.enabled !== 'boolean' || typeof data.publication.artworkCleared !== 'boolean') problem('CONFIG_PUBLICATION', 'Publication settings are incomplete.');
    if (!Array.isArray(data.sources) || !record(data.regions) || !Object.keys(data.regions).length) problem('CONFIG_REQUIRED', 'Sources and region definitions are required.');
    const sources = new Set();
    for (const source of data.sources) {
      if (!record(source) || typeof source.id !== 'string' || !source.id || typeof source.title !== 'string' || !source.title || !['official', 'community', 'observation'].includes(source.type)) problem('CONFIG_SOURCE', 'Source metadata is incomplete.');
      try { if (new URL(source.url).protocol !== 'https:') throw new Error(); } catch { problem('CONFIG_SOURCE_URL', 'Sources must use valid HTTPS URLs.'); }
      if (sources.has(source.id)) problem('CONFIG_SOURCE_DUPLICATE', 'Source identifiers must be unique.');
      sources.add(source.id);
    }
    for (const [id, item] of Object.entries(data.regions)) {
      if (!/^[a-z][a-z-]*$/.test(id) || !record(item) || typeof item.name !== 'string' || !item.name || !['provisional', 'verified', 'pending'].includes(item.status)) problem('CONFIG_REGION', 'Region metadata is invalid.');
      try { if (typeof item.zone !== 'string' || !item.zone) throw new Error(); new Intl.DateTimeFormat('en', { timeZone: item.zone }).format(); } catch { problem('CONFIG_TIMEZONE', 'Unknown region time zone: ' + id); }
      if (!Array.isArray(item.sourceIds) || !item.sourceIds.length || item.sourceIds.some(source => !sources.has(source))) problem('CONFIG_SOURCE_REFERENCE', 'Every region needs valid source references.');
      if (item.reviewedAt !== null && !date(item.reviewedAt)) problem('CONFIG_REVIEW_DATE', 'Review dates must be UTC timestamps or null.');
      if (item.validUntil !== null && !date(item.validUntil)) problem('CONFIG_EXPIRY', 'Expiry dates must be UTC timestamps or null.');
      if (!own(item, 'rift') || !own(item, 'reset')) problem('CONFIG_EVENT_REQUIRED', 'Each region must define both event types, or explicitly use null.');
      if (item.rift !== null && (!record(item.rift) || !Number.isInteger(item.rift.intervalMinutes) || item.rift.intervalMinutes < 1 || item.rift.intervalMinutes > 1440 || !date(item.rift.anchorUtc))) problem('CONFIG_RIFT', 'Rift interval or UTC anchor is invalid.');
      if (item.reset !== null && (!record(item.reset) || !Number.isInteger(item.reset.dailyHourUTC) || item.reset.dailyHourUTC < 0 || item.reset.dailyHourUTC > 23 || !Number.isInteger(item.reset.weeklyDayUTC) || item.reset.weeklyDayUTC < 0 || item.reset.weeklyDayUTC > 6)) problem('CONFIG_RESET', 'Reset hour or weekday is invalid.');
      if (item.status === 'pending' && (item.rift !== null || item.reset !== null)) problem('CONFIG_PENDING', 'Pending services must not have a speculative schedule.');
      if (item.status === 'verified' && (!item.reviewedAt || (!item.rift && !item.reset))) problem('CONFIG_VERIFICATION', 'Verified services require dated review evidence and a schedule.');
    }
    if (!own(data.regions, 'global')) problem('CONFIG_DEFAULT', 'The default Global service is missing.');
    if (data.publication.enabled && (!data.publication.artworkCleared || Object.values(data.regions).some(item => item.status === 'provisional'))) problem('PUBLICATION_NOT_READY', 'Resolve provisional data and artwork permissions before enabling publication.');
    return data;
  }
  function available(config, mode, now = Date.now()) { return Boolean(config && config.status !== 'pending' && (!config.validUntil || now < Date.parse(config.validUntil)) && (mode === 'reset' ? config.reset : config.rift)); }
  function nextReset(config, now, weekly = false) {
    if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) problem('INVALID_NOW', 'The current time must be a valid finite timestamp.');
    if (!available(config, 'reset', now)) return null;
    const next = new Date(now);
    next.setUTCHours(config.reset.dailyHourUTC, 0, 0, 0);
    if (weekly) next.setUTCDate(next.getUTCDate() + (config.reset.weeklyDayUTC - next.getUTCDay() + 7) % 7);
    if (+next <= now) next.setUTCDate(next.getUTCDate() + (weekly ? 7 : 1));
    if (config.validUntil && +next >= Date.parse(config.validUntil)) return null;
    return next;
  }
  function openings(config, mode, now = Date.now(), count = 8) {
    if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime()) || !Number.isInteger(count) || count < 1 || count > 336) problem('INVALID_RANGE', 'A valid time and event count from 1 to 336 are required.');
    if (!available(config, mode, now)) return [];
    const interval = mode === 'reset' ? DAY : config.rift.intervalMinutes * 60000;
    const anchor = mode === 'reset' ? +nextReset(config, now) : Date.parse(config.rift.anchorUtc);
    if (mode === 'reset' && !nextReset(config, now)) return [];
    const first = mode === 'reset' ? anchor : anchor + (Math.floor((now - anchor) / interval) + 1) * interval;
    return Array.from({ length: count }, (_, index) => new Date(first + index * interval)).filter(item => !config.validUntil || +item < Date.parse(config.validUntil));
  }
  return { validate, available, nextReset, openings };
});
