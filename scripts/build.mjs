import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { validate } = require('../src/scripts/schedule-core.js');
const data = validate(JSON.parse(fs.readFileSync(path.join(root, 'src/data/schedules.json'), 'utf8')));
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, 'public'), out, { recursive: true });
fs.mkdirSync(path.join(out, 'data'), { recursive: true });
fs.copyFileSync(path.join(root, 'src/data/schedules.json'), path.join(out, 'data/schedules.json'));
for (const file of ['cinematic.css', 'utility.css']) fs.copyFileSync(path.join(root, 'src/styles', file), path.join(out, file));
fs.copyFileSync(path.join(root, 'src/scripts/schedule-core.js'), path.join(out, 'schedule-core.js'));
const engine = fs.readFileSync(path.join(root, 'src/scripts/engine.js'), 'utf8');
const cinema = fs.readFileSync(path.join(root, 'src/scripts/cinematic.js'), 'utf8');
fs.writeFileSync(path.join(out, 'app.js'), `/* Aion 2 Rift Timer. See /credits/ for provenance. */\n(async function boot(){\nconst APP_ROOT = new URL('.', document.currentScript.src);\ntry {\nconst response = await fetch(new URL('data/schedules.json', APP_ROOT), {cache:'no-cache'});\nif(!response.ok) throw new Error('CONFIG_HTTP: Schedule data could not be loaded.');\nconst scheduleData = RiftSchedule.validate(await response.json());\n${engine}\nif(document.getElementById('hero-scene')) {\n${cinema}\n}\n} catch(error) { console.error(error); document.querySelectorAll('.digits strong').forEach(node=>node.textContent='--'); const target=document.getElementById('next-time');if(target)target.textContent='Schedule unavailable';document.querySelectorAll('#calendar,#alert-open,#enable-alerts').forEach(button=>button.disabled=true);const panel=document.createElement('div');panel.className='load-error';panel.setAttribute('role','alert');const message=document.createElement('p');message.textContent='Could not load schedule data. '+(error.code||'LOAD_FAILED');const retry=document.createElement('button');retry.type='button';retry.textContent='Retry';retry.onclick=()=>location.reload();panel.append(message,retry);document.querySelector('main').prepend(panel);}\n})();`);
const routes = ['index.html', 'rift-timer/europe/index.html', 'rift-timer/asia/index.html', 'reset-timer/index.html'];
for (const route of routes) {
  const prefix = '../'.repeat(route.split('/').length - 1);
  let html = fs.readFileSync(path.join(root, 'src/pages', route), 'utf8');
  html = html.replace(/<script src="[^"]*(?:engine|cinematic)\.js" defer><\/script>/g, '');
  html = html.replace('</head>', `<script src="${prefix}schedule-core.js" defer></script><script src="${prefix}app.js" defer></script><link rel="manifest" href="${prefix}manifest.json"><link rel="canonical" href="https://aion2-rift-timer.com/${route.replace('index.html', '')}"></head>`);
  if (data.publication.enabled) html = html.replace('<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="index,follow">');
  html = html.replace(/href="RESEARCH\.md"/g, `href="${prefix}credits/"`);
  html = html.replace('</body>', `<noscript><p class="noscript">JavaScript is required for live countdowns. View <a href="${prefix}sources/">schedule sources and status</a>.</p></noscript></body>`);
  const target = path.join(out, route); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, html);
}
function infoPage(title, content) { return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${data.publication.enabled ? 'index,follow' : 'noindex,nofollow'}"><title>${title} · Aion 2 Rift Timer</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../utility.css"></head><body><main class="container info-page"><a href="../">← Aion 2 Rift Timer</a><h1>${title}</h1>${content}</main></body></html>`; }
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const sourceRows = Object.entries(data.regions).map(([id, config]) => `<tr><td>${escape(config.name)}</td><td>${escape(config.status)}</td><td>${config.reviewedAt ? escape(config.reviewedAt) : 'Not independently checked'}</td><td>${escape(config.zone)}</td><td>${config.rift ? escape(config.rift.anchorUtc) + ' + every ' + config.rift.intervalMinutes + ' minutes' : 'Not published'}</td><td>${config.reset ? String(config.reset.dailyHourUTC).padStart(2,'0') + ':00 UTC daily; ' + ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][config.reset.weeklyDayUTC] + ' UTC weekly' : 'Not published'}</td></tr>`).join('');
const info = {
  sources: infoPage('Sources & schedule status', `<p>This tool calculates a schedule, not live server status. Each service’s configuration and review status are listed below. Pending services never use a different region’s schedule.</p><table><thead><tr><th>Service</th><th>Status</th><th>Review</th><th>Display zone</th><th>Rift UTC anchor & cycle</th><th>Reset reference</th></tr></thead><tbody>${sourceRows}</tbody></table><h2>References</h2><ul>${data.sources.map(source => `<li><a href="${escape(source.url)}" target="_blank" rel="noopener">${escape(source.title)}</a></li>`).join('')}</ul><p>Provisional references are not in-game verification. Data configuration updated ${escape(data.updatedAt)}. Official and in-game notices take priority.</p>`),
  credits: infoPage('Credits & artwork', `<p>Original project: <a href="https://github.com/dburr/TimeLord">TimeLord by dburr</a>. Fork: <a href="https://github.com/bikai9289/TimeLord-aion2rifttimer">TimeLord-aion2rifttimer</a>.</p><p>The original work declares <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. This adaptation retains that notice. Third-party game artwork is separately owned; the code license does not grant rights to it.</p><h2>Artwork</h2><p>Aion 2 promotional artwork © NC Corporation / NCSOFT, from the <a href="https://aion2.ncsoft.jp/en/contents">official Aion 2 special site</a>. Used in local preview; public-release rights have not been confirmed. These are promotional scenes, not observed portal or reset screenshots.</p><p><a href="../art-sources.json">Asset source manifest</a> · <a href="../sources/">Schedule sources</a></p>`),
  privacy: infoPage('Privacy', '<p>No analytics, advertisements, accounts, cookies or server-side tracking are included. Preferences and checklist entries are stored in localStorage on your device. Notification permission is optional. Downloads are generated locally. No gameplay or account data is requested.</p><p>Clearing site storage removes your saved preferences. Your hosting provider may keep ordinary request logs according to its own policy.</p>')
};
for (const [name, html] of Object.entries(info)) { fs.mkdirSync(path.join(out, name), { recursive: true }); fs.writeFileSync(path.join(out, name, 'index.html'), html); }
fs.writeFileSync(path.join(out, '404.html'), infoPage('Page not found', '<p>This crossing does not exist. <a href="/">Return to the timer</a>.</p>').replace('href="../utility.css"','href="/utility.css"'));
fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: https://aion2-rift-timer.com/sitemap.xml\n');
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${data.publication.enabled ? routes.map(route => `<url><loc>https://aion2-rift-timer.com/${route.replace('index.html', '')}</loc><lastmod>${data.updatedAt.slice(0,10)}</lastmod></url>`).join('') : ''}</urlset>`);
fs.writeFileSync(path.join(out, '_redirects'), '/rift-timer/eu /rift-timer/europe/ 301\n/rift-timer/eu/ /rift-timer/europe/ 301\n');
fs.writeFileSync(path.join(out, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'\n${data.publication.enabled ? '' : '  X-Robots-Tag: noindex, nofollow\n'}/data/*\n  Cache-Control: public, max-age=0, must-revalidate\n`);
console.log(`Built ${routes.length} tool pages + 3 information pages in dist/. Publication: ${data.publication.enabled ? 'enabled' : 'pre-release (noindex)'}.`);
