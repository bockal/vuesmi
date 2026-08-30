export async function GET(){
  const lastmod=new Date().toISOString();
  const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vuesmi.com/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  return new Response(xml,{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=3600"}});
}

