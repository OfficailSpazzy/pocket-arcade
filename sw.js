// Offline support. The page itself is fetched from the network first so updates show up
// right away; the saved copy is only used when there is no connection.
const CACHE='spazzys-arcade-v12';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  const isPage=req.mode==='navigate'||(url.origin===location.origin&&(url.pathname.endsWith('/')||url.pathname.endsWith('.html')));
  if(isPage){e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c))}return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))));return}
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c))}return r}).catch(()=>hit);return hit||net}))});
