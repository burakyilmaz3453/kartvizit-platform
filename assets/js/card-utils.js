(function(root){
  function safeUrl(value, protocols=['https:','http:']){try{const url=new URL(String(value||'').trim(),window.location.origin);return protocols.includes(url.protocol)?url.href:null}catch{return null}}
  function website(value){const clean=String(value||'').trim();return safeUrl(/^https?:\/\//i.test(clean)?clean:`https://${clean}`)}
  root.NoshutdownCard={safeUrl,website};
})(window);
