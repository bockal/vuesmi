import type { MetadataRoute } from "next";

export default function manifest():MetadataRoute.Manifest{
  return {
    name:"The Vues at Klinger Lake",
    short_name:"The Vues",
    description:"Owner bookings and guest information for The Vues at Klinger Lake.",
    start_url:"/",
    display:"standalone",
    background_color:"#ffffff",
    theme_color:"#173f3a",
    icons:[{src:"/vues-bell.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}],
  };
}
