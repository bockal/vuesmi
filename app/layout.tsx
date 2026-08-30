import type { Metadata } from "next";
import { env } from "cloudflare:workers";
import "./globals.css";
export const metadata:Metadata={
  metadataBase:new URL("https://vuesmi.com"),
  title:"Klinger Lake Vacation Rental in Sturgis, MI | Sleeps 12 | The Vues",
  description:"Book The Vues, a five-bedroom Klinger Lake vacation rental in Sturgis, Michigan, for up to 12 guests. Private shoreline, dock, kayaks, EV charger and optional pontoon or jet-ski rental.",
  alternates:{canonical:"https://vuesmi.com/"},
  manifest:"/manifest.webmanifest",
  appleWebApp:{capable:true,title:"The Vues",statusBarStyle:"default"},
  icons:{
    icon:[
      {url:"/vues-farm-bell-192.png",sizes:"192x192",type:"image/png"},
      {url:"/vues-farm-bell.svg",type:"image/svg+xml"},
    ],
    shortcut:"/vues-farm-bell-192.png",
    apple:{url:"/apple-touch-icon.png",sizes:"180x180",type:"image/png"},
  },
  openGraph:{title:"Klinger Lake Vacation Rental in Sturgis, MI | Sleeps 12 | The Vues",description:"A five-bedroom lakefront vacation rental with private shoreline, dock, kayaks and room for 12 guests.",type:"website",url:"https://vuesmi.com/",images:[{url:"/property/klinger-house-sketch-bw.webp",width:1536,height:1024,alt:"Architectural sketch of The Vues at Klinger Lake"}]},
  twitter:{card:"summary_large_image",title:"Klinger Lake Vacation Rental in Sturgis, MI | Sleeps 12 | The Vues",description:"A five-bedroom lakefront vacation rental with private shoreline, dock, kayaks and room for 12 guests.",images:["/property/klinger-house-sketch-bw.webp"]},
};
export default function RootLayout({children}:{children:React.ReactNode}){
  const measurementId=(env as unknown as {GA_MEASUREMENT_ID?:string}).GA_MEASUREMENT_ID;
  return <html lang="en"><head>{measurementId&&<><script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}/><script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(measurementId)});`}}/></>}</head><body>{children}</body></html>
}

