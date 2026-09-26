import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={
  metadataBase:new URL("https://vuesmi.com"),
  title:"Klinger Lake Vacation Rental near Sturgis, MI | Sleeps 12 | The Vues",
  description:"Book The Vues, a four-bedroom Klinger Lake vacation rental with loft sleeping space near Sturgis, Michigan, for up to 12 guests. Private shoreline, dock, kayaks, EV charger and optional pontoon or jet-ski rental.",
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
  openGraph:{title:"Klinger Lake Vacation Rental near Sturgis, MI | Sleeps 12 | The Vues",description:"A four-bedroom lakefront vacation rental with loft sleeping space, private shoreline, dock, kayaks and room for 12 guests.",type:"website",url:"https://vuesmi.com/",images:[{url:"/property/klinger-house-sketch-bw.webp",width:1536,height:1024,alt:"Architectural sketch of The Vues at Klinger Lake"}]},
  twitter:{card:"summary_large_image",title:"Klinger Lake Vacation Rental near Sturgis, MI | Sleeps 12 | The Vues",description:"A four-bedroom lakefront vacation rental with loft sleeping space, private shoreline, dock, kayaks and room for 12 guests.",images:["/property/klinger-house-sketch-bw.webp"]},
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><head><link rel="preconnect" href="https://www.googletagmanager.com"/><link rel="preconnect" href="https://my.matterport.com"/><link rel="dns-prefetch" href="//my.matterport.com"/></head><body>{children}</body></html>
}

