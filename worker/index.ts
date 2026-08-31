/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { escapeHtml, sendMailWithRuntime } from "../app/email";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
  GA_MEASUREMENT_ID?: string;
  INSTAGRAM_ACCESS_TOKEN?: string;
  INSTAGRAM_USER_ID?: string;
  INSTAGRAM_HASHTAG_ID?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type InstagramMedia={id:string;caption?:string;media_type:string;media_url?:string;permalink:string;thumbnail_url?:string;timestamp?:string};

async function instagramFeed(request:Request,env:Env,ctx:ExecutionContext){
  if(!env.INSTAGRAM_ACCESS_TOKEN||!env.INSTAGRAM_USER_ID||!env.INSTAGRAM_HASHTAG_ID){
    return Response.json({items:[]},{status:503,headers:{"Cache-Control":"no-store"}});
  }

  const cache=caches.default;
  const cacheKey=new Request(new URL("/api/instagram-feed",request.url),{method:"GET"});
  const cached=await cache.match(cacheKey);
  if(cached)return cached;

  const fields="id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
  const endpoint=(kind:"recent_media"|"top_media")=>{
    const url=new URL(`https://graph.facebook.com/v26.0/${env.INSTAGRAM_HASHTAG_ID}/${kind}`);
    url.searchParams.set("user_id",env.INSTAGRAM_USER_ID!);
    url.searchParams.set("fields",fields);
    url.searchParams.set("limit","25");
    url.searchParams.set("access_token",env.INSTAGRAM_ACCESS_TOKEN!);
    return url;
  };

  try{
    const read=async(kind:"recent_media"|"top_media")=>{
      const response=await fetch(endpoint(kind),{headers:{Accept:"application/json"}});
      if(!response.ok)throw new Error(`Instagram ${kind} returned ${response.status}`);
      const payload=await response.json() as {data?:InstagramMedia[]};
      return payload.data??[];
    };
    const [recent,top]=await Promise.all([read("recent_media"),read("top_media")]);
    const discovered=new Map<string,InstagramMedia>();
    for(const item of [...recent,...top])if(item.permalink&&(item.media_url||item.thumbnail_url))discovered.set(item.id,item);

    if(discovered.size){
      const statements=[...discovered.values()].map(item=>env.DB.prepare("INSERT INTO instagram_hashtag_media (id, caption, image_url, permalink, posted_at, last_seen_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET caption=excluded.caption, image_url=excluded.image_url, permalink=excluded.permalink, posted_at=excluded.posted_at, last_seen_at=CURRENT_TIMESTAMP").bind(item.id,item.caption?.slice(0,500)??"",item.media_type==="VIDEO"?item.thumbnail_url:item.media_url,item.permalink,item.timestamp??new Date().toISOString()));
      await env.DB.batch(statements);
    }

    const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",month:"2-digit",day:"2-digit"}).format(new Date()).split("-").slice(-2).join("-");
    const timehop=await env.DB.prepare("SELECT id, caption, image_url AS imageUrl, permalink, posted_at AS timestamp FROM instagram_hashtag_media WHERE substr(posted_at, 6, 5) = ? ORDER BY posted_at DESC LIMIT 5").bind(today).all();
    const fallback=timehop.results.length?timehop:await env.DB.prepare("SELECT id, caption, image_url AS imageUrl, permalink, posted_at AS timestamp FROM instagram_hashtag_media ORDER BY posted_at DESC LIMIT 5").all();
    const response=Response.json({items:fallback.results,timehop:timehop.results.length>0},{headers:{"Cache-Control":"public, max-age=300, s-maxage=900","X-Content-Type-Options":"nosniff"}});
    ctx.waitUntil(cache.put(cacheKey,response.clone()));
    return response;
  }catch(error){
    console.error(JSON.stringify({event:"instagram_feed_failed",error:error instanceof Error?error.message:"unknown"}));
    return Response.json({items:[]},{status:502,headers:{"Cache-Control":"no-store"}});
  }
}

function easternDateThreshold(now=new Date()){
  const values=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hourCycle:"h23"}).formatToParts(now).filter(part=>part.type!=="literal").map(part=>[part.type,part.value]));
  const localDate=Date.UTC(Number(values.year),Number(values.month)-1,Number(values.day));
  const daysBack=Number(values.hour)>=10?1:2;
  return new Date(localDate-daysBack*86_400_000).toISOString().slice(0,10);
}

async function sendReviewFollowups(env:Env){
  const threshold=easternDateThreshold();
  const {results}=await env.DB.prepare("SELECT id, name, email, departure FROM booking_requests WHERE status = 'confirmed' AND review_sent_at IS NULL AND departure <= ? ORDER BY departure LIMIT 25").bind(threshold).all<{id:number;name:string;email:string;departure:string}>();
  for(const booking of results){
    try{
      const result=await sendMailWithRuntime({to:booking.email,subject:"Thank you for staying at The Vues at Klinger Lake",html:`<h2>Thank you for staying with us</h2><p>Hi ${escapeHtml(booking.name)},</p><p>We hope you had a wonderful time together at Klinger Lake and traveled home safely. It was a pleasure to host you at our family cottage.</p><p>If you enjoyed your stay, would you take a moment to leave a Google review? Positive reviews help future guests discover The Vues and make it possible for us to keep welcoming families to the lake.</p><p style="margin:28px 0"><a href="https://maps.app.goo.gl/Q8psuLeMhAzbFGWGA" style="display:inline-block;background:#173f3a;color:#ffffff;text-decoration:none;padding:13px 18px;border-radius:7px;font-weight:bold">Leave a Google review</a></p><p>Thank you again for choosing The Vues at Klinger Lake. We would be delighted to welcome you back.</p><p>Warmly,<br><strong>The Bock family</strong></p>`},env);
      if(result.sent)await env.DB.prepare("UPDATE booking_requests SET review_sent_at = CURRENT_TIMESTAMP WHERE id = ? AND review_sent_at IS NULL").bind(booking.id).run();
    }catch(error){console.error(JSON.stringify({event:"review_followup_failed",bookingId:booking.id,error:error instanceof Error?error.message:"unknown"}))}
  }
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    if(url.pathname==="/api/instagram-feed"&&request.method==="GET")return instagramFeed(request,env,ctx);

    return handler.fetch(request, env, ctx);
  },
  async scheduled(_controller:ScheduledController,env:Env,ctx:ExecutionContext){
    ctx.waitUntil(sendReviewFollowups(env));
  },
};

export default worker;
