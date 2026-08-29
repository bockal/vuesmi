import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={
  metadataBase:new URL("https://vuesmi.com"),
  title:"The Vues at Klinger Lake",
  description:"A private lakefront retreat on Klinger Lake in Sturgis, Michigan. Explore the home and request your stay directly with the owners.",
  manifest:"/manifest.webmanifest",
  appleWebApp:{capable:true,title:"The Vues",statusBarStyle:"default"},
  icons:{icon:"/favicon.svg",shortcut:"/favicon.svg",apple:"/favicon.svg"},
  openGraph:{title:"The Vues at Klinger Lake",description:"Check availability and request your stay at our private Klinger Lake cottage.",type:"website",url:"https://vuesmi.com",images:[{url:"/property/klinger-house-sketch-bw.webp",width:1536,height:1024,alt:"Architectural sketch of The Vues at Klinger Lake"}]},
  twitter:{card:"summary_large_image",title:"The Vues at Klinger Lake",description:"Check availability and request your stay at our private Klinger Lake cottage.",images:["/property/klinger-house-sketch-bw.webp"]},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

