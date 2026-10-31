/* Install and offline support. No background notifications or personal information are collected. */
(()=>{
 const script=document.currentScript,root=new URL('.',script.src),lang=document.documentElement.lang;
 const text=(en,zh,ko)=>lang==='zh-Hant'?zh:lang==='ko'?ko:en;
 const status=document.getElementById('offline-status');
 function network(){if(status){status.hidden=navigator.onLine;status.textContent=text('Offline · saved schedules; check review dates.','離線 · 使用已儲存時刻表，請留意資料日期。','오프라인 · 저장된 시간표입니다. 검토 날짜를 확인하세요.');}}
 addEventListener('online',network);addEventListener('offline',network);network();
 let installEvent=null;
 const button=document.getElementById('install-app');
 addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;if(button)button.hidden=false;});
 if(button)button.addEventListener('click',async()=>{if(installEvent){await installEvent.prompt();await installEvent.userChoice;installEvent=null;button.hidden=true;}else{const instructions=document.getElementById('install-help');if(instructions)instructions.hidden=!instructions.hidden;}});
 if('serviceWorker'in navigator&&isSecureContext){
  navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.pathname}).then(registration=>{
   const update=document.getElementById('update-app');
   function waiting(){if(update&&registration.waiting){update.hidden=false;update.onclick=()=>registration.waiting.postMessage({type:'SKIP_WAITING'});}}
   waiting();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)waiting();});});
   let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reloading&&navigator.serviceWorker.controller){reloading=true;if(update&&!update.hidden)location.reload();}});
  }).catch(()=>{if(status){status.hidden=false;status.textContent=text('Offline support unavailable in this browser.','此瀏覽器無法啟用離線功能。','이 브라우저에서는 오프라인 기능을 사용할 수 없습니다.');}});
 }
})();
