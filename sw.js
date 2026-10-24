// Версию поднимать вместе с APP_VER в index.html
const VER='summator-v1.5.0';
const FILES=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VER).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const url=new URL(r.url);
  // страница: сначала сеть (чтобы обновления приходили), без сети — кэш
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VER).then(x=>x.put('index.html',c));return res})
      .catch(()=>caches.match('index.html')));
    return;
  }
  // остальное (иконки, шрифты Google): кэш, иначе сеть с сохранением
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(url.host)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
      if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(VER).then(x=>x.put(r,c))}return res})));
  }
});
