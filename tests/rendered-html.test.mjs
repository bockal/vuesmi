import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("build contains the site-wide GA4 injection",async()=>{
  const [worker,config,bundle]=await Promise.all([
    read("worker/index.ts"),
    read("wrangler.jsonc"),
    read("dist/server/index.js"),
  ]);
  assert.match(config,/"GA_MEASUREMENT_ID": "G-VV1S1RMN3C"/);
  assert.match(worker,/new HTMLRewriter\(\)\.on\("head"/);
  assert.match(worker,/element\.prepend\(analytics,\{html:true\}\)/);
  assert.match(bundle,/googletagmanager\.com\/gtag\/js/);
});

test("source contains the canonical, social, schema, and icon foundation",async()=>{
  const [layout,home,rules]=await Promise.all([
    read("app/layout.tsx"),
    read("app/page.tsx"),
    read("app/house-rules/page.tsx"),
  ]);
  assert.match(layout,/alternates:\{canonical:"https:\/\/vuesmi\.com\/"\}/);
  assert.match(layout,/openGraph:/);
  assert.match(layout,/twitter:/);
  assert.match(layout,/apple-touch-icon\.png/);
  assert.match(layout,/rel="preconnect"/);
  assert.match(home,/"@type":"Organization"/);
  assert.match(home,/"@type":"VacationRental"/);
  assert.match(home,/rel="preload" href="\/property\/cottage-from-water\.webp"/);
  assert.match(rules,/canonical:"https:\/\/vuesmi\.com\/house-rules"/);
});

test("robots and sitemap use the public canonical origin",async()=>{
  const [robots,sitemap]=await Promise.all([
    read("app/robots.txt/route.ts"),
    read("app/sitemap.xml/route.ts"),
  ]);
  assert.match(robots,/Sitemap: https:\/\/vuesmi\.com\/sitemap\.xml/);
  assert.match(sitemap,/<loc>https:\/\/vuesmi\.com\/<\/loc>/);
  assert.match(sitemap,/<loc>https:\/\/vuesmi\.com\/house-rules<\/loc>/);
});

test("supported booking interactions use reusable analytics events",async()=>{
  const [analytics,booking,availability,bedrooms,home]=await Promise.all([
    read("app/analytics.ts"),
    read("app/booking-form.tsx"),
    read("app/availability-calendar.tsx"),
    read("app/bedroom-slider.tsx"),
    read("app/page.tsx"),
  ]);
  for(const event of ["view_availability","map_directions","photo_gallery_open","virtual_tour_start","email_host","booking_start"]){
    assert.match(analytics,new RegExp(`["']${event}["']`));
  }
  assert.match(booking,/trackEvent\("booking_start"/);
  assert.match(booking,/trackEvent\("request_submitted"/);
  assert.doesNotMatch(booking,/trackEvent\("booking_complete"/);
  assert.match(availability,/trackEvent\("view_availability"/);
  assert.match(bedrooms,/trackEvent\("photo_gallery_open"/);
  assert.match(home,/eventName="map_directions"/);
  assert.match(home,/eventName="virtual_tour_start"/);
});
