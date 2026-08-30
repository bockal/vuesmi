type EventParameters=Record<string,string|number|boolean>;

declare global{
  interface Window{gtag?:(command:"event",name:string,parameters?:EventParameters)=>void}
}

export function trackEvent(name:string,parameters:EventParameters={}){
  window.gtag?.("event",name,parameters);
}

