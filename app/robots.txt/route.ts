export async function GET(){
  const text=`User-agent: *
Allow: /
Disallow: /owner/
Disallow: /api/

Sitemap: https://vuesmi.com/sitemap.xml
Host: https://vuesmi.com
`;
  return new Response(text,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=3600"}});
}

