(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.NoshutdownPhone=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const formats={
    '+90':{max:10,pattern:'(###) ### ## ##'},
    '+1':{max:10,pattern:'(###) ###-####'},
    '+44':{max:10,pattern:'#### ######'},
    '+49':{max:10,pattern:'### ### ####'},
    '+33':{max:9,pattern:'# ## ## ## ##'},
    '+31':{max:9,pattern:'# #### ####'},
    '+39':{max:10,pattern:'### ### ####'},
    '+34':{max:9,pattern:'### ### ###'},
    '+971':{max:9,pattern:'## ### ####'},
    '+966':{max:9,pattern:'## ### ####'},
    '+994':{max:9,pattern:'## ### ## ##'}
  };
  const codes=Object.keys(formats).sort((a,b)=>b.length-a.length);
  const digits=value=>String(value||'').replace(/\D/g,'');

  function nationalDigits(code,value){
    return digits(value).slice(0,(formats[code]||formats['+90']).max);
  }

  function formatNational(code,value){
    const raw=nationalDigits(code,value),pattern=(formats[code]||formats['+90']).pattern;
    let result='',index=0;
    for(let i=0;i<pattern.length&&index<raw.length;i++){
      const token=pattern[i];
      if(token==='#')result+=raw[index++];
      else{
        const hasFutureSlot=pattern.slice(i+1).includes('#');
        if(index<raw.length||!hasFutureSlot)result+=token;
      }
    }
    return result;
  }

  function split(value=''){
    const text=String(value).trim();
    const compact='+'+digits(text);
    const code=text.startsWith('+')?codes.find(item=>compact.startsWith(item))||'+90':'+90';
    const all=digits(text);
    const prefix=digits(code);
    const number=text.startsWith('+')&&all.startsWith(prefix)?all.slice(prefix.length):all;
    return{code,digits:nationalDigits(code,number)};
  }

  function normalize(code,value){
    const number=nationalDigits(code,value);
    return number?`${code} ${number}`:'';
  }

  function formatInternational(value){
    if(!String(value||'').trim())return'';
    const parsed=split(value),formatted=formatNational(parsed.code,parsed.digits);
    return formatted?`${parsed.code} ${formatted}`:'';
  }

  function toDialable(value){
    const parsed=split(value);
    return parsed.digits?`${parsed.code}${parsed.digits}`:'';
  }

  return{formats,split,normalize,formatNational,formatInternational,toDialable};
});
