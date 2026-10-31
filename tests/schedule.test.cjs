const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/scripts/schedule-core.js');
const data = require('../src/data/schedules.json');
const copy = () => structuredClone(data);
const ms = value => Date.parse(value);
test('configuration validates and rejects missing or mismatched fields', () => {
  assert.equal(core.validate(data), data);
  for (const [change, code] of [
    [d => { delete d.regions.global.rift; }, 'CONFIG_EVENT_REQUIRED'],
    [d => { d.regions.global.zone = undefined; }, 'CONFIG_TIMEZONE'],
    [d => { d.regions.global.rift.intervalMinutes = 0; }, 'CONFIG_RIFT'],
    [d => { d.regions.global.reset.weeklyDayUTC = 7; }, 'CONFIG_RESET'],
    [d => { d.regions.global.sourceIds = ['missing']; }, 'CONFIG_SOURCE_REFERENCE'],
    [d => { d.sources[0].url = 'javascript:alert(1)'; }, 'CONFIG_SOURCE_URL'],
    [d => { d.regions.asia.rift = d.regions.global.rift; }, 'CONFIG_PENDING'],
    [d => { d.regions.global.status = 'verified'; }, 'CONFIG_VERIFICATION'],
    [d => { d.publication.enabled = true; }, 'PUBLICATION_NOT_READY']
  ]) { const config = copy(); change(config); assert.throws(() => core.validate(config), error => error.code === code); }
});
test('exact rift boundary advances to next occurrence, including midnight', () => {
  const at = ms('2026-11-01T00:00:00Z');
  assert.equal(core.openings(data.regions.global, 'rift', at - 1, 1)[0].toISOString(), '2026-11-01T00:00:00.000Z');
  assert.equal(core.openings(data.regions.global, 'rift', at, 1)[0].toISOString(), '2026-11-01T03:00:00.000Z');
  const kr = core.openings(data.regions.korea, 'rift', at, 1)[0];
  assert.equal(kr.toISOString(), '2026-11-01T02:00:00.000Z');
});
test('pending and expired schedules never silently use another region', () => {
  assert.deepEqual(core.openings(data.regions.asia, 'rift'), []);
  assert.equal(core.nextReset(data.regions.asia, Date.now()), null);
  const config = structuredClone(data.regions.global);
  config.validUntil = '2026-11-01T01:00:00Z';
  assert.equal(core.openings(config, 'rift', ms('2026-11-01T00:00:00Z')).length, 0);
  assert.equal(core.openings(config, 'rift', ms('2026-11-01T01:00:00Z')).length, 0);
  assert.equal(core.nextReset(config, ms('2026-11-01T00:00:00Z')), null);
});
test('daily and weekly resets use the selected service and UTC date', () => {
  const at = ms('2026-11-04T07:00:00Z');
  assert.equal(core.nextReset(data.regions.global, at - 1).toISOString(), '2026-11-04T07:00:00.000Z');
  assert.equal(core.nextReset(data.regions.global, at).toISOString(), '2026-11-05T07:00:00.000Z');
  assert.equal(core.nextReset(data.regions.global, at, true).toISOString(), '2026-11-11T07:00:00.000Z');
  const kr = core.nextReset(data.regions.korea, ms('2026-11-02T00:00:00Z'), true);
  assert.equal(kr.toISOString(), '2026-11-03T20:00:00.000Z');
  assert.match(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', weekday:'long',hour:'2-digit',hourCycle:'h23' }).format(kr), /Wednesday.*05/);
});
test('DST conversion is per occurrence; UTC cadence stays fixed', () => {
  const dates = core.openings(data.regions.global, 'rift', ms('2026-11-01T02:59:00Z'), 3);
  const format = new Intl.DateTimeFormat('en-GB',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  assert.deepEqual(dates.map(d => format.format(d)), ['23:00','01:00','04:00']);
  assert.equal(+dates[1] - +dates[0], 10800000);
});
test('invalid timestamps and unreasonable calendar counts are rejected', () => {
  assert.throws(() => core.openings(data.regions.global,'rift',NaN), {code:'INVALID_RANGE'});
  assert.throws(() => core.openings(data.regions.global,'rift',Date.now(),337), {code:'INVALID_RANGE'});
  assert.throws(() => core.nextReset(data.regions.global,Infinity), {code:'INVALID_NOW'});
});
