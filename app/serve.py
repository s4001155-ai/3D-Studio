#!/usr/bin/env python3
"""3D Studio 5.0 experimental read-only local catalog gateway. Python 3.9+."""
import argparse, json, os, re, urllib.parse, urllib.request, urllib.error, getpass
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
ROOT=Path(os.environ.get('STUDIO_WEB_ROOT') or Path(__file__).resolve().parent).resolve()
MAX_JSON=4*1024*1024
MAX_DOWNLOAD=45*1024*1024
SKETCHFAB='https://api.sketchfab.com'
THINGIVERSE='https://api.thingiverse.com'

def request(url, token=None, limit=MAX_JSON, allowed_hosts=None):
    parts=urllib.parse.urlsplit(url)
    if parts.scheme!='https' or parts.hostname not in allowed_hosts: raise ValueError('Source URL is not allowed')
    hdr={'Accept':'application/json','User-Agent':'3DStudio-Experimental-5.0'}
    if token:hdr['Authorization']='Bearer '+token
    opener=urllib.request.build_opener(NoRedirect())
    req=urllib.request.Request(url,headers=hdr)
    with opener.open(req,timeout=25) as res:
        if int(res.headers.get('Content-Length','0'))>limit:raise ValueError('File exceeds test size limit')
        data=res.read(limit+1)
        if len(data)>limit:raise ValueError('File exceeds test size limit')
        return data

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def safe_json(raw):
    obj=json.loads(raw)
    if not isinstance(obj,(dict,list)):raise ValueError('Invalid API response')
    return obj

def sketchfab_search(q,offset):
    args=urllib.parse.urlencode({'type':'models','q':q,'downloadable':'true','count':'6','offset':offset})
    obj=safe_json(request(SKETCHFAB+'/v3/search?'+args,allowed_hosts={'api.sketchfab.com'}))
    results=[]
    for m in obj.get('results',[]):
        if not isinstance(m,dict) or not m.get('isDownloadable'):continue
        uid=str(m.get('uid',''))
        if not re.fullmatch(r'[A-Za-z0-9]{12,64}',uid):continue
        thumbs=m.get('thumbnails',{}).get('images',[]) if isinstance(m.get('thumbnails'),dict) else []
        thumbs=sorted((t for t in thumbs if isinstance(t,dict)),key=lambda t:abs(int(t.get('width',256))-256))
        thumb=next((t.get('url') for t in thumbs if str(t.get('url','')).startswith('https://')),None)
        results.append({'id':uid,'title':str(m.get('name') or 'Untitled')[:150], 'thumbnail':thumb,'author':str((m.get('user') or {}).get('username',''))[:100], 'license':str(m.get('license') or 'Check source'),'url':'https://sketchfab.com/3d-models/'+uid,'provider':'sketchfab','importable':bool(os.environ.get('SKETCHFAB_ACCESS_TOKEN'))})
    return {'results':results,'next_offset':offset+6 if len(obj.get('results',[]))>=6 else None,'download_ready':bool(os.environ.get('SKETCHFAB_ACCESS_TOKEN'))}

def relevant(title, query):
    # Hard object nouns must match. No filler from popular/trending lists.
    import unicodedata
    aliases={'car':['car','cars','automobile','vehicle','машин','автомоб','авто'],
             'машин':['car','cars','automobile','vehicle','машин','автомоб','авто'],
             'organizer':['organizer','organiser','holder','storage','органайзер'],
             'battery':['battery','batteries','батар'],
             'robot':['robot','робот'], 'cat':['cat','кот','кошка']}
    def words(x):return re.findall(r'[\w]+',unicodedata.normalize('NFKC',x.lower()))
    noise={'i','want','a','an','the','model','3d','print','printable','for','of','and','need','simple','detailed','мне','нужна','нужен','хочу','для','модель','детальная','детальный','простая','простой'}
    terms=[w for w in words(query) if w not in noise and len(w)>1]
    if not terms:return False
    title_words=words(title);txt=' '.join(title_words)
    for term in terms:
        forms=aliases.get(term,[term])
        if any(form in txt for form in forms):continue
        return False
    return True

def thingiverse_search(q,offset):
    token=os.environ.get('THINGIVERSE_TOKEN','')
    if not token:return {'results':[],'error':'Thingiverse API token is not configured','requires_auth':True}
    # Thingiverse search uses a path parameter, not /search/?q=... .
    args=urllib.parse.urlencode({'type':'things','page':offset//20+1,'per_page':20})
    url=THINGIVERSE+'/search/'+urllib.parse.quote(q,safe='')+'?'+args
    obj=safe_json(request(url,token=token,allowed_hosts={'api.thingiverse.com'}))
    raw=obj if isinstance(obj,list) else obj.get('hits',obj.get('results',obj.get('data',[])))
    if not isinstance(raw,list):raw=[]
    results=[]
    for m in raw:
        if not isinstance(m,dict):continue
        mid=str(m.get('id',''));title=str(m.get('name') or m.get('title') or '')[:150]
        if not mid.isdigit() or not relevant(title,q):continue
        thumb=m.get('thumbnail') or m.get('preview_image') or m.get('thumbnail_url') or m.get('public_url')
        if isinstance(thumb,dict):thumb=thumb.get('url') or thumb.get('sizes',{}).get('medium')
        if isinstance(thumb,str) and thumb.startswith('http://'):thumb='https://'+thumb[7:]
        if not isinstance(thumb,str) or not thumb.startswith('https://'):thumb=None
        creator=m.get('creator') or {};creator=creator if isinstance(creator,dict) else {}
        results.append({'id':mid,'title':title,'thumbnail':'/studio-v5/thumbnail/thingiverse/'+mid,'author':str(creator.get('name') or creator.get('screen_name') or '')[:100], 'license':str(m.get('license') or 'Check source'),'url':'https://www.thingiverse.com/thing:'+mid,'provider':'thingiverse','importable':True})
        if len(results)>=6:break
    # A following page can be requested; empty filtered pages are not padded.
    return {'results':results,'next_offset':offset+20 if len(raw)>=20 else None,'download_ready':True}

def get_thingiverse_thumbnail(mid,token):
    obj=safe_json(request(THINGIVERSE+'/things/'+mid+'/images',token=token,allowed_hosts={'api.thingiverse.com'}))
    images=obj if isinstance(obj,list) else obj.get('images',obj.get('data',[]))
    if not isinstance(images,list):images=[]
    urls=[]
    for item in images:
        if not isinstance(item,dict):continue
        sizes=item.get('sizes',[])
        if isinstance(sizes,list):
            for size in sizes:
                if isinstance(size,dict):urls.append(size.get('url'))
        for k in ('url','public_url','thumbnail','medium','large'):urls.append(item.get(k))
    for url in urls:
        if not isinstance(url,str):continue
        parts=urllib.parse.urlsplit(url)
        host=(parts.hostname or '').lower()
        if parts.scheme!='https' or not (host=='thingiverse.com' or host.endswith('.thingiverse.com') or host.endswith('.makerbot.com')):continue
        req=urllib.request.Request(url,headers={'User-Agent':'3DStudio-Experimental-5.3'})
        opener=urllib.request.build_opener(NoRedirect())
        try:
            with opener.open(req,timeout=15) as res:
                content_type=res.headers.get('Content-Type','').split(';')[0].lower()
                if content_type not in {'image/jpeg','image/png','image/webp','image/gif'}:continue
                data=res.read(2*1024*1024+1)
                if len(data)>2*1024*1024:continue
                return data,content_type
        except (urllib.error.HTTPError,urllib.error.URLError,ValueError):continue
    raise ValueError('No accessible Thingiverse thumbnail')

def get_thingiverse_stl(mid,token):
    obj=safe_json(request(THINGIVERSE+'/things/'+mid+'/files',token=token,allowed_hosts={'api.thingiverse.com'}))
    files=obj if isinstance(obj,list) else obj.get('files',obj.get('data',[]))
    if not isinstance(files,list):files=[]
    candidates=[f for f in files if isinstance(f,dict) and str(f.get('name','')).lower().endswith('.stl') and str(f.get('id','')).isdigit()]
    if not candidates:raise ValueError('No STL file available for this model')
    # A model can contain multiple STL files. Try the next file if one has been removed.
    errors=[]
    for chosen in candidates[:8]:
        try:
            return download_thingiverse_file(chosen,token)
        except urllib.error.HTTPError as e:
            if e.code in (403,404,410):
                errors.append(str(e.code));continue
            raise
    raise ValueError('Thingiverse STL download unavailable (HTTP '+','.join(errors)+'). Try another model or check source permissions.')

def download_thingiverse_file(chosen,token):
    fid=str(chosen['id'])
    # Use provider's direct URL when available, otherwise the official file download endpoint.
    direct=chosen.get('download_url')
    url=direct if isinstance(direct,str) and direct.startswith('https://') else THINGIVERSE+'/files/'+fid+'/download'
    allowed={'api.thingiverse.com','www.thingiverse.com','thingiverse.com','cdn.thingiverse.com','cdn.thingiverse.com','cdn.thingiverse.com'}
    hdr={'Authorization':'Bearer '+token,'User-Agent':'3DStudio-Experimental-5.2'}
    for hop in range(5):
        u=urllib.parse.urlsplit(url)
        host=(u.hostname or '').lower()
        if u.scheme!='https' or (host not in allowed and not (host.endswith('.thingiverse.com') or host.endswith('.makerbot.com') or host in {'thingiverse-production-new.s3.amazonaws.com','thingiverse-production-new.s3.us-east-1.amazonaws.com','cdn.thingiverse.com'})):
            raise ValueError('Download host not permitted: '+host)
        req=urllib.request.Request(url,headers=hdr if host=='api.thingiverse.com' else {'User-Agent':'3DStudio-Experimental-5.2'})
        opener=urllib.request.build_opener(NoRedirect())
        try:
            with opener.open(req,timeout=25) as res:
                if int(res.headers.get('Content-Length','0'))>MAX_DOWNLOAD:raise ValueError('STL exceeds size limit')
                data=res.read(MAX_DOWNLOAD+1)
                if len(data)>MAX_DOWNLOAD:raise ValueError('STL exceeds size limit')
                if len(data)<84:raise ValueError('STL file too small')
                # STL binary has triangle count at bytes 80..83. ASCII STL starts with solid.
                import struct
                n=struct.unpack_from('<I',data,80)[0]
                if len(data)!=84+50*n and not data[:80].lstrip().lower().startswith(b'solid'):
                    raise ValueError('Provider did not return an STL file')
                return data
        except urllib.error.HTTPError as e:
            if e.code in (301,302,303,307,308):
                location=e.headers.get('Location')
                if not location:raise ValueError('Missing download redirect location')
                url=urllib.parse.urljoin(url,location)
                continue
            raise
    raise ValueError('Too many download redirects')

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def end_headers(self):
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
    def json(self,obj,status=200):
        data=json.dumps(obj,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
    def do_GET(self):
        host=self.headers.get('Host','');allowed={f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'}
        if host not in allowed:return self.send_error(403)
        origin=self.headers.get('Origin')
        if origin and origin not in {'http://'+h for h in allowed}:return self.send_error(403)
        u=urllib.parse.urlsplit(self.path);params=urllib.parse.parse_qs(u.query)
        try:
            if u.path=='/studio-v5/status':return self.json({'thingiverse':bool(os.environ.get('THINGIVERSE_TOKEN')),'sketchfab':bool(os.environ.get('SKETCHFAB_ACCESS_TOKEN'))})
            if u.path=='/studio-v5/search':
                provider=params.get('provider',[''])[0];q=params.get('q',[''])[0].strip()[:160]
                offset=int(params.get('offset',['0'])[0]);
                if not q or not 0<=offset<=480 or provider not in {'sketchfab','thingiverse'}:return self.json({'error':'Invalid search parameters'},400)
                return self.json(sketchfab_search(q,offset) if provider=='sketchfab' else thingiverse_search(q,offset))
            if u.path.startswith('/studio-v5/thumbnail/thingiverse/'):
                mid=u.path.rsplit('/',1)[-1]
                if not mid.isdigit():return self.send_error(400)
                token=os.environ.get('THINGIVERSE_TOKEN')
                if not token:return self.send_error(401)
                try:data,mime=get_thingiverse_thumbnail(mid,token)
                except Exception:return self.send_error(404)
                self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
            if u.path.startswith('/studio-v5/download/'):
                _,_,_,provider,mid=u.path.split('/',4)
                if provider=='sketchfab' and re.fullmatch('[A-Za-z0-9]{12,64}',mid):
                    token=os.environ.get('SKETCHFAB_ACCESS_TOKEN')
                    if not token:return self.json({'error':'Sketchfab login required. No access token configured.'},401)
                    obj=safe_json(request(SKETCHFAB+'/v3/models/'+mid+'/download',token=token,allowed_hosts={'api.sketchfab.com'}))
                    # Temporary CDN URL is returned to the browser. Do not proxy arbitrary URLs.
                    url=(obj.get('gltf') or {}).get('url')
                    if not isinstance(url,str) or not url.startswith('https://'):return self.json({'error':'No glTF archive available'},404)
                    # Fetch only the temporary download URL issued by Sketchfab; never accept user-supplied URLs.
                    host=urllib.parse.urlsplit(url).hostname
                    if host not in {'sketchfab-prod-media.s3.amazonaws.com','sketchfab-prod-media.s3.us-west-2.amazonaws.com'}:
                        return self.json({'error':'Sketchfab download host not yet verified: '+str(host)},502)
                    raw=request(url,limit=MAX_DOWNLOAD,allowed_hosts={host})
                    if not raw.startswith(b'PK'):
                        return self.json({'error':'Provider did not return a ZIP archive'},502)
                    self.send_response(200);self.send_header('Content-Type','application/zip');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw);return
                if provider=='thingiverse' and mid.isdigit():
                    token=os.environ.get('THINGIVERSE_TOKEN')
                    if not token:return self.json({'error':'Thingiverse API token required'},401)
                    raw=get_thingiverse_stl(mid,token)
                    self.send_response(200)
                    self.send_header('Content-Type','model/stl')
                    self.send_header('Content-Length',str(len(raw)))
                    self.send_header('X-Content-Type-Options','nosniff')
                    self.end_headers();self.wfile.write(raw);return
                return self.json({'error':'Invalid model identifier'},400)
            if u.path.startswith('/studio-v5/'):return self.json({'error':'Unknown API route'},404)
            path=(ROOT/urllib.parse.unquote(u.path).lstrip('/')).resolve()
            if ROOT not in path.parents and path!=ROOT:return self.send_error(403)
            if path.suffix in {'.py','.pyc','.env','.key'} or path.name.startswith('.') or path.is_dir() and path!=ROOT:return self.send_error(403)
            return super().do_GET()
        except urllib.error.HTTPError as e:
            return self.json({'error':'Thingiverse returned HTTP '+str(e.code)+'. The STL may be unavailable or restricted; try another model.','upstreamStatus':e.code},502)
        except (urllib.error.URLError,ValueError,KeyError,TypeError,TimeoutError) as e:return self.json({'error':str(e)[:240]},502)
        except Exception as e:
            print('Gateway exception',type(e).__name__,str(e));return self.json({'error':'Catalog gateway failed'},502)
    def list_directory(self,path):return self.send_error(403)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--port',type=int,default=9003);args=ap.parse_args()
    # Desktop gateway receives an optional token via its parent process.
    # Never prompt in the packaged GUI application.
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'3D Studio Search 5.3: http://127.0.0.1:{server.server_port}/',flush=True)
    print('Thingiverse search enabled if a token was entered. Thingiverse STL import is experimental; check model geometry and units before printing.',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
if __name__=='__main__':main()
