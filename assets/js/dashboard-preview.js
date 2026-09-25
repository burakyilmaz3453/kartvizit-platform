(function(root){
  const fields=['username','full_name','company','title','bio','mobile','work_phone','email','website','address','tax_office','tax_no','linkedin','instagram','twitter','facebook','social_order','theme','theme_color','avatar_url','banner_url','icon_config'];
  function createDraft(profile={}){const draft={theme:'dark',theme_color:'#c9a84c',social_order:'linkedin,instagram,twitter,facebook',icon_config:{}};fields.forEach(k=>{if(profile[k]!=null)draft[k]=profile[k]});return draft}
  function updateDraft(draft,patch){return Object.freeze({...draft,...patch,icon_config:{...(draft.icon_config||{}),...(patch.icon_config||{})}})}
  function render(frame,draft){if(!frame?.contentWindow)return false;frame.contentWindow.postMessage({type:'NOSHUTDOWN_CARD_PREVIEW',payload:draft},location.origin);return true}
  function safeImage(value){if(!value)return false;try{return['https:','http:','blob:'].includes(new URL(value,location.origin).protocol)}catch{return false}}
  root.NoshutdownPreview={createDraft,updateDraft,render,safeImage};
})(window);
