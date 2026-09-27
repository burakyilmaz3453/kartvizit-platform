(function(){
  const frame=document.getElementById('landing-card-preview');
  if(!frame)return;
  const demo={
    username:'demo',full_name:'Ahmet Kaya',company:'Noshutdown Teknoloji',title:'Kurucu Ortak & CEO',
    bio:'Dijital ürünler geliştiriyor, markaların daha güçlü bir ilk izlenim bırakmasına yardımcı oluyor.',
    mobile:'+90 532 000 00 00',work_phone:'+90 212 000 00 00',email:'ahmet@noshutdown.com',website:'https://noshutdown.vercel.app',
    address:'Maslak, Sarıyer / İstanbul',linkedin:'https://linkedin.com',instagram:'https://instagram.com',twitter:'',facebook:'',
    tax_office:'Maslak',tax_no:'1234567890',theme:'dark',theme_color:'#c9a84c',social_order:'linkedin,instagram,twitter,facebook',icon_config:{}
  };
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
    if(event.data?.type!=='NOSHUTDOWN_CARD_READY')return;
    frame.contentWindow.postMessage({type:'NOSHUTDOWN_CARD_PREVIEW',payload:demo},location.origin);
  });
})();
