(function(){
  const meta=document.querySelector('meta[name="turnstile-site-key"]');
  const siteKey=meta?.content?.trim();
  let currentToken='';
  function render(){const host=document.getElementById('turnstile-widget');if(!host||!siteKey||!window.turnstile)return;if(siteKey)host.hidden=false;window.turnstile.render(host,{sitekey:siteKey,theme:'dark',callback:(value)=>{currentToken=value},'expired-callback':()=>{currentToken=''}})}
  function token(){return currentToken||undefined}
  window.NoshutdownCaptcha={render,token,enabled:Boolean(siteKey)};
  window.noshutdownTurnstileReady=render;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
