"use client";

import type {AnchorHTMLAttributes,ReactNode} from "react";
import {trackEvent,type AnalyticsEvent,type EventParameters} from "./analytics";

type Props=AnchorHTMLAttributes<HTMLAnchorElement>&{
  children:ReactNode;
  eventName:AnalyticsEvent;
  eventParameters?:EventParameters;
};

export default function TrackedLink({children,eventName,eventParameters,onClick,...props}:Props){
  return <a {...props} onClick={event=>{
    trackEvent(eventName,eventParameters);
    onClick?.(event);
  }}>{children}</a>;
}
