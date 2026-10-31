'use strict';
const el=id=>document.getElementById(id), mode=document.body.dataset.mode, locale=document.documentElement.lang||'en';
const t=key=>key;
const HOUR=3600000, deviceZone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC', regions=scheduleData.regions;
const bossQuery=new URL(location.href).searchParams.get('event');
const pageEvent=document.body.dataset.eventGroup==='boss'&&['kaira','nahma','siege-bosses'].includes(bossQuery)?bossQuery:(document.body.dataset.event||(mode==='reset'?'daily-reset':'rift'));
function read(key,fallback){try{return localStorage.getItem('aion-rift-'+key)||fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem('aion-rift-'+key,value);}catch{}}
const pageDefault=document.body.dataset.pageRegion==='global'?'na-east':document.body.dataset.pageRegion;
const allowedServices=(document.body.dataset.scheduleServices||'').split(',').filter(Boolean);
let region=document.body.dataset.useStoredRegion==='true'?read('region',pageDefault):pageDefault;
if(region==='global'||!Object.hasOwn(regions,region)||allowedServices.length&&!allowedServices.includes(region))region=pageDefault||'na-east';
document.documentElement.classList.add('schedule-enhanced');
let zoneMode=read('zone','local');if(!['local','service','utc'].includes(zoneMode))zoneMode='local';
let profile=read('profile','regional');if(!['regional','unified','utc'].includes(profile))profile='regional';
let group=Number(read('group','1'));if(![1,2,3].includes(group))group=1;
let expanded=false,activeAlerts=false,notified='',audio,toastTimer,rendered='',checks={};
const baseLanguage=locale==='en'?'':locale+'/';
const pageURL=route=>new URL(baseLanguage+route,APP_ROOT).href;
const eventName=id=>t(scheduleData.events[id]?.name||id);
function selectedRule(id=pageEvent){return RiftSchedule.resolve(regions[region],id,profile,group);}
function displayZone(){return zoneMode==='local'?deviceZone:zoneMode==='service'?regions[region].zone:'UTC';}
function clock(date,zone=displayZone()){return new Intl.DateTimeFormat(locale,{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date);}
function day(date,zone=displayZone()){return new Intl.DateTimeFormat(locale,{timeZone:zone,weekday:'short',day:'numeric',month:'short'}).format(date);}
function zoneShort(date,zone=displayZone()){return new Intl.DateTimeFormat(locale,{timeZone:zone,timeZoneName:'short'}).formatToParts(date).find(p=>p.type==='timeZoneName').value;}
function datesAfter(now=Date.now(),count=8){return RiftSchedule.openings(selectedRule(),now,count);}
function resetAfter(now,weekly=false){return RiftSchedule.openings(selectedRule(weekly?'weekly-reset':'daily-reset'),now,1)[0]||null;}
function toast(message){clearTimeout(toastTimer);el('toast').textContent=message;el('toast').hidden=false;toastTimer=setTimeout(()=>el('toast').hidden=true,6500);}
function remaining(date,now){const mins=Math.max(0,Math.ceil((+date-now)/60000)),hours=Math.floor(mins/60);return hours?hours+'h '+mins%60+'m':mins+'m';}
const confidenceName=confidence=>t({'official':'Official','community-agreed':'Community-agreed','community-reported':'Community-reported','disputed':'Source disagreement','pending':'Pending'}[confidence]||'Pending');
const phaseName=phase=>t({entry:'Entry closes in',active:'Activity ends in',upcoming:'Next opening in',unavailable:'No published schedule for this service',expired:'Schedule expired'}[phase]||'Next opening in');
function interpretationName(rule){return confidenceName(rule?.confidence);}
function renderOpenings(dates,now,rule){
 if(!el('openings'))return;
 const key=(dates[0]?.getTime()||'none')+region+zoneMode+profile+group+expanded;
 if(key!==rendered){rendered=key;el('openings').replaceChildren(...dates.slice(0,expanded?8:4).map((date,index)=>{
  const card=document.createElement('article');card.className='opening';const top=document.createElement('div');top.className='opening-top';
  const label=document.createElement('span');label.textContent=day(date).toUpperCase();const tag=document.createElement('b');tag.textContent=index?'0'+(index+1):t('UP NEXT')+' ↗';top.append(label,tag);
  const time=document.createElement('time');time.dateTime=date.toISOString();time.textContent=clock(date);const caption=document.createElement('span');caption.dataset.at=String(+date);card.append(top,time,caption);return card;
 }));}
 document.querySelectorAll('[data-at]').forEach(node=>node.textContent=remaining(new Date(Number(node.dataset.at)),now)+' · '+confidenceName(rule.confidence));
 if(el('schedule-note'))el('schedule-note').textContent=confidenceName(rule.confidence)+' · '+displayZone()+' · '+rule.zone+' '+t('schedule clock');
}
function loadChecks(now){
 if(mode!=='reset')return;
 const daily=resetAfter(now),weekly=resetAfter(now,true);if(!daily||!weekly)return;
 try{checks=JSON.parse(read('checks-'+region,'{}'));}catch{checks={};}
 if(!checks||typeof checks!=='object'||Array.isArray(checks))checks={};
 for(const[prefix,boundary]of[['daily',daily],['weekly',weekly]])if(checks[prefix+'Boundary']!==boundary.toISOString()){Object.keys(checks).filter(k=>k.startsWith(prefix+'-')).forEach(k=>delete checks[k]);checks[prefix+'Boundary']=boundary.toISOString();}
 save('checks-'+region,JSON.stringify(checks));document.querySelectorAll('[data-check]').forEach(input=>input.checked=checks[input.dataset.check]===true);
}
function renderEvidence(rule){
 const badge=el('confidence-badge');if(badge){badge.textContent=interpretationName(rule);badge.dataset.grade=rule?.confidence||'pending';badge.title=rule?.confidence==='disputed'?t('Sources disagree about the schedule clock. Compare the published interpretations.') : confidenceName(rule?.confidence);}
 const evidence=el('rule-evidence');if(!evidence)return;
 evidence.replaceChildren();
 if(!rule){evidence.textContent=t('Not scheduled for this service');return;}
 const text=document.createElement('p');text.textContent=t(rule.note||'Published schedule estimate. Check availability in game.');evidence.append(text);
 if(rule.confidence==='disputed'){const disagreement=document.createElement('p');disagreement.textContent=t('Sources disagree about the schedule clock. Compare the published interpretations.');evidence.append(disagreement);}
 const review=document.createElement('p');review.textContent=t('Reviewed')+': '+rule.checkedAt.slice(0,10)+' · '+rule.zone;evidence.append(review);
 for(const id of rule.sourceIds){const source=scheduleData.sources.find(s=>s.id===id);if(source){const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener';a.textContent=source.title+' ↗';evidence.append(a);}}
}
function renderPhases(state,rule){
 if(!el('phase-panel'))return;
 el('phase-title').textContent=phaseName(state.phase);
 const start=state.opening||state.next;
 const values={opening:start,entry:start&&rule?.entryMinutes?new Date(+start+rule.entryMinutes*60000):null,end:state.ends||(start&&rule?.durationMinutes?new Date(+start+rule.durationMinutes*60000):null)};
 for(const key of['opening','entry','end'])el('phase-'+key).textContent=values[key]?clock(values[key])+' · '+day(values[key]):'—';
 el('phase-panel').dataset.phase=state.phase;if(rule?.windowApproximate){el('phase-end').textContent='≈ '+rule.durationMinutes+' min window · ≈ '+rule.matchMinutes+' min per match';}
}
let boardKey='';
function renderBoard(now){
 const board=el('event-board');if(!board)return;
 const key=region+profile+group+locale;
 if(key!==boardKey){boardKey=key;board.replaceChildren(...Object.entries(scheduleData.events).map(([id,event])=>{
  const a=document.createElement('a');a.className='event-clock';a.dataset.eventId=id;a.href=pageURL(event.route)+(['kaira','nahma','siege-bosses'].includes(id)?'?event='+id:'');const title=document.createElement('h3');title.textContent=eventName(id);const badge=document.createElement('span');badge.className='evidence-badge';badge.dataset.role='badge';const time=document.createElement('strong');time.dataset.role='time';const status=document.createElement('p');status.dataset.role='phase';a.append(title,badge,time,status);return a;
 }));}
 for(const card of board.children){const rule=selectedRule(card.dataset.eventId),state=RiftSchedule.state(rule,now);card.querySelector('[data-role="badge"]').textContent=confidenceName(rule?.confidence);card.querySelector('[data-role="time"]').textContent=state.target?remaining(state.target,now):'—';card.querySelector('[data-role="phase"]').textContent=phaseName(state.phase);card.dataset.unavailable=String(!state.target);}
}
function tick(){
 const now=Date.now(),rule=selectedRule(),state=RiftSchedule.state(rule,now),dates=datesAfter(now),enabled=Boolean(state.target);
 document.querySelectorAll('.hero-timer-label>span,.example-tag').forEach(node=>node.textContent=interpretationName(rule));
 const heroLabel=document.querySelector('.hero-timer-label,.timer-label');if(heroLabel){const text=[...heroLabel.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());if(text)text.textContent=(rule?.windowApproximate&&state.phase==='active'?'Estimated window ends in':phaseName(state.phase))+' ';}
 for(const id of['calendar','alert-open','enable-alerts'])if(el(id))el(id).disabled=!enabled;
 document.querySelectorAll('[data-check]').forEach(input=>input.disabled=!enabled);if(el('clear-checklist'))el('clear-checklist').disabled=!enabled;
 if(el('countdown-heading'))el('countdown-heading').textContent=eventName(pageEvent)+' · '+confidenceName(rule?.confidence);
 if(enabled){const seconds=Math.max(0,Math.ceil((+state.target-now)/1000));document.querySelector('.digits').dataset.longHours=String(seconds>=360000);el('hours').textContent=String(Math.floor(seconds/3600)).padStart(2,'0');el('minutes').textContent=String(Math.floor(seconds/60)%60).padStart(2,'0');el('seconds').textContent=String(seconds%60).padStart(2,'0');el('next-time').textContent=state.next?t('Next scheduled time')+': '+clock(state.next)+' · '+day(state.next):'—';
  const displayLabel=zoneMode==='local'?t('Your time'):zoneMode==='utc'?'UTC':t('Region display time');
  el('next-zone').textContent=state.next?displayLabel+' ('+zoneShort(state.next)+', '+displayZone()+')':'';
  let equivalent=el('schedule-equivalent');if(!equivalent){equivalent=document.createElement('span');equivalent.id='schedule-equivalent';el('next-zone').after(equivalent);}
  equivalent.textContent=state.next?'= '+clock(state.next,rule.zone)+' · '+day(state.next,rule.zone)+' — '+t('Schedule clock')+' ('+rule.zone+', '+zoneShort(state.next,rule.zone)+') · '+t('Service')+': '+regions[region].name:'';
  renderOpenings(dates,now,rule);}
 else{['hours','minutes','seconds'].forEach(id=>el(id).textContent='--');el('next-time').textContent=phaseName(state.phase);el('next-zone').textContent=regions[region].name;if(el('schedule-equivalent'))el('schedule-equivalent').textContent='';if(el('openings')){el('openings').textContent=t('Not scheduled for this service');rendered='';}if(el('schedule-note'))el('schedule-note').textContent=t('No fallback to another service.');if(activeAlerts){activeAlerts=false;el('enable-alerts').textContent=t('Enable alerts');}}
 renderPhases(state,rule);renderBoard(now);
 if(mode==='reset'){const daily=resetAfter(now),weekly=resetAfter(now,true);for(const[id,date]of[['daily',daily],['weekly',weekly]]){el(id+'-clock').textContent=date?(id==='daily'?clock(date)+' '+zoneShort(date):remaining(date,now)):t('Not scheduled for this service');el(id+'-date').textContent=date?day(date)+' · '+clock(date)+' · '+displayZone():'';}if(daily&&weekly&&(checks.dailyBoundary!==daily.toISOString()||checks.weeklyBoundary!==weekly.toISOString()))loadChecks(now);}
 if(el('berlin-time')){el('berlin-time').textContent=state.next?clock(state.next,'Europe/Berlin'):'—';el('london-time').textContent=state.next?clock(state.next,'Europe/London'):'—';}
 document.title=[el('hours').textContent,el('minutes').textContent,el('seconds').textContent].join(':')+' · '+eventName(pageEvent);
 if(activeAlerts&&state.next){const key=pageEvent+region+profile+group+ +state.next;if(+state.next-now<=Number(el('lead').value)*60000&&notified!==key){notified=key;const body=eventName(pageEvent)+' · '+clock(state.next,deviceZone)+' ('+deviceZone+') · '+confidenceName(rule.confidence);toast(body);try{if('Notification'in window&&Notification.permission==='granted'){const n=new Notification(eventName(pageEvent),{body,tag:key});setTimeout(()=>n.close(),12000);}}catch{el('alert-status').textContent=t('Desktop alerts unavailable. In-page alerts remain active.');}if(el('sound').checked)playSound().catch(()=>el('alert-status').textContent=t('Use Test to enable sound.'));}}
}
function syncControls(){
 el('region').value=region;
 if(el('schedule-profile')){el('schedule-profile').value=profile;el('schedule-profile').disabled=regions[region].service!=='global';}
 if(el('matching-group')){const artifact=selectedRule('artifact'),offsets=artifact?.groupOffsets||[0],count=offsets.length;el('matching-group').disabled=count===1;for(const option of el('matching-group').options){const index=Number(option.value)-1;option.disabled=index>=count;const total=artifact?artifact.hours[0]*60+artifact.minute+(offsets[index]||0):null;option.textContent=t('Group '+option.value)+(total!==null?' · '+String(Math.floor(total/60)%24).padStart(2,'0')+':'+String(total%60).padStart(2,'0'):'');}el('matching-group').value=String(Math.min(group,count));}
 renderEvidence(selectedRule());if(el('entry-confidence'))el('entry-confidence').textContent='Entry window · '+confidenceName(selectedRule()?.entryConfidence||'community-reported');
}
function setRegion(value){region=Object.hasOwn(regions,value)&&value!=='global'&&(!allowedServices.length||allowedServices.includes(value))?value:pageDefault||'na-east';if(!allowedServices.length)save('region',region);notified='';if(mode==='reset')loadChecks(Date.now());syncControls();tick();}
function setZone(value){zoneMode=['local','service','utc'].includes(value)?value:'local';save('zone',zoneMode);document.querySelectorAll('[data-zone]').forEach(button=>{const selected=button.dataset.zone===zoneMode;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});tick();}
el('region').addEventListener('change',()=>setRegion(el('region').value));
document.querySelectorAll('[data-zone]').forEach(button=>button.addEventListener('click',()=>setZone(button.dataset.zone)));
if(el('schedule-profile'))el('schedule-profile').addEventListener('change',()=>{profile=el('schedule-profile').value;save('profile',profile);notified='';syncControls();tick();});
if(el('matching-group'))el('matching-group').addEventListener('change',()=>{group=Number(el('matching-group').value);save('group',String(group));notified='';syncControls();tick();});
if(el('expand-schedule'))el('expand-schedule').addEventListener('click',()=>{expanded=!expanded;el('expand-schedule').textContent=t(expanded?'Show fewer':'Full 24-hour schedule')+' ↗';el('expand-schedule').setAttribute('aria-expanded',String(expanded));tick();});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}}));
el('alert-open').addEventListener('click',()=>el('reminder-dialog').showModal());el('image-guide-open').addEventListener('click',()=>el('image-guide').showModal());
el('lead').value=['5','10','15'].includes(read('lead','5'))?read('lead','5'):'5';el('sound').checked=read('sound','false')==='true';
el('lead').addEventListener('change',()=>{save('lead',el('lead').value);notified='';tick();});el('sound').addEventListener('change',()=>save('sound',String(el('sound').checked)));
async function playSound(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error();if(!audio)audio=new Audio();await audio.resume();[523,659,784].forEach((frequency,index)=>{const oscillator=audio.createOscillator(),gain=audio.createGain(),start=audio.currentTime+index*.13;oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.001,start);gain.gain.linearRampToValueAtTime(.07,start+.025);gain.gain.exponentialRampToValueAtTime(.001,start+.65);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(start);oscillator.stop(start+.7);});}
el('test-sound').addEventListener('click',()=>playSound().then(()=>toast(t('Sound test played.'))).catch(()=>toast(t('Sound unavailable.'))));
el('enable-alerts').addEventListener('click',async()=>{if(activeAlerts){activeAlerts=false;el('enable-alerts').textContent=t('Enable alerts');el('alert-status').textContent=t('Alerts off.');return;}el('enable-alerts').disabled=true;try{let permission='unsupported';if('Notification'in window&&isSecureContext)permission=Notification.permission==='default'?await Notification.requestPermission():Notification.permission;activeAlerts=true;notified='';el('enable-alerts').textContent=t('Turn off alerts');el('alert-status').textContent=permission==='granted'?t('Keep this tab open. Background delivery can be delayed.'):t('Permission denied or unavailable. In-page alerts enabled.');if(el('sound').checked)await playSound().catch(()=>{});tick();}catch{el('alert-status').textContent=t('Could not enable alerts.');}finally{el('enable-alerts').disabled=false;}});
const stamp=date=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const escapeICS=value=>String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
function foldICS(line){let result='',part='';for(const char of line){if(new TextEncoder().encode(part+char).length>74){result+=part+'\r\n ';part='';}part+=char;}return result+part;}
function makeCalendar(now=Date.now()){
 const rule=selectedRule();if(!RiftSchedule.available(rule,now))throw Error('No usable schedule');
 const dates=RiftSchedule.openings(rule,now,Math.min(336,rule.hours.length*rule.weekdays.length+2)).filter(d=>+d<now+7*86400000);
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Aion 2 Rift Timer//EN','CALSCALE:GREGORIAN','X-WR-CALNAME:'+escapeICS(eventName(pageEvent))];
 function event(date,eventId,eventRule){const duration=eventRule.durationByHour?.[String(RiftSchedule.parts(+date,eventRule.zone).hour)]??eventRule.durationMinutes;lines.push('BEGIN:VEVENT','UID:'+eventId+'-'+region+'-'+eventRule.profile+'-'+eventRule.group+'-'+ +date+'@aion2-rift-timer.com','DTSTAMP:'+stamp(new Date(now)),'DTSTART:'+stamp(date),'DTEND:'+stamp(new Date(+date+Math.max(1,duration)*60000)),'SUMMARY:'+escapeICS(eventName(eventId)+' ('+confidenceName(eventRule.confidence)+')'),'DESCRIPTION:'+escapeICS((eventRule.note||'Schedule estimate; check in game.')+' '+eventRule.sourceIds.map(id=>scheduleData.sources.find(s=>s.id===id).url).join(' ')),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escapeICS(eventName(eventId)),'TRIGGER:-PT'+el('lead').value+'M','END:VALARM','END:VEVENT');}
 dates.forEach(date=>event(date,pageEvent,rule));if(mode==='reset'){const weekly=selectedRule('weekly-reset'),next=resetAfter(now,true);if(next&&+next<now+7*86400000)event(next,'weekly-reset',weekly);}lines.push('END:VCALENDAR');return lines.map(foldICS).join('\r\n')+'\r\n';
}
el('calendar').addEventListener('click',()=>{try{const url=URL.createObjectURL(new Blob([makeCalendar()],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=pageEvent+'-'+region+'-'+profile+'.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);toast(t('Calendar downloaded. One-time import, not a subscription.'));}catch{toast(t('No schedule available to export.'));}});
document.querySelectorAll('[data-check]').forEach(input=>input.addEventListener('change',()=>{checks[input.dataset.check]=input.checked;save('checks-'+region,JSON.stringify(checks));}));
if(el('clear-checklist'))el('clear-checklist').addEventListener('click',()=>{document.querySelectorAll('[data-check]').forEach(input=>{input.checked=false;checks[input.dataset.check]=false;});save('checks-'+region,JSON.stringify(checks));toast(t('Personal checks cleared.'));});
el('device-zone').textContent=deviceZone.replaceAll('_',' ');setRegion(region);setZone(zoneMode);setInterval(tick,1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
// Long-running game sessions should pick up a published correction without restarting the tab.
async function refreshSchedules(){
 if(!navigator.onLine)return;
 try{
  const response=await fetch(new URL('data/schedules.json',APP_ROOT),{cache:'no-cache'});if(!response.ok)throw Error();
  const next=RiftSchedule.validate(await response.json());if(JSON.stringify(next)===JSON.stringify(scheduleData))return;
  if(!Object.hasOwn(next.regions,region)){regions[region].events={};tick();toast(t('Selected service is no longer published. Choose a service.'));return;}
  for(const key of Object.keys(regions))delete regions[key];Object.assign(regions,next.regions);scheduleData.sources=next.sources;scheduleData.events=next.events;scheduleData.updatedAt=next.updatedAt;scheduleData.publication=next.publication;boardKey='';rendered='';syncControls();tick();toast(t('Schedule data updated.'));
 }catch{toast(t('Schedule refresh failed. Keeping the last reviewed data.'));}
}
setInterval(refreshSchedules,5*60*1000);
