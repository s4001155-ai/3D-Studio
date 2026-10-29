const API='https://api.thingiverse.com';
const MAX=45*1024*1024;
const respond=(o,status=200)=>new Response(JSON.stringify(o),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const validId=id=>/^\d{1,16}$/.test(id);
const acceptedHost=h=>h==='api.thingiverse.com'||h==='www.thingiverse.com'||h==='thingiverse.com'||h.endsWith('.thingiverse.com')||h.endsWith('.makerbot.com')||h==='thingiverse-production-new.s3.amazonaws.com'||h==='thingiverse-production-new.s3.us-east-1.amazonaws.com';
async function provider(url,token,kind='json'){
 let current=new URL(url);
 for(let i=0;i<5;i++){
  if(current.protocol!=='https:'||!acceptedHost(current.hostname))throw Error('Blocked download destination');
  const headers={'accept':kind==='json'?'application/json':'application/octet-stream'};
  if(current.hostname==='api.thingiverse.com')headers.authorization='Bearer '+token;
  const r=await fetch(current.toString(),{headers,redirect:'manual',signal:AbortSignal.timeout(20000)});
  if(r.status>=300&&r.status<400){const loc=r.headers.get('location');if(!loc)throw Error('Redirect missing');current=new URL(loc,current);continue}
  if(!r.ok)throw Error('Provider HTTP '+r.status);
  if(kind==='json')return await r.json();
  const declared=Number(r.headers.get('content-length')||0);
  if(declared>MAX)throw Error('File too large');
  const bytes=await r.arrayBuffer();if(bytes.byteLength>MAX)throw Error('File too large');
  return bytes;
 }
 throw Error('Too many redirects');
}
function isStl(buffer){
 const b=new Uint8Array(buffer);if(b.length<84)return false;
 const count=new DataView(buffer).getUint32(80,true);
 if(b.length===84+50*count)return true;
 const start=new TextDecoder().decode(b.subarray(0,80)).trimStart().toLowerCase();
 return start.startsWith('solid')&&new TextDecoder().decode(b.subarray(Math.max(0,b.length-100))).toLowerCase().includes('endsolid');
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(request.method!=='GET')return respond({error:'Method not allowed'},405);
 if(url.pathname==='/health')return respond({app:'3D Studio API',version:'1.5-beta',status:'online',thingiverseConfigured:!!env.THINGIVERSE_TOKEN,rateLimiterConfigured:!!env.SEARCH_LIMITER});
 if(!['/search','/download'].includes(url.pathname))return respond({error:'Not found'},404);
 if(!env.THINGIVERSE_TOKEN||!env.SEARCH_LIMITER)return respond({error:'Server configuration incomplete'},503);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 try{const decision=await env.SEARCH_LIMITER.limit({key:url.pathname+':'+ip});if(!decision.success)return respond({error:'Rate limit exceeded'},429)}catch{return respond({error:'Rate limiter unavailable'},503)}
 try{
  if(url.pathname==='/search'){
   const q=(url.searchParams.get('q')||'').trim(),pageText=url.searchParams.get('page')||'1';
   if(q.length<2||q.length>80||!/^[1-9]\d*$/.test(pageText)||Number(pageText)>20)return respond({error:'Invalid search'},400);
   const upstream=new URL('/search/'+encodeURIComponent(q),API);upstream.searchParams.set('type','things');upstream.searchParams.set('page',pageText);upstream.searchParams.set('per_page','20');
   const obj=await provider(upstream.toString(),env.THINGIVERSE_TOKEN);
   const raw=Array.isArray(obj)?obj:(obj?.hits||obj?.results||obj?.data||[]);
   if(!Array.isArray(raw))return respond({error:'Unexpected search response'},502);
   return respond({source:'Thingiverse',query:q,page:Number(pageText),models:raw.slice(0,20).filter(x=>x&&validId(String(x.id||''))).map(x=>({id:String(x.id),name:String(x.name||x.title||'').slice(0,150),thumbnail:typeof x.thumbnail==='string'?x.thumbnail:(x.thumbnail?.url||x.preview_image||null),creator:x.creator?.name||x.creator?.screen_name||'',url:'https://www.thingiverse.com/thing:'+x.id,license:typeof x.license==='string'?x.license:'Check source'}))});
  }
  const id=url.searchParams.get('id')||'';
  if(!validId(id))return respond({error:'Invalid model id'},400);
  const filesObj=await provider(API+'/things/'+id+'/files',env.THINGIVERSE_TOKEN);
  const files=Array.isArray(filesObj)?filesObj:(filesObj?.files||filesObj?.data||[]);
  if(!Array.isArray(files))return respond({error:'Unexpected file list'},502);
  const candidates=files.filter(f=>f&&validId(String(f.id||''))&&typeof f.name==='string'&&f.name.toLowerCase().endsWith('.stl')).slice(0,8);
  if(!candidates.length)return respond({error:'No STL files available for this model'},404);
  let last='No downloadable STL';
  for(const f of candidates){
   try{
    let download=API+'/files/'+f.id+'/download';
    if(typeof f.download_url==='string'){
      const u=new URL(f.download_url);if(u.protocol==='https:'&&acceptedHost(u.hostname))download=u.toString();
    }
    const bytes=await provider(download,env.THINGIVERSE_TOKEN,'binary');
    if(!isStl(bytes))throw Error('Downloaded content is not STL');
    return new Response(bytes,{headers:{'content-type':'model/stl','content-disposition':'attachment; filename="model.stl"','cache-control':'no-store','x-content-type-options':'nosniff'}});
   }catch(e){last=String(e.message||e).slice(0,120)}
  }
  return respond({error:'No accessible STL for this model',detail:last},502);
 }catch(e){console.error('Thingiverse API error',{route:url.pathname,type:e?.name||'Error'});return respond({error:'Provider unavailable',stage:url.pathname,detail:String(e.message||'unknown').slice(0,120)},502)}
}};
