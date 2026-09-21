export type AnalyticsEvent=
  |"view_availability"
  |"click_book_now"
  |"map_directions"
  |"photo_gallery_open"
  |"virtual_tour_start"
  |"phone_call"
  |"email_host"
  |"download_guide"
  |"booking_start"
  |"booking_complete"
  |"form_started"
  |"quote_displayed"
  |"request_submitted";

export type EventParameters=Record<string,string|number|boolean>;

declare global{
  interface Window{gtag?:(command:"event",name:string,parameters?:EventParameters)=>void}
}

export function trackEvent(name:AnalyticsEvent,parameters:EventParameters={}){
  window.gtag?.("event",name,parameters);
}

