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
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');assert.doesNotMatch(sitemap,/\/zh-Hant\/|\/ko\/|\/credits\/|\/privacy\//);assert.equal((sitemap.match(/<url>/g)||[]).length,17);assert.doesNotMatch(html(''),/'@type':'BreadcrumbList'|"@type":"BreadcrumbList"/);assert.match(html('rift-timer/korea/'),/hreflang="ko"/);
});
