"use client";

import {useEffect,useState} from "react";

type FeedItem={id:string;caption:string;imageUrl:string;permalink:string;timestamp?:string};
export default function InstagramFeed({fallback}:{fallback:string[][]}){
  const [items,setItems]=useState<FeedItem[]>([]);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/instagram-feed",{signal:controller.signal}).then(response=>response.ok?response.json():{items:[]}).then(data=>{if(Array.isArray(data.items))setItems(data.items.slice(0,5))}).catch(()=>{});
    return()=>controller.abort();
  },[]);

  if(items.length===0)return <div className="instagramRail">{fallback.slice(0,5).map(([src,caption])=><figure key={src}><img src={src} alt={caption} loading="lazy"/><figcaption><span className="miniBell">P</span><div><strong>The Vues at Klinger Lake</strong><p>{caption}</p></div></figcaption></figure>)}</div>;
  return <div className="instagramRail">{items.map(item=><a className="instagramFeedPost" href={item.permalink} target="_blank" rel="noreferrer" key={item.id}><figure><img src={item.imageUrl} alt={item.caption||"A #klingerlake Instagram post"} loading="lazy"/><figcaption><span className="instagramGlyph" aria-hidden="true">◎</span><div><strong>#klingerlake</strong><p>{item.caption}</p></div></figcaption></figure></a>)}</div>;
}
