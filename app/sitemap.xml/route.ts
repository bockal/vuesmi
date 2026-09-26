import { lakeLifeStoryImages } from "../lake-life-story";

export async function GET(){
  const lastmod=new Date().toISOString();
  const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://vuesmi.com/</loc>
    <lastmod>${lastmod}</lastmod>
    ${["/bedrooms/master-bedroom.jpg","/property/bathroom-1.jpg","/property/bathroom-2.jpg","/property/open-living-dining.jpg"].map(src=>`<image:image><image:loc>https://vuesmi.com${src}</image:loc></image:image>`).join("\n    ")}
    ${lakeLifeStoryImages.map(({src})=>`<image:image><image:loc>https://vuesmi.com${src}</image:loc></image:image>`).join("\n    ")}
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://vuesmi.com/house-rules</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
  return new Response(xml,{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=3600"}});
}

