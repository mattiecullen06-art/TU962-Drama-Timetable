const CACHE='tu962-web-4';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./app.js?v=4','./widget-data.mjs?v=4','./date-format.mjs','./widgets/TU962-Scriptable.js','./engine.mjs','./style.css?v=4','./seed.json','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest','./arcade.ttf','./digital.ttf']))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tu962-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.type==='basic'){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r}).catch(()=>caches.match(e.request)));});

