/* Service-local scheduling. A named wall-clock time is resolved separately on every date. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RiftSchedule=factory();})(globalThis,function(){
  'use strict';
  const DAY=86400000, MINUTE=60000, formatters=new Map(), occurrenceCache=new Map();
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
  const record=value=>value&&typeof value==='object'&&!Array.isArray(value);
  const timestamp=value=>typeof value==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().replace('.000Z','Z')===value.replace('.000Z','Z');
  function fail(code,message){const error=new Error(message);error.code=code;throw error;}
  function zoneValid(zone){try{if(typeof zone!=='string'||!zone)throw Error();new Intl.DateTimeFormat('en',{timeZone:zone}).format();return true;}catch{return false;}}
  function range(value,min,max){return Number.isInteger(value)&&value>=min&&value<=max;}
  function validate(data){
    if(!record(data)||data.version!==2||!timestamp(data.updatedAt))fail('CONFIG_FORMAT','Unsupported or invalid schedule data.');
    if(!record(data.publication)||typeof data.publication.enabled!=='boolean'||typeof data.publication.artworkCleared!=='boolean')fail('CONFIG_PUBLICATION','Publication settings are incomplete.');
    if(!Array.isArray(data.sources)||!record(data.regions)||!record(data.events))fail('CONFIG_REQUIRED','Sources, regions and events are required.');
    const ids=new Set();
    for(const source of data.sources){
      if(!record(source)||typeof source.id!=='string'||!source.id||typeof source.title!=='string'||!source.title||!['official','community','observation'].includes(source.type))fail('CONFIG_SOURCE','Invalid source metadata.');
      try{if(new URL(source.url).protocol!=='https:')throw Error();}catch{fail('CONFIG_SOURCE_URL','Source URLs must use HTTPS.');}
      if(ids.has(source.id))fail('CONFIG_SOURCE_DUPLICATE','Duplicate source identifier.');ids.add(source.id);
    }
    function sourceRefs(list){if(!Array.isArray(list)||!list.length||list.some(id=>!ids.has(id)))fail('CONFIG_SOURCE_REFERENCE','An event references an unknown source.');}
    function validateRule(rule,variant=false){
      if(!record(rule)||!zoneValid(rule.zone))fail('CONFIG_TIMEZONE','Unknown event time zone.');
      if(!Array.isArray(rule.hours)||!rule.hours.length||rule.hours.length>24||new Set(rule.hours).size!==rule.hours.length||rule.hours.some(h=>!range(h,0,23)))fail('CONFIG_HOURS','Event hours must be unique integers from 0 to 23.');
      if(!range(rule.minute,0,59)||!Array.isArray(rule.weekdays)||!rule.weekdays.length||new Set(rule.weekdays).size!==rule.weekdays.length||rule.weekdays.some(d=>!range(d,0,6)))fail('CONFIG_RECURRENCE','Invalid minute or local weekday.');
      if(!range(rule.durationMinutes,0,1440)||rule.entryMinutes!==undefined&&(!range(rule.entryMinutes,1,1440)||rule.entryMinutes>rule.durationMinutes))fail('CONFIG_DURATION','Entry and event durations are inconsistent.');
      if(!['official','community-agreed','community-reported','disputed','pending'].includes(rule.confidence))fail('CONFIG_CONFIDENCE','Unknown evidence grade.');
      if(!timestamp(rule.checkedAt)||rule.validUntil!==null&&!timestamp(rule.validUntil))fail('CONFIG_REVIEW_DATE','Evidence needs valid review/expiry dates.');
      if(!['first','both'].includes(rule.fold))fail('CONFIG_DST_POLICY','DST fold policy must be explicit.');
      sourceRefs(rule.sourceIds);
      if(rule.confidence==='official'&&!rule.sourceIds.some(id=>data.sources.find(source=>source.id===id)?.type==='official'))fail('CONFIG_OFFICIAL_EVIDENCE','Official badge requires an official source.');
      if(rule.groupOffsets&&(!Array.isArray(rule.groupOffsets)||!rule.groupOffsets.length||rule.groupOffsets.length>3||rule.groupOffsets.some(n=>!range(n,0,180))))fail('CONFIG_GROUP','Invalid matching-group offset.');
      if(rule.durationByHour&&(!record(rule.durationByHour)||Object.entries(rule.durationByHour).some(([h,n])=>!rule.hours.includes(Number(h))||!range(n,0,1440))))fail('CONFIG_DURATION','Invalid per-window duration.');
      if(!variant&&rule.variants){if(!record(rule.variants))fail('CONFIG_VARIANTS','Invalid alternative schedules.');for(const alternative of Object.values(rule.variants))validateRule({...rule,...alternative,variants:undefined},true);}
    }
    for(const[id,event]of Object.entries(data.events))if(!/^[a-z][a-z-]*$/.test(id)||typeof event.name!=='string'||!event.name||typeof event.route!=='string'||!/^(?:[a-z][a-z0-9-]*\/)*$/.test(event.route))fail('CONFIG_EVENT','Invalid event definition or internal route.');
    for(const[id,region]of Object.entries(data.regions)){
      if(!/^[a-z][a-z-]*$/.test(id)||!region.name||!zoneValid(region.zone)||!record(region.events))fail('CONFIG_REGION','Invalid region metadata.');
      for(const[eventId,rule]of Object.entries(region.events)){if(!own(data.events,eventId))fail('CONFIG_EVENT_REFERENCE','Unknown event identifier.');if(rule!==null)validateRule(rule);}
    }
    if(!own(data.regions,'global')||!own(data.regions,'na-east'))fail('CONFIG_DEFAULT','Default service is missing.');
    if(data.publication.enabled&&!data.publication.artworkCleared)fail('PUBLICATION_NOT_READY','Artwork rights must be resolved before public indexing.');
    return data;
  }
  function parts(time,zone){
    if(!formatters.has(zone))formatters.set(zone,new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}));
    return Object.fromEntries(formatters.get(zone).formatToParts(time).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  }
  // All valid UTC instants for a wall-clock minute. Gaps are skipped; folds use the rule's explicit policy.
  function localInstants(fields,zone){
    const wall=Date.UTC(fields.year,fields.month-1,fields.day,fields.hour,fields.minute||0), offsets=new Set();
    for(const shift of[-DAY,0,DAY]){const sample=wall+shift,p=parts(sample,zone);offsets.add(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-sample);}
    const found=[];
    for(const offset of offsets){const candidate=wall-offset,p=parts(candidate,zone);if(p.year===fields.year&&p.month===fields.month&&p.day===fields.day&&p.hour===fields.hour&&p.minute===(fields.minute||0))found.push(candidate);}
    return [...new Set(found)].sort((a,b)=>a-b);
  }
  function resolve(region,eventId,profile='regional',group=1){
    const base=region?.events?.[eventId];if(!base)return null;
    const variant=profile==='regional'?null:base.variants?.[profile];
    const effective={...base,...variant};
    return {...effective,group:effective.groupOffsets?Math.min(range(Number(group),1,3)?Number(group):1,effective.groupOffsets.length):1,profile:variant?profile:'regional'};
  }
  function available(rule,now=Date.now()){return Boolean(rule&&rule.confidence!=='pending'&&(!rule.validUntil||now<Date.parse(rule.validUntil)));}
  function candidates(rule,now,count){
    const local=parts(now,rule.zone),start=Date.UTC(local.year,local.month-1,local.day);
    const days=Math.max(11,Math.ceil(count/(rule.hours.length*rule.weekdays.length))*7+4);
    const key=JSON.stringify([rule,start,days]);
    if(occurrenceCache.has(key))return occurrenceCache.get(key);
    const values=[];
    for(let offset=-2;offset<=days;offset++){
      const date=new Date(start+offset*DAY);if(!rule.weekdays.includes(date.getUTCDay()))continue;
      for(const hour of rule.hours){
        const groupOffset=rule.groupOffsets?.[Math.min((rule.group||1)-1,rule.groupOffsets.length-1)]||0;
        const wall=new Date(+date+(hour*60+rule.minute+groupOffset)*MINUTE);
        let instants=localInstants({year:wall.getUTCFullYear(),month:wall.getUTCMonth()+1,day:wall.getUTCDate(),hour:wall.getUTCHours(),minute:wall.getUTCMinutes()},rule.zone);
        if(rule.fold==='first')instants=instants.slice(0,1);
        for(const at of instants)if(!rule.validUntil||at<Date.parse(rule.validUntil))values.push({at,duration:rule.durationByHour?.[String(hour)]??rule.durationMinutes});
      }
    }
    const result=[...new Map(values.map(value=>[value.at,value])).values()].sort((a,b)=>a.at-b.at);
    if(occurrenceCache.size>64)occurrenceCache.clear();occurrenceCache.set(key,result);return result;
  }
  function checkRange(now,count){if(!Number.isFinite(now)||!Number.isFinite(new Date(now).getTime())||!range(count,1,336))fail('INVALID_RANGE','A valid timestamp and event count 1–336 are required.');}
  function openings(rule,now=Date.now(),count=8){checkRange(now,count);if(!available(rule,now))return[];return candidates(rule,now,count).filter(item=>item.at>now).slice(0,count).map(item=>new Date(item.at));}
  function state(rule,now=Date.now()){
    checkRange(now,1);if(!available(rule,now))return{phase:rule?.validUntil&&now>=Date.parse(rule.validUntil)?'expired':'unavailable',next:null,target:null,opening:null,entryCloses:null,ends:null};
    const list=candidates(rule,now,8),next=list.find(item=>item.at>now),previous=list.filter(item=>item.at<=now).at(-1);
    const ends=previous?previous.at+previous.duration*MINUTE:null,entry=previous&&rule.entryMinutes?previous.at+rule.entryMinutes*MINUTE:null;
    const active=previous&&previous.duration>0&&now<ends;
    return{phase:active?(entry&&now<entry?'entry':'active'):'upcoming',next:next?new Date(next.at):null,target:active?new Date(entry&&now<entry?entry:ends):(next?new Date(next.at):null),opening:active?new Date(previous.at):null,entryCloses:active&&entry?new Date(entry):null,ends:active?new Date(ends):null};
  }
  return{validate,parts,localInstants,resolve,available,openings,state};
});
