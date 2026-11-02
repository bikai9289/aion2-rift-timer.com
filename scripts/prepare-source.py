"""One-time migration of the approved V3 prototype. Normal builds never run this file."""
from pathlib import Path
import re
root = Path(__file__).resolve().parent.parent
engine = (root / 'designs/rift-cinematic-v3/engine.js').read_text(encoding='utf-8')
start = engine.index('// Every configuration')
end = engine.index('function read(')
engine = engine[:start] + 'const regions = scheduleData.regions;\n' + engine[end:]
engine = engine.replace("'rift-v2-'", "'aion-rift-'")
start = engine.index('function resetAfter(')
end = engine.index('function toast(')
engine = engine[:start] + '''function resetAfter(now, weekly = false) { return RiftSchedule.nextReset(regions[region], now, weekly); }
function datesAfter(now = Date.now(), count = 8) { return RiftSchedule.openings(regions[region], mode, now, count); }
''' + engine[end:]
engine = engine.replace("  if (mode !== 'reset') return;", "  if (mode !== 'reset' || !resetAfter(now) || !resetAfter(now, true)) return;")
start = engine.index('function tick() {')
end = engine.index('function setRegion(', start)
engine = engine[:start] + '''function tick() {
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
''' + engine[end:]
# Editing pictures is a design-review capability, not a production user flow.
start = engine.index('// User-provided images')
end = engine.index("el('device-zone').textContent", start)
engine = engine[:start] + engine[end:]
engine = engine.replace("  if (mode === 'reset') event(resetAfter(now, true), regions[region].name + ' weekly reset', 'weekly');", "  if (mode === 'reset' && resetAfter(now, true)) event(resetAfter(now, true), regions[region].name + ' weekly reset', 'weekly');")
engine = engine.replace("  const dates = datesAfter(now, mode === 'reset' ? 7 : 56);", "  const dates = datesAfter(now, mode === 'reset' ? 7 : 56);\n  if(!dates.length) throw new Error('No usable schedule to export.');")
# The export itself must reflect the reviewed status instead of permanently embedding DEMO.
engine = engine.replace("  return lines.join('\\r\\n') + '\\r\\n';", "  const text = lines.join('\\r\\n') + '\\r\\n';\n  return regions[region].status === 'verified' ? text.replaceAll('DEMO - ', '').replaceAll('DEMO Aion 2 ', 'Aion 2 ').replaceAll('DEMO reminder - not verified game data', 'Aion 2 scheduled reminder').replaceAll('Example data. Not a verified game schedule.', 'Schedule-based estimate. Check in-game availability.') : text;")
engine = engine.replace("a.download = 'DEMO-' + mode", "a.download = (regions[region].status === 'verified' ? '' : 'DEMO-') + mode")
engine = engine.replace("toast('Downloaded 7 days of DEMO events. One-time import, not a subscription.');", "toast('Downloaded available scheduled events. One-time import, not a subscription.');")
(root / 'src/scripts/engine.js').write_text(engine, encoding='utf-8')

cinema = (root / 'designs/rift-cinematic-v3/cinematic.js').read_text(encoding='utf-8')
cinema = cinema.replace("  document.querySelectorAll('[data-region-time]').forEach(node => { node.textContent = clock(next, node.dataset.regionTime); });", "  document.querySelectorAll('[data-region-time]').forEach(node => { node.textContent = next ? clock(next, node.dataset.regionTime) : '—'; });")
cinema = cinema.replace("  const remainingSeconds = Math.ceil((+resetAfter(now) - now) / 1000);", "  const reset = resetAfter(now);\n  const remainingSeconds = reset ? Math.ceil((+reset - now) / 1000) : 0;")
cinema = cinema.replace("  el('reset-countdown').textContent = [", "  el('reset-countdown').textContent = !reset ? '--:--:--' : [")
cinema = cinema.replace("String(regions[region].resetHour).padStart(2, '0') + ':00 UTC'", "(regions[region].reset ? String(regions[region].reset.dailyHourUTC).padStart(2, '0') + ':00 UTC' : 'awaiting review')")
(root / 'src/scripts/cinematic.js').write_text(cinema, encoding='utf-8')

for page in (root / 'src/pages').rglob('*.html'):
    text = page.read_text(encoding='utf-8')
    prefix = '../' * (len(page.relative_to(root / 'src/pages').parts) - 1)
    text = text.replace('DESIGN CONCEPT / 03', 'A FAN-MADE COMPANION').replace('DESIGN V3', 'A FAN-MADE COMPANION').replace('CINEMATIC EDITION', 'COMMUNITY SCHEDULES')
    text = text.replace('图片与设计说明 ↗', 'About & sources ↗').replace('图片与设计说明', 'About & sources')
    text = text.replace('Design preview', 'Provisional schedule').replace('design preview', 'pre-release tool').replace('design prototype', 'pre-release tool')
    text = text.replace('This design uses example times.', 'Current data is provisional and uses example times.')
    # Keep the approved layout while providing an actual descriptive H1 for the tool.
    text = text.replace('<h1>THE NEXT', '<h1><span class="sr-only">Aion 2 Rift Timer — </span>THE NEXT')
    text = re.sub(r'<div class="image-empty" hidden>.*?</div>', '', text)
    text = re.sub(r'<button class="replace-image"[^>]*>.*?</button>', '', text)
    text = re.sub(r'<input class="image-input"[^>]*>', '', text)
    start = text.find('<dialog id="image-guide">')
    end = text.find('</dialog>', start)
    if start >= 0:
        dialog = f'<dialog id="image-guide"><form method="dialog"><button class="dialog-close" aria-label="Close about this tool">×</button></form><span class="section-index">AION 2 RIFT TIMER</span><h2>Ready for the next crossing.</h2><p>An independent, account-free schedule tool. Current times are provisional; no live server connection or in-game verification is claimed.</p><p>Preferences stay on your device. Browser alerts require this tab open; calendar imports do not auto-update.</p><p><a href="{prefix}sources/">Schedule status ↗</a> · <a href="{prefix}credits/">Credits & artwork ↗</a> · <a href="{prefix}privacy/">Privacy ↗</a></p></dialog>'
        text = text[:start] + dialog + text[end+len('</dialog>'):]
    text = text.replace('This is a design preview using example schedules.', 'This tool currently uses provisional example schedules.')
    text = text.replace('Aion 2 Rift Timer design concept:', 'Aion 2 Rift Timer:')
    text = text.replace('EXAMPLE SCHEDULE · NOT LIVE SERVER STATUS', 'PROVISIONAL SCHEDULE · NOT LIVE SERVER STATUS')
    text = text.replace('Official Aion 2 artwork · illustrative scenes, not portal-location evidence.', 'Official Aion 2 artwork · illustrative scenes. Art © NC Corporation.')
    text = text.replace('ART · PREVIEW', 'ART · © NC CORPORATION')
    text = text.replace('Design notes ↗', 'Credits ↗')
    text = text.replace('Design preview · researched 31 October 2026.', 'Provisional schedule; not independently verified.')
    text = text.replace('Design preview with example schedules.', 'Provisional schedules with local-time conversion.')
    if '<footer' in text:
        text = text.replace('</footer>', f'<div class="site-legal"><a href="{prefix}credits/">TimeLord attribution & artwork</a><a href="{prefix}sources/">Schedule sources</a><a href="{prefix}privacy/">Privacy</a></div></footer>')
    page.write_text(text, encoding='utf-8')
print('Migrated approved pages and shared engine into src/.')
