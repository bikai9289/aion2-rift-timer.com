const{test}=require('node:test');const assert=require('node:assert/strict');const core=require('../src/scripts/schedule-core.js');const data=require('../src/data/schedules.json');
const ms=Date.parse,rule=(id,event='rift',profile='regional',group=1)=>core.resolve(data.regions[id],event,profile,group);
test('v2 validates each event independently, including all referenced sources',()=>{assert.equal(core.validate(data),data);for(const[change,code]of[
 [d=>d.regions.korea.events.rift.zone='Fake/Zone','CONFIG_TIMEZONE'],
 [d=>d.regions.korea.events.rift.hours=[2,2],'CONFIG_HOURS'],
 [d=>d.regions.korea.events.rift.minute=60,'CONFIG_RECURRENCE'],
 [d=>d.regions.korea.events.rift.weekdays=[7],'CONFIG_RECURRENCE'],
 [d=>d.regions.korea.events.rift.entryMinutes=61,'CONFIG_DURATION'],
 [d=>d.regions.korea.events.rift.sourceIds=['absent'],'CONFIG_SOURCE_REFERENCE'],
 [d=>d.regions.korea.events.rift.sourceIds=['shugo'],'CONFIG_OFFICIAL_EVIDENCE'],
 [d=>d.regions.korea.events.rift.validUntil='2026-02-30T00:00:00Z','CONFIG_REVIEW_DATE'],
 [d=>d.regions.korea.events.rift.groupOffsets=[0,-1],'CONFIG_GROUP'],
 [d=>d.regions.korea.events.rift.variants={bad:{zone:'bad'}},'CONFIG_TIMEZONE'],
 [d=>d.sources[0].url='javascript:alert(1)','CONFIG_SOURCE_URL'],
 [d=>d.publication.enabled=true,'PUBLICATION_NOT_READY']
 ]){const copy=structuredClone(data);change(copy);assert.throws(()=>core.validate(copy),e=>e.code===code);}});
test('KR/TW service-local 02/05/... hours; old UTC anchors differ only by whole cycles',()=>{
 for(const[id,start,anchor]of[['korea','2026-10-30T15:00:00Z',2*3600000],['taiwan','2026-10-30T16:00:00Z',0]]){
  const now=ms(start),r=rule(id),dates=core.openings(r,now,8);assert.deepEqual(dates.map(d=>core.parts(+d,r.zone).hour),[2,5,8,11,14,17,20,23]);
  const next=anchor+(Math.floor((now-anchor)/10800000)+1)*10800000;
  assert.deepEqual(dates.map(Number),Array.from({length:8},(_,i)=>next+i*10800000));
 }
});
test('Europe local schedule changes its UTC instant after DST, unlike the old fixed UTC rule',()=>{
 assert.equal(core.openings(rule('europe'),ms('2026-10-23T23:59:59Z'),1)[0].toISOString(),'2026-10-24T00:00:00.000Z');
 assert.equal(core.openings(rule('europe'),ms('2026-10-31T23:59:59Z'),1)[0].toISOString(),'2026-11-01T01:00:00.000Z');
 assert.equal(core.openings(rule('europe','rift','utc'),ms('2026-10-31T23:59:59Z'),1)[0].toISOString(),'2026-11-01T00:00:00.000Z');
});
test('fall folds choose first occurrence; spring gaps are skipped rather than shifted',()=>{
 assert.deepEqual(core.localInstants({year:2026,month:10,day:25,hour:2,minute:0},'Europe/Berlin').map(n=>new Date(n).toISOString()),['2026-10-25T00:00:00.000Z','2026-10-25T01:00:00.000Z']);
 assert.equal(core.openings(rule('europe'),ms('2026-10-25T00:01:00Z'),1)[0].toISOString(),'2026-10-25T04:00:00.000Z');
 assert.deepEqual(core.localInstants({year:2027,month:3,day:28,hour:2},'Europe/Berlin'),[]);
 assert.equal(core.openings(rule('europe'),ms('2027-03-28T00:01:00Z'),1)[0].toISOString(),'2027-03-28T03:00:00.000Z');
});
test('NA November DST changes local-clock interpretation but fixed-clock alternatives remain distinct',()=>{
 assert.equal(core.openings(rule('na-east'),ms('2026-11-01T03:01:00Z'),1)[0].toISOString(),'2026-11-01T07:00:00.000Z');
 assert.equal(core.openings(rule('na-east','rift','unified'),ms('2026-11-01T03:01:00Z'),1)[0].toISOString(),'2026-11-01T06:00:00.000Z');
});
test('MetaBot UTC+9 midnight and Atlas UTC midnight are identical three-hour cycles; NA agrees before DST',()=>{
 const now=ms('2026-10-30T04:00:00Z');
 assert.deepEqual(core.openings(rule('europe','rift','unified'),now,56).map(Number),core.openings(rule('europe','rift','utc'),now,56).map(Number));
 assert.deepEqual(core.openings(rule('na-east'),now,8).map(Number),core.openings(rule('na-east','rift','utc'),now,8).map(Number));
});
test('reset schedule has its own evidence and remains UTC 07 across Global regions',()=>{
 for(const id of['europe','na-east','latam','asia'])assert.equal(core.openings(rule(id,'daily-reset'),ms('2026-11-04T06:59:59Z'),1)[0].toISOString(),'2026-11-04T07:00:00.000Z');
 assert.equal(core.openings(rule('korea','weekly-reset'),ms('2026-11-02T00:00:00Z'),1)[0].toISOString(),'2026-11-03T20:00:00.000Z');
 assert.equal(core.openings(rule('taiwan','weekly-reset'),ms('2026-11-02T00:00:00Z'),1)[0].toISOString(),'2026-11-03T21:00:00.000Z');
 assert.equal(rule('europe','daily-reset').confidence,'community-agreed');assert.equal(rule('europe').confidence,'disputed');
});
test('three phases have exact boundaries and Taiwan uses its own 15-minute entry',()=>{
 const at=ms('2026-11-01T02:00:00Z'),kr=rule('korea');
 assert.equal(core.state(kr,at-1).phase,'upcoming');assert.equal(core.state(kr,at).phase,'entry');
 assert.equal(+core.state(kr,at).target,at+600000);assert.equal(core.state(kr,at+600000).phase,'active');
 assert.equal(core.state(kr,at+3600000).phase,'upcoming');
 const tw=rule('taiwan'),twAt=ms('2026-11-01T00:00:00Z');assert.equal(core.state(tw,twAt+600000).phase,'entry');assert.equal(+core.state(tw,twAt).target,twAt+900000);
});
test('hourly events, weekdays and matching-group rules are explicit',()=>{
 const now=ms('2026-11-04T11:00:00Z');
 assert.equal(core.openings(rule('korea','shugo'),now,1)[0].getUTCMinutes(),0);
 assert.equal(core.openings(rule('korea','invasion'),now,1)[0].getUTCMinutes(),30);
 for(const[g,time]of[[1,'12:20'],[2,'12:50'],[3,'13:20']])assert.equal(core.openings(rule('korea','artifact','regional',g),now,1)[0].toISOString(),'2026-11-04T'+time+':00.000Z');
 assert.equal(core.openings(rule('taiwan','artifact'),now,1)[0].toISOString(),'2026-11-04T13:30:00.000Z');
 assert.equal(rule('taiwan','battlefield'),null);assert.equal(rule('europe','argo'),null);assert.equal(rule('korea','domination'),null);
});
test('all 13 categories are represented without fabricating unsupported region schedules',()=>{assert.equal(Object.keys(data.events).length,13);assert.ok(rule('korea','outland'));assert.ok(rule('korea','argo'));assert.ok(rule('taiwan','domination'));assert.equal(core.openings(null,Date.now()).length,0);});
test('expired evidence stops occurrences, and counts/ranges are validated',()=>{
 const expired={...rule('korea'),validUntil:'2026-11-01T02:00:00Z'};
 assert.equal(core.state(expired,ms('2026-11-01T02:00:00Z')).phase,'expired');assert.deepEqual(core.openings(expired,ms('2026-11-01T02:00:00Z')),[]);
 assert.throws(()=>core.openings(rule('korea'),NaN),{code:'INVALID_RANGE'});assert.throws(()=>core.openings(rule('korea'),Date.now(),337),{code:'INVALID_RANGE'});
});
