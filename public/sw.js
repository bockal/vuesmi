const CACHE="the-vues-shell-v3";
const SHELL=["/","/manifest.webmanifest","/vues-bell-yoke.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(match=>match||caches.match("/"))));
});
self.addEventListener("push",event=>{
  let data={};try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()}};
  event.waitUntil(self.registration.showNotification(data.title||"New Vues booking request",{body:data.body||"Open the owner portal to review it.",icon:"/vues-bell-yoke.svg",badge:"/vues-bell-yoke.svg",data:{url:data.url||"/owner"},tag:data.tag||"vues-booking"}));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();const url=new URL(event.notification.data?.url||"/owner",self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(clients=>{for(const client of clients){if(client.url.startsWith(self.location.origin)&&"focus" in client){client.navigate(url);return client.focus()}}return self.clients.openWindow(url)}));
});
