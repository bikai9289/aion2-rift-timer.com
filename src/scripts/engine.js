'use strict';
const el = id => document.getElementById(id);
const mode = document.body.dataset.mode;
const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const HOUR = 3600000;
const regions = scheduleData.regions;
function read(key, fallback) { try { return localStorage.getItem('aion-rift-' + key) || fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem('aion-rift-' + key, value); } catch {} }
let region = document.body.dataset.pageRegion === 'global' ? read('region', 'global') : document.body.dataset.pageRegion;
if (!Object.hasOwn(regions, region)) region = 'global';
let zoneMode = read('zone', 'local');
if (!['local', 'service', 'utc'].includes(zoneMode)) zoneMode = 'local';
let expanded = false;
let rendered = '';
let activeAlerts = false;
let notified = '';
let toastTimer;
let audio;
let checks = {};
function displayZone() { return zoneMode === 'local' ? deviceZone : zoneMode === 'service' ? regions[region].zone : 'UTC'; }
function clock(date, zone = displayZone()) { return new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date); }
function day(date, zone = displayZone()) { return new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'short', day: 'numeric', month: 'short' }).format(date); }
function zoneShort(date, zone = displayZone()) { return new Intl.DateTimeFormat('en-GB', { timeZone: zone, timeZoneName: 'short' }).formatToParts(date).find(part => part.type === 'timeZoneName').value; }
function resetAfter(now, weekly = false) { return RiftSchedule.nextReset(regions[region], now, weekly); }
function datesAfter(now = Date.now(), count = 8) { return RiftSchedule.openings(regions[region], mode, now, count); }
function toast(message) {
  clearTimeout(toastTimer);
  el('toast').textContent = message;
  el('toast').hidden = false;
  toastTimer = setTimeout(() => { el('toast').hidden = true; }, 6500);
}
function remaining(date, now) {
  const minutes = Math.ceil((+date - now) / 60000);
  const hours = Math.floor(minutes / 60);
  return hours ? 'In ' + hours + 'h ' + minutes % 60 + 'm' : 'In ' + minutes + 'm';
}
function renderOpenings(dates, now) {
  if (!el('openings')) return;
  const key = +dates[0] + region + zoneMode + expanded;
  if (key !== rendered) {
    rendered = key;
    el('openings').replaceChildren(...dates.slice(0, expanded ? 8 : 4).map((date, index) => {
      const card = document.createElement('article');
      card.className = 'opening';
      const top = document.createElement('div');
      top.className = 'opening-top';
      const dateLabel = document.createElement('span');
      dateLabel.textContent = day(date).toUpperCase();
      const label = document.createElement('b');
      label.textContent = index ? '0' + (index + 1) : 'UP NEXT ↗';
      top.append(dateLabel, label);
      const time = document.createElement('time');
      time.dateTime = date.toISOString();
      time.textContent = clock(date);
      const bottom = document.createElement('span');
      bottom.dataset.at = String(+date);
      card.append(top, time, bottom);
      return card;
    }));
  }
  document.querySelectorAll('[data-at]').forEach(node => { node.textContent = remaining(new Date(Number(node.dataset.at)), now) + ' · Demo'; });
  el('schedule-note').textContent = region === 'asia' ? 'Asia timing pending · illustrative Global reference shown · ' + displayZone() : 'Example schedule · ' + displayZone() + ' · dates included';
}
function loadChecks(now) {
  if (mode !== 'reset' || !resetAfter(now) || !resetAfter(now, true)) return;
  try { checks = JSON.parse(read('checks-' + region, '{}')); } catch { checks = {}; }
  if (!checks || typeof checks !== 'object' || Array.isArray(checks)) checks = {};
  const dailyKey = resetAfter(now).toISOString();
  const weeklyKey = resetAfter(now, true).toISOString();
  if (checks.dailyBoundary !== dailyKey) {
    Object.keys(checks).filter(key => key.startsWith('daily-')).forEach(key => { delete checks[key]; });
    checks.dailyBoundary = dailyKey;
  }
  if (checks.weeklyBoundary !== weeklyKey) {
    Object.keys(checks).filter(key => key.startsWith('weekly-')).forEach(key => { delete checks[key]; });
    checks.weeklyBoundary = weeklyKey;
  }
  save('checks-' + region, JSON.stringify(checks));
  document.querySelectorAll('[data-check]').forEach(input => { input.checked = checks[input.dataset.check] === true; });
}
function tick() {
  const now = Date.now();
  const dates = datesAfter(now);
  const config = regions[region];
  const expired = config.validUntil && now >= Date.parse(config.validUntil);
  const enabled = dates.length > 0;
  const label = enabled ? (config.status === 'verified' ? 'SCHEDULED' : 'DEMO') : (expired ? 'EXPIRED' : 'PENDING');
  document.querySelectorAll('.hero-timer-label>span,.example-tag').forEach(node => node.textContent = label);
  el('calendar').disabled = !enabled;
  el('alert-open').disabled = !enabled;
  el('enable-alerts').disabled = !enabled;
  document.querySelectorAll('[data-check]').forEach(input => { input.disabled = !enabled; });
  if (el('clear-checklist')) el('clear-checklist').disabled = !enabled;
  if (!enabled) {
    ['hours','minutes','seconds'].forEach(id => { el(id).textContent = '--'; });
    el('next-time').textContent = expired ? 'Schedule expired — awaiting review' : 'Schedule awaiting verification';
    el('next-zone').textContent = config.name;
    if (activeAlerts) { activeAlerts = false; el('enable-alerts').textContent = 'Enable demo alerts'; el('alert-status').textContent = 'Alerts stopped: no usable schedule.'; }
    if (el('openings')) { const message = document.createElement('p'); message.className = 'pending-schedule'; message.textContent = 'No schedule is published for this service. Choose another service or check the sources.'; el('openings').replaceChildren(message); rendered = ''; }
    if (el('schedule-note')) el('schedule-note').textContent = 'No fallback to another region’s schedule.';
    ['daily-clock','weekly-clock'].forEach(id => { if (el(id)) el(id).textContent = 'Awaiting review'; });
    ['daily-date','weekly-date'].forEach(id => { if (el(id)) el(id).textContent = 'No verified schedule for ' + config.name; });
    if (el('berlin-time')) { el('berlin-time').textContent = '—'; el('london-time').textContent = '—'; }
    document.title = 'Schedule pending · Aion 2 Timer';
    return;
  }
  const seconds = Math.ceil((+dates[0] - now) / 1000);
  el('hours').textContent = String(Math.floor(seconds / 3600)).padStart(2, '0');
  el('minutes').textContent = String(Math.floor(seconds / 60) % 60).padStart(2, '0');
  el('seconds').textContent = String(seconds % 60).padStart(2, '0');
  el('next-time').textContent = clock(dates[0]) + ' · ' + day(dates[0]);
  el('next-zone').textContent = zoneShort(dates[0]) + ' / ' + config.name;
  renderOpenings(dates, now);
  if (el('berlin-time')) { el('berlin-time').textContent = clock(dates[0], 'Europe/Berlin') + ' ' + zoneShort(dates[0], 'Europe/Berlin'); el('london-time').textContent = clock(dates[0], 'Europe/London') + ' ' + zoneShort(dates[0], 'Europe/London'); }
  if (mode === 'reset') {
    const weekly = resetAfter(now, true);
    el('daily-clock').textContent = clock(dates[0]) + ' ' + zoneShort(dates[0]);
    el('daily-date').textContent = day(dates[0]) + ' · ' + displayZone();
    el('weekly-clock').textContent = weekly ? remaining(weekly, now) : 'Awaiting review';
    el('weekly-date').textContent = weekly ? clock(weekly) + ' · ' + day(weekly) + ' · ' + displayZone() : 'Beyond the reviewed schedule period';
    if (weekly && (checks.dailyBoundary !== resetAfter(now).toISOString() || checks.weeklyBoundary !== weekly.toISOString())) loadChecks(now);
  }
  document.title = [el('hours').textContent, el('minutes').textContent, el('seconds').textContent].join(':') + ' · ' + label + ' Aion 2 ' + (mode === 'reset' ? 'Reset' : 'Rift');
  if (activeAlerts) {
    const key = region + +dates[0];
    if (+dates[0] - now <= Number(el('lead').value) * 60000 && notified !== key) {
      notified = key;
      const message = label + ' ' + (mode === 'reset' ? 'reset' : 'rift') + ' at ' + clock(dates[0], deviceZone) + ' (' + deviceZone + '). ' + (config.status === 'verified' ? 'Check availability in game.' : 'Not verified game data.');
      toast(message);
      try { if ('Notification' in window && Notification.permission === 'granted') { const notification = new Notification(label + ' · Aion 2 reminder', {body:message,tag:key}); setTimeout(() => notification.close(),12000); } } catch { el('alert-status').textContent = 'Desktop alert failed. In-page alerts remain enabled.'; }
      if(el('sound').checked) playSound().catch(() => { el('alert-status').textContent = 'Sound blocked. Use Test to enable audio.'; });
    }
  }
}
function setRegion(value) {
  region = Object.hasOwn(regions, value) ? value : 'global';
  el('region').value = region;
  save('region', region);
  notified = '';
  if (mode === 'reset') loadChecks(Date.now());
  tick();
}
function setZone(value) {
  zoneMode = value;
  save('zone', value);
  document.querySelectorAll('[data-zone]').forEach(button => { const selected = button.dataset.zone === value; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); });
  tick();
}
el('region').addEventListener('change', () => setRegion(el('region').value));
document.querySelectorAll('[data-zone]').forEach(button => button.addEventListener('click', () => setZone(button.dataset.zone)));
if (el('expand-schedule')) el('expand-schedule').addEventListener('click', () => {
  expanded = !expanded;
  el('expand-schedule').textContent = expanded ? 'Show fewer −' : 'Full 24 hours ↗';
  el('expand-schedule').setAttribute('aria-expanded', String(expanded));
  tick();
});
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
el('alert-open').addEventListener('click', () => el('reminder-dialog').showModal());
el('image-guide-open').addEventListener('click', () => el('image-guide').showModal());
el('lead').value = ['5', '10', '15'].includes(read('lead', '5')) ? read('lead', '5') : '5';
el('lead').addEventListener('change', () => { save('lead', el('lead').value); notified = ''; tick(); });
el('sound').checked = read('sound', 'false') === 'true';
el('sound').addEventListener('change', () => save('sound', String(el('sound').checked)));
async function playSound() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) throw new Error('Audio not supported');
  if (!audio) audio = new Audio();
  await audio.resume();
  [523, 659, 784].forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + index * .13;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.001, start);
    gain.gain.linearRampToValueAtTime(.07, start + .025);
    gain.gain.exponentialRampToValueAtTime(.001, start + .65);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(start); oscillator.stop(start + .7);
  });
}
el('test-sound').addEventListener('click', () => playSound().then(() => toast('Sound test played.')).catch(() => toast('Sound is unavailable in this browser.')));
el('enable-alerts').addEventListener('click', async () => {
  if (activeAlerts) { activeAlerts = false; el('enable-alerts').textContent = 'Enable demo alerts'; el('alert-status').textContent = 'Demo alerts turned off.'; return; }
  el('enable-alerts').disabled = true;
  try {
    let permission = 'unsupported';
    if ('Notification' in window && window.isSecureContext) permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    activeAlerts = true; notified = '';
    el('enable-alerts').textContent = 'Turn off demo alerts';
    el('alert-status').textContent = permission === 'granted' ? 'Demo desktop alerts enabled. Keep this tab open; delivery may be delayed.' : 'Desktop permission unavailable or denied. In-page demo alerts enabled.';
    if (el('sound').checked) await playSound().catch(() => {});
    tick();
  } catch { el('alert-status').textContent = 'Could not enable alerts. Please try again.'; }
  finally { el('enable-alerts').disabled = false; }
});
function stamp(date) { return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
function makeCalendar(now = Date.now()) {
  const dates = datesAfter(now, mode === 'reset' ? 7 : 56);
  if(!dates.length) throw new Error('No usable schedule to export.');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Aion 2 Visual Design//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:DEMO Aion 2 ' + mode];
  function event(date, name, suffix) {
    lines.push('BEGIN:VEVENT', 'UID:demo-' + suffix + '-' + region + '-' + +date + '@aion2-rift-timer.com', 'DTSTAMP:' + stamp(new Date(now)), 'DTSTART:' + stamp(date), 'DTEND:' + stamp(new Date(+date + 60000)), 'SUMMARY:DEMO - ' + name, 'DESCRIPTION:Example data. Not a verified game schedule.', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:DEMO reminder - not verified game data', 'TRIGGER:-PT' + el('lead').value + 'M', 'END:VALARM', 'END:VEVENT');
  }
  dates.forEach(date => event(date, regions[region].name + (mode === 'reset' ? ' daily reset' : ' rift'), mode));
  if (mode === 'reset' && resetAfter(now, true)) event(resetAfter(now, true), regions[region].name + ' weekly reset', 'weekly');
  lines.push('END:VCALENDAR');
  const text = lines.join('\r\n') + '\r\n';
  return regions[region].status === 'verified' ? text.replaceAll('DEMO - ', '').replaceAll('DEMO Aion 2 ', 'Aion 2 ').replaceAll('DEMO reminder - not verified game data', 'Aion 2 scheduled reminder').replaceAll('Example data. Not a verified game schedule.', 'Schedule-based estimate. Check in-game availability.') : text;
}
el('calendar').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([makeCalendar()], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = (regions[region].status === 'verified' ? '' : 'DEMO-') + mode + '-' + region + '-7-days.ics'; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  toast('Downloaded available scheduled events. One-time import, not a subscription.');
});
document.querySelectorAll('[data-check]').forEach(input => input.addEventListener('change', () => { checks[input.dataset.check] = input.checked; save('checks-' + region, JSON.stringify(checks)); }));
if (el('clear-checklist')) el('clear-checklist').addEventListener('click', () => { document.querySelectorAll('[data-check]').forEach(input => { input.checked = false; checks[input.dataset.check] = false; }); save('checks-' + region, JSON.stringify(checks)); toast('Personal checks cleared.'); });
const plannedTools = {
  boss: { title: 'World boss timers', groups: [['Field bosses', 'Separate repeating schedules from random-channel spawns.'], ['Watcher Kaira', 'Check the anchor before showing a countdown.'], ['Siege bosses', 'Track each verified weekly window separately.']] },
  shugo: { title: 'Shugo Festival', groups: [['Next round', 'Add the hourly timer once the current schedule is verified.'], ['Your keys', 'Add a personal reward-key checklist.'], ['Games & rewards', 'Use real mini-game screenshots and confirmed reward rules.']] },
  siege: { title: 'Invasions & sieges', groups: [['Dimensional Invasion', 'Its own schedule, not a generic rift timer.'], ['Artifact Siege', 'A separate weekly-event page after verification.']] }
};
document.querySelectorAll('[data-tool]').forEach(button => button.addEventListener('click', () => {
  const tool = plannedTools[button.dataset.tool];
  el('tool-title').textContent = tool.title;
  el('tool-content').replaceChildren(...tool.groups.map(([title, text]) => { const article = document.createElement('article'); const h3 = document.createElement('h3'); h3.textContent = title; const p = document.createElement('p'); p.textContent = text; article.append(h3, p); return article; }));
  el('tool-dialog').showModal();
}));

el('device-zone').textContent = deviceZone.replaceAll('_', ' ');
setRegion(region);
setZone(zoneMode);
setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
