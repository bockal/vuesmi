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

async function ensureFinalPaymentColumns(env:Env){
  const info=await env.DB.prepare("PRAGMA table_info(booking_requests)").all<{name:string}>();
  const existing=new Set((info.results??[]).map(row=>row.name));
  for(const [name,type] of [["final_payment_received_at","text"],["final_payment_reminder_sent_at","text"],["check_in_instructions","text"]] as const){
    if(existing.has(name))continue;
    try{await env.DB.prepare(`ALTER TABLE booking_requests ADD COLUMN ${name} ${type}`).run()}
    catch(error){if(!/duplicate column name/i.test(error instanceof Error?error.message:String(error)))throw error}
  }
}

function easternDate(now=new Date()){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
}

function addDays(date:string,days:number){
  const [y,m,d]=date.split("-").map(Number);
  const value=new Date(Date.UTC(y,m-1,d+days));
  return value.toISOString().slice(0,10);
}

function depositFor(totalCents:number){
  return Math.min(totalCents,Math.max(25_000,Math.round(totalCents*.30)));
}

async function sendFinalPaymentReminders(env:Env){
  await ensureFinalPaymentColumns(env);
  const arrival=addDays(easternDate(),7);
  const {results}=await env.DB.prepare("SELECT id, name, email, arrival, departure, quote_cents FROM booking_requests WHERE status = 'confirmed' AND rules_acknowledged_at IS NOT NULL AND final_payment_received_at IS NULL AND final_payment_reminder_sent_at IS NULL AND arrival = ? ORDER BY id LIMIT 25").bind(arrival).all<{id:number;name:string;email:string;arrival:string;departure:string;quote_cents:number|null}>();
  for(const booking of results){
    if(booking.quote_cents==null)continue;
    const balance=Math.max(0,booking.quote_cents-depositFor(booking.quote_cents));
    try{
      const sent=await sendMailWithRuntime({to:booking.email,subject:"Final payment reminder — The Vues at Klinger Lake",html:`<h2>Final payment reminder</h2><p>Hi ${escapeHtml(booking.name)}, your stay at The Vues at Klinger Lake begins on <strong>${escapeHtml(booking.arrival)}</strong>.</p><p>Your remaining balance is <strong>${(balance/100).toFixed(2)}</strong>.</p><p style="margin:22px 0"><a href="https://www.venmo.com/u/KlingerLake68109" style="display:inline-block;background:#008CFF;color:#fff;text-decoration:none;padding:13px 18px;border-radius:7px;font-weight:bold">Pay with Venmo</a></p><div style="margin:24px 0;padding:18px;border:1px solid #e5e5e5;border-radius:10px;text-align:center"><p style="margin:0 0 10px"><strong>Or pay with Zelle</strong></p><img src="https://vuesmi.com/zelle-payment-qr.png" width="220" height="220" alt="Zelle payment QR code for Aubrey Backscheider" style="display:block;width:220px;height:220px;margin:0 auto 10px;border:0"><p style="margin:0"><strong>Aubrey Backscheider</strong><br>(513) 800-7366</p></div><p>Please include memo <strong>VUES-${booking.id}</strong>.</p><p>Once the final payment is received, we’ll send your check-in and access instructions.</p>`},env);
      if(sent.sent)await env.DB.prepare("UPDATE booking_requests SET final_payment_reminder_sent_at = CURRENT_TIMESTAMP WHERE id = ? AND final_payment_reminder_sent_at IS NULL").bind(booking.id).run();
    }catch(error){console.error(JSON.stringify({event:"final_payment_reminder_failed",bookingId:booking.id,error:error instanceof Error?error.message:"unknown"}))}
  }
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

    const response=await handler.fetch(request, env, ctx);
    const measurementId=env.GA_MEASUREMENT_ID;
    if(!response.headers.get("content-type")?.startsWith("text/html")||!measurementId||!/^G-[A-Z0-9]+$/.test(measurementId))return response;
    const analytics=`<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(measurementId)});</script>`;
    return new HTMLRewriter().on("head",{element(element){element.prepend(analytics,{html:true})}}).transform(response);
  },
  async scheduled(_controller:ScheduledController,env:Env,ctx:ExecutionContext){
    ctx.waitUntil(Promise.all([sendReviewFollowups(env),sendFinalPaymentReminders(env)]));
  },
};

export default worker;
