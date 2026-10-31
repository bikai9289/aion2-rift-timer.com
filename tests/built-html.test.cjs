const{test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const{execFileSync}=require('node:child_process');
execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'pipe'});
const html=route=>fs.readFileSync('dist/'+route+'index.html','utf8');
const routes=['','reset-timer/','rift-timer/europe/','rift-timer/asia/','rift-timer/korea/','rift-timer/taiwan/','shugo-festival/','dimensional-invasion/','battlefield/','artifact-siege/','world-boss-timer/','abyss-outland/','argo-spirit-king/','rift-domination/'];
test('all tools have static numeric schedules and native links without planned template leftovers',()=>{
 for(const route of routes){const text=html(route);assert.match(text,/data-static-schedule/);assert.match(text,/class="data-table published-hours"/);assert.doesNotMatch(text,/data-tool=|tool-dialog|LATER, WHEN THE DATA IS READY|Planned only/);for(const target of['shugo-festival/','dimensional-invasion/','battlefield/','artifact-siege/','world-boss-timer/','abyss-outland/','argo-spirit-king/','rift-domination/'])assert.ok(text.includes('href="/'+target+'"'),route+' missing '+target);assert.equal((text.match(/rel="icon"/g)||[]).length,1);}
 assert.match(html(''),/every three|three-hour cycle/);assert.match(html(''),/eight published openings/);
});
test('service-exclusive routes default to supported services with no EU identity',()=>{
 for(const[route,service]of[['abyss-outland/','korea'],['argo-spirit-king/','korea'],['rift-domination/','taiwan']]){const text=html(route);assert.match(text,new RegExp('data-page-region="'+service+'"'));assert.match(text,new RegExp('data-schedule-services="'+service+'"'));assert.doesNotMatch(text,/<span>EU<\/span>|data-screen-label="EUROPE/);assert.match(text,/<option value="(?:korea|taiwan)" selected>/);}
 assert.match(html('rift-timer/korea/'),/id="confidence-badge" data-grade="official">Official/);assert.match(html('reset-timer/'),/id="confidence-badge" data-grade="community-agreed">Community-agreed/);
});
test('visible H1 matches the tool, sitemap is focused and homepage does not have one-item breadcrumbs',()=>{
 for(const[route,phrase]of[['','Aion 2'],['reset-timer/','Reset Timer'],['rift-timer/europe/','Europe'],['rift-timer/korea/','Korea'],['rift-timer/taiwan/','Taiwan']]){const h1=html(route).match(/<h1>([\s\S]*?)<\/h1>/)[1];assert.ok(h1.includes(phrase));assert.doesNotMatch(h1,/sr-only/);}
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');assert.doesNotMatch(sitemap,/\/zh-Hant\/|\/ko\/|\/credits\/|\/privacy\//);assert.equal((sitemap.match(/<url>/g)||[]).length,17);assert.doesNotMatch(html(''),/'@type':'BreadcrumbList'|"@type":"BreadcrumbList"/);assert.doesNotMatch(html('rift-timer/korea/'),/hreflang|language-links/);
});
test('retired language routes have no links, alternates or offline precache; Korean/Taiwan copy is specific',()=>{
 for(const route of routes)assert.doesNotMatch(html(route),/hreflang|language-links|href="\/(?:ko|zh-Hant)\//);
 assert.equal(fs.existsSync('dist/ko'),false);assert.equal(fs.existsSync('dist/zh-Hant'),false);assert.doesNotMatch(fs.readFileSync('dist/sw.js','utf8'),/\/zh-Hant\/|\/ko\//);
 for(const service of['korea','taiwan'])assert.doesNotMatch(html('rift-timer/'+service+'/'),/EU schedule\. Local time/);
 assert.match(html('rift-timer/korea/'),/Cycle · Official \/ Entry window · Community-reported/);
 assert.match(html('rift-timer/taiwan/'),/Cycle · Official \/ Entry window · Official/);
 const boss=html('world-boss-timer/');for(const name of['Executor Tamasa','Executor Argo','Executor Kaira'])assert.match(boss,new RegExp('<td>'+name+'</td>'));
 assert.match(html('abyss-outland/'),/≈ 150 min window · ≈ 30 min per match/);
 assert.match(html('credits/'),/Publication permission has not been established/);
});
test('public release has no robots meta on all nineteen pages and no obsolete i18n dependency',()=>{
 const all=[...routes,'rift-timer/location/','rift-timer/quests/','sources/','credits/','privacy/'];assert.equal(all.length,19);
 for(const route of all){const text=html(route);assert.doesNotMatch(text,/<meta\b[^>]*name=["']robots["']/i,route);assert.doesNotMatch(text,/i18n\.js|>Disputed</,route);}
 assert.equal(fs.existsSync('dist/i18n.js'),false);assert.doesNotMatch(fs.readFileSync('dist/sw.js','utf8'),/i18n\.js/);assert.doesNotMatch(fs.readFileSync('dist/_headers','utf8'),/X-Robots-Tag/);
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<lastmod>2026-10-31<\/lastmod>/g)||[]).length,17);
 assert.match(html(''),/<noscript>[\s\S]*?timetable above remains readable without it/);
});
