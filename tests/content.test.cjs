const{test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const content=require('../src/data/content.json'),data=require('../src/data/schedules.json'),site=require('../src/data/site.json');
test('lookup data contains ten distinct zones, fifty candidate positions, and fourteen faction quests',()=>{
 assert.equal(content.zones.length,10);assert.equal(new Set(content.zones.map(z=>z.map+'/'+z.zone)).size,10);assert.equal(content.zones.reduce((sum,z)=>sum+z.possibleSpots,0),50);
 assert.equal(content.quests.length,14);assert.equal(new Set(content.quests.map(q=>q.id)).size,14);for(const faction of['elyos','asmodian'])assert.equal(content.quests.filter(q=>q.faction===faction).length,7);
 for(const quest of content.quests){assert.equal(quest.level,45);assert.ok(quest.exp>0&&quest.kina>0);assert.equal(quest.wisdomStone,1);assert.equal(quest.daevanionCrystal,1);assert.ok(quest.title&&quest.accessory);assert.ok(quest.source.startsWith('https://metabot.gg/'));}
});
test('source grades do not mark single-source reports as community agreement',()=>{
 for(const region of Object.values(data.regions))for(const rule of Object.values(region.events))if(rule?.confidence==='community-agreed')assert.ok(rule.sourceIds.length>=2);
 assert.equal(data.sources.some(source=>source.url==='https://aion2-rifttimer.com/sources/'),false);
 assert.equal(new URL(site.url).protocol,'https:');assert.equal(site.indexing,true);
});
test('install manifest points to genuine 192px and 512px PNG icons',()=>{
 const manifest=require('../public/manifest.json');for(const size of[192,512]){const icon=manifest.icons.find(icon=>icon.sizes===size+'x'+size);assert.ok(icon);const bytes=fs.readFileSync('public'+icon.src);assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);}
});
