// Shared, crawlable presentation. These are published rules, never build-time live countdowns.
export const eventDestinations=[
 ['shugo-festival/','Shugo Festival'],['dimensional-invasion/','Dimensional Invasion'],
 ['battlefield/','Battlefield / Arena of Tactics'],['artifact-siege/','Artifact Siege'],
 ['world-boss-timer/','World Boss Timer'],['abyss-outland/','Abyss Outland'],
 ['argo-spirit-king/','Argo, the Spirit King'],['rift-domination/','Spacetime Rift Domination']
];
export const regionDestinations=[['rift-timer/europe/','Europe / EU'],['rift-timer/asia/','Global Asia'],['rift-timer/korea/','Korea / KR'],['rift-timer/taiwan/','Taiwan / TW']];
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const evidenceName=value=>({'official':'Official','community-agreed':'Community-agreed','community-reported':'Community-reported','disputed':'Disputed','pending':'Pending'}[value]||'Pending');
export function toolDirectory(route){
 const links=items=>items.map(([target,title])=>`<a href="/${target}"${target===route?' aria-current="page"':''}>${escapeHTML(title)} <span aria-hidden="true">↗</span></a>`).join('');
 return `<nav class="tool-directory" aria-label="Event and region timers"><div><h2>Event timers</h2><div class="tool-link-grid">${links(eventDestinations)}</div></div><div><h2>Region timers</h2><div class="tool-link-grid">${links(regionDestinations)}</div></div></nav>`;
}
export const clockHours=rule=>rule.hours.map(hour=>String(hour).padStart(2,'0')+':'+String(rule.minute).padStart(2,'0'));
export function publishedSchedule(data,regionId,eventIds,locale='en'){
 const region=data.regions[regionId],esc=escapeHTML;
 const sections=eventIds.map(eventId=>{
  const rule=region.events[eventId],name=data.events[eventId].name;
  if(!rule)return `<section><h3>${esc(name)}</h3><p>No published schedule for this service</p></section>`;
  const days=rule.weekdays.length===7?'Every day':rule.weekdays.map(day=>new Intl.DateTimeFormat(locale,{weekday:'short',timeZone:'UTC'}).format(Date.UTC(2026,0,4+day))).join(' · ');
  const rows=clockHours(rule).map((time,index)=>{const duration=rule.durationByHour?.[String(rule.hours[index])]??rule.durationMinutes;return `<tr><td><time>${time}</time></td><td>${esc(days)}</td><td>${duration?duration+' min':'Not stated'}</td></tr>`;}).join('');
  const sources=rule.sourceIds.map(id=>data.sources.find(source=>source.id===id)).filter(Boolean).map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)} ↗</a>`).join(' · ');
  return `<section class="published-event" data-published-event="${eventId}"><h3>${esc(name)}</h3><p class="published-context"><span>Service</span>: ${esc(region.name)} · <span>Clock</span>: <strong>${esc(rule.zone)}</strong> · <span>${evidenceName(rule.confidence)}</span></p><div class="table-scroll"><table class="data-table published-hours"><thead><tr><th>Service clock</th><th>Days</th><th>Reported duration</th></tr></thead><tbody>${rows}</tbody></table></div><p class="micro"><span>Reviewed</span>: ${rule.checkedAt.slice(0,10)}${rule.groupOffsets?.length>1?' · <span>Matching group</span>: 1':''}. ${rule.entryMinutes?'<span>Reported entry window</span>: '+rule.entryMinutes+' min. ':''}${sources}</p></section>`;
 }).join('');
 return `<div class="static-openings" data-static-schedule><p class="static-label">Published service-clock schedule · local conversion and live countdown require JavaScript.</p>${sections}</div>`;
}
export function staticBoard(data,regionId){
 const region=data.regions[regionId];
 return Object.entries(data.events).map(([id,event])=>{
  const rule=region.events[id],query=['kaira','nahma','siege-bosses'].includes(id)?'?event='+id:'',hours=rule?clockHours(rule).join(' · '):'—';
  return `<a class="event-clock static-event-clock" data-event-id="${id}" href="/${event.route}${query}" data-unavailable="${!rule}"><h3>${escapeHTML(event.name)}</h3><span class="evidence-badge">${evidenceName(rule?.confidence)}</span><strong>${hours}</strong><p>${rule?escapeHTML(rule.zone):'No published schedule for this service'}</p></a>`;
 }).join('');
}
export const primerCards=[
 {heading:'A three-hour cycle',text:'Spacetime Rifts follow a three-hour cycle, with eight published openings each day. Korea and Taiwan list 02:00, 05:00, 08:00, 11:00, 14:00, 17:00, 20:00 and 23:00 on their own service clocks. Choose the service you actually play before reading a countdown; the same clock label does not mean the same UTC instant.',link:'/rift-timer/korea/',anchor:'Korea Rift Timer'},
 {heading:'Entry and activity are different',text:'The timer separates the scheduled opening, the reported entry window and the estimated activity boundary. Taiwan’s official guide describes fifteen minutes for entry, while the Global and Korea reference uses a community-reported ten-minute window. The activity estimate is not your personal remaining stay, and portal capacity or maintenance can prevent entry.',link:'/rift-timer/taiwan/',anchor:'Taiwan Rift Timer'},
 {heading:'Compare clocks, not guesses',text:'Global sources disagree about the clock behind the schedule. Shugo publishes service-local hours, MetaBot describes a shared UTC+9 clock, and Atlas uses UTC for Rifts. The latter two produce the same repeating Rift instants. Local-clock interpretations can diverge around daylight saving changes, so compare the source labels instead of assuming every region is confirmed.',link:'/sources/',anchor:'Schedule sources'},
 {heading:'Plan the trip',text:'Check the world map when an opening is scheduled, then confirm the available portal in game. Our location directory lists ten candidate zones across four maps, with five possible positions in each zone. The separate rewards table covers fourteen level-45 faction quests. Use those references alongside the reset checklist to prepare before you travel.',link:'/rift-timer/location/',anchor:'Rift locations'}
];
export function riftPrimer(){
 const card=(item,index)=>`<article><span class="section-index">0${index+1}</span><h3>${item.heading}</h3><p>${item.text}</p><a class="text-button" href="${item.link}">${item.anchor} ↗</a></article>`;
 return `<section class="rift-primer shell"><div class="section-heading"><div><span class="section-index">UNDERSTAND THE CROSSING</span><h2>How the Aion 2 Rift Timer works</h2></div></div><div class="primer-grid">${primerCards.slice(0,2).map(card).join('')}<figure><img src="/assets/wallpaperBg15.webp" alt="Illustrative Aion 2 cavern artwork" loading="lazy"><figcaption>Illustration · not a portal map · Art © NC Corporation</figcaption></figure>${primerCards.slice(2).map((item,index)=>card(item,index+2)).join('')}</div></section>`;
}
