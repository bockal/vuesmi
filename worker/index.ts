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
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
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

    return handler.fetch(request, env, ctx);
  },
  async scheduled(_controller:ScheduledController,env:Env,ctx:ExecutionContext){
    ctx.waitUntil(sendReviewFollowups(env));
  },
};

export default worker;
