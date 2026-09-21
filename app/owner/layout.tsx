import type {Metadata} from "next";

export const metadata:Metadata={
  title:"Owner | The Vues",
  alternates:{canonical:"https://vuesmi.com/owner"},
  robots:{index:false,follow:false},
};

export default function OwnerLayout({children}:{children:React.ReactNode}){
  return children;
}
