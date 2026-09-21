import type {Metadata} from "next";
import Link from "next/link";
export const metadata:Metadata={title:"Booking Confirmed | The Vues",alternates:{canonical:"https://vuesmi.com/booking/success"},robots:{index:false,follow:false}};
export default function BookingSuccess(){return <main className="ownerShell"><div className="ownerDenied"><p className="eyebrow">Payment received</p><h1>Your stay is confirmed.</h1><p>Thank you for choosing The Vues at Klinger Lake. A confirmation is on its way to your email.</p><Link href="/">Return to The Vues</Link></div></main>}
