"use client";
import { useEffect,useState } from "react";

type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};

export default function InstallApp(){
  const [promptEvent,setPromptEvent]=useState<InstallPromptEvent|null>(null);
  const [showHelp,setShowHelp]=useState(false);
  const [installed,setInstalled]=useState(false);

  useEffect(()=>{
    if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
    const standalone=window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&(navigator as Navigator&{standalone?:boolean}).standalone===true);
    setInstalled(standalone);
    const ready=(event:Event)=>{event.preventDefault();setPromptEvent(event as InstallPromptEvent)};
    const complete=()=>{setInstalled(true);setPromptEvent(null);setShowHelp(false)};
    window.addEventListener("beforeinstallprompt",ready);
    window.addEventListener("appinstalled",complete);
    return()=>{window.removeEventListener("beforeinstallprompt",ready);window.removeEventListener("appinstalled",complete)};
  },[]);

  async function install(){
    if(promptEvent){
      await promptEvent.prompt();
      const choice=await promptEvent.userChoice;
      if(choice.outcome==="accepted")setInstalled(true);
      setPromptEvent(null);
      return;
    }
    setShowHelp(true);
  }

  if(installed)return <span>App installed</span>;
  return <div className="installApp">
    <button className="installAppButton" type="button" onClick={install}>Install The Vues app</button>
    {showHelp&&<div className="installHelp" role="status">
      <p><strong>Install The Vues</strong></p>
      <p>On iPhone or iPad, tap the Share button, then choose <strong>Add to Home Screen</strong>. On a computer, use your browser menu and choose <strong>Install app</strong>.</p>
      <button type="button" onClick={()=>setShowHelp(false)}>Got it</button>
    </div>}
  </div>;
}
