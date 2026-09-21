import type {Metadata} from "next";
import CancelRequest from "./cancel-request";
export const metadata:Metadata={title:"Cancel a Booking Request | The Vues",alternates:{canonical:"https://vuesmi.com/booking/cancel"},robots:{index:false,follow:false}};
export default async function CancelPage({searchParams}:{searchParams:Promise<{id?:string;token?:string}>}){const params=await searchParams;const id=Number(params.id),token=params.token??"";return <main className="cancelShell">{Number.isInteger(id)&&id>0&&token?<CancelRequest id={id} token={token}/>:<div className="cancelCard"><h1>Invalid cancellation link</h1><p>Please use the button in your booking-request email.</p><a href="/">Return to The Vues</a></div>}</main>}

