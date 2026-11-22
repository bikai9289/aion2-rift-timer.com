(function(){
 function maintenancePhase(notice,now){
  const start=Date.parse(notice.start),end=Date.parse(notice.end);
  if(!Number.isFinite(now)||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return 'unconfirmed';
  if(notice.status==='completed'||notice.status==='cancelled')return notice.status;
  return now<start?'scheduled':now<end?'window':'unconfirmed';
 }
 if(typeof module!=='undefined')module.exports={maintenancePhase};
 if(typeof document==='undefined')return;
 const panel=document.querySelector('[data-maintenance]');if(!panel)return;
 const label=document.getElementById('maintenance-phase'),count=document.getElementById('maintenance-countdown');
 function update(){
  const now=Date.now(),phase=maintenancePhase(panel.dataset,now);
  label.textContent={scheduled:'Scheduled maintenance',window:'Within the announced window',unconfirmed:'Check the latest official notice',completed:'Official completion reported',cancelled:'Official cancellation reported'}[phase];
  const target=Date.parse(phase==='scheduled'?panel.dataset.start:panel.dataset.end);
  count.textContent=['completed','cancelled'].includes(phase)?'Status comes from the linked official notice, not a live server probe.':phase==='unconfirmed'?'Expected end passed. Recovery is not confirmed.':(phase==='scheduled'?'Starts in ':'Expected end in ')+Math.floor((target-now)/3600000)+'h '+Math.floor((target-now)%3600000/60000)+'m';
 }
 const local=document.getElementById('maintenance-local');
 const format=new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short'});
 local.textContent=format.format(new Date(panel.dataset.start))+' - '+format.format(new Date(panel.dataset.end))+' ('+format.resolvedOptions().timeZone+')';
 update();setInterval(update,30000);
 document.addEventListener('visibilitychange',update);
})();
