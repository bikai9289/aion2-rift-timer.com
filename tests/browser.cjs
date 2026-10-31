// Optional integration suite: install Playwright or point PLAYWRIGHT_MODULE at an existing runtime.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.TEST_URL || 'http://127.0.0.1:4320/';
const config = require('../src/data/schedules.json');
(async () => {
  const browser = await chromium.launch({ headless:true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE} : {}) });
  const context = await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai',reducedMotion:'reduce'});
  await context.addInitScript(() => { Object.defineProperty(window,'Notification',{configurable:true,value:class {static permission='denied';}}); });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+m.location().url);});
  const output = path.resolve('test-results'); fs.mkdirSync(output,{recursive:true});
  for(const route of ['', 'rift-timer/europe/', 'rift-timer/asia/', 'reset-timer/', 'sources/', 'credits/', 'privacy/']) {
    assert.equal((await page.goto(new URL(route,base).href)).status(),200);
    if(route.includes('asia')) {
      await page.getByText('Schedule awaiting verification',{exact:true}).waitFor();
      assert.equal(await page.locator('#calendar').isDisabled(),true);
    } else if(!['sources/','credits/','privacy/'].includes(route)) {
      if(route==='reset-timer/') { await page.locator('#next-time').filter({hasText:/awaiting|\d{2}:/}).waitFor(); await page.locator('#region').selectOption('global'); }
      await page.locator('#seconds').filter({hasText:/^\d\d$/}).waitFor();
    }
    for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow at '+width);
    }
  }
  await page.goto(base);
  await page.locator('#seconds').filter({hasText:/^\d\d$/}).waitFor();
  await page.locator('#region').selectOption('global');
  await page.locator('#expand-schedule').click(); assert.equal(await page.locator('.opening').count(),8);
  await page.locator('[data-zone="utc"]').click(); assert.match(await page.locator('#schedule-note').textContent(),/UTC/);
  await page.locator('[data-scene="fire"]').click(); assert.match(await page.locator('#hero-scene').getAttribute('src'),/Bg4/);
  await page.locator('[data-scene="rift"]').click();
  await page.locator('#alert-open').click();
  await page.locator('#lead').selectOption('15');
  await page.locator('#enable-alerts').click(); assert.match(await page.locator('#alert-status').textContent(),/denied/);
  await page.locator('#enable-alerts').click(); await page.keyboard.press('Escape');
  const waitDownload = page.waitForEvent('download'); await page.locator('#calendar').click();
  const download = await waitDownload; const ics = fs.readFileSync(await download.path(),'utf8');
  assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,56); assert.equal((ics.match(/TRIGGER:-PT15M/g)||[]).length,56);
  await page.locator('#region').selectOption('asia');
  assert.equal(await page.locator('#hours').textContent(),'--');
  assert.equal(await page.locator('#calendar').isDisabled(),true);
  assert.equal(await page.locator('#alert-open').isDisabled(),true);
  assert.match(await page.locator('#reset-countdown').textContent(),/--/);
  await page.locator('#region').selectOption('global');
  await page.locator('[data-zone="local"]').click();
  await page.locator('#expand-schedule').click();
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>{document.querySelectorAll('img[loading="lazy"]').forEach(i=>i.loading='eager');});
  await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
  await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
  await page.goto(new URL('reset-timer/',base).href);
  await page.locator('#seconds').filter({hasText:/^\d\d$/}).waitFor();
  await page.locator('[data-check="daily-entries"]').check(); await page.reload();
  await page.locator('#seconds').filter({hasText:/^\d\d$/}).waitFor();
  assert.equal(await page.locator('[data-check="daily-entries"]').isChecked(),true);
  await page.locator('#region').selectOption('asia');
  assert.equal(await page.locator('[data-check="daily-entries"]').isDisabled(),true);
  await page.locator('#region').selectOption('global');
  await page.locator('#clear-checklist').click(); assert.equal(await page.locator('[data-check="daily-entries"]').isChecked(),false);
  // Server errors must not silently leave a forever-loading or fabricated countdown.
  const faultContext = await browser.newContext(); const fault = await faultContext.newPage();
  await fault.route('**/data/schedules.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await fault.goto(base); await fault.locator('.load-error').waitFor();
  assert.equal(await fault.locator('#calendar').isDisabled(),true);
  await fault.unroute('**/data/schedules.json'); await fault.getByRole('button',{name:'Retry',exact:true}).click();
  await fault.locator('#seconds').filter({hasText:/^\d\d$/}).waitFor();
  // Invalid data and expired data are separate, observable states.
  const invalid = structuredClone(config); invalid.regions.global.zone='Invalid/Timezone';
  await fault.route('**/data/schedules.json',route=>route.fulfill({json:invalid}));
  await fault.reload(); await fault.locator('.load-error').waitFor(); assert.match(await fault.locator('.load-error').textContent(),/CONFIG_TIMEZONE/);
  await fault.unroute('**/data/schedules.json');
  const expired = structuredClone(config); expired.regions.global.validUntil='2020-01-01T00:00:00Z';
  await fault.route('**/data/schedules.json',route=>route.fulfill({json:expired}));
  await fault.reload(); await fault.getByText('Schedule expired — awaiting review',{exact:true}).waitFor();
  assert.equal(await fault.locator('#alert-open').isDisabled(),true);
  const alias = await context.request.get(new URL('rift-timer/eu/',base).href,{maxRedirects:0}); assert.equal(alias.status(),301);
  assert.equal((await context.request.get(new URL('missing-page',base).href)).status(),404);
  assert.deepEqual(errors,[]);
  const result={status:'passed',pages:7,widths:[320,390,768,1440],checks:['Built site has no runtime/console errors','Pending region disables schedule/calendar/alerts/checklist','Scenes, zones and 4/8 openings','Denied permission fallback','ICS 56 events with selected alarms','Checklist persistence','Data HTTP failure and retry','Invalid configuration error','Expired schedule state','EU redirect and 404'],screenshots:['desktop.png','mobile.png']};
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
