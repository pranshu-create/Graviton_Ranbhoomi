"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import GlitchText from "@/components/GlitchText";

export default function CyberHoneypot() {
  const [logged, setLogged] = useState(false);
  const [ipInfo, setIpInfo] = useState("LOCATING...");

  useEffect(() => {
    // 1. Play harsh siren using Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      try {
        const ctx = new AudioContext();
        
        const playSiren = (freq1, freq2, duration) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq1, ctx.currentTime);
          osc.frequency.setValueAtTime(freq2, ctx.currentTime + 0.5);
          osc.frequency.setValueAtTime(freq1, ctx.currentTime + 1);
          
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // keep it somewhat reasonable so ears don't bleed, but harsh
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + duration);
        };
        
        // Loop the siren a few times
        for (let i = 0; i < 5; i++) {
          setTimeout(() => playSiren(800, 1200, 1), i * 1000);
        }
      } catch (e) {
        console.warn("Audio not supported or blocked", e);
      }
    }

    // 2. Fetch IP locally just for the scary UI effect
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        setIpInfo(data.ip);
      })
      .catch(() => setIpInfo("UNKNOWN"));

    // 3. Log to our backend honeypot
    fetch("/api/honeypot", { method: "POST" })
      .then(() => setLogged(true))
      .catch(() => setLogged(true));
      
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-red-950 flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-red-500 selection:text-black">
      {/* Glitch overlays */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      
      {/* Red flashing vignette */}
      <motion.div 
        animate={{ opacity: [0.1, 0.5, 0.1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute inset-0 shadow-[inset_0_0_150px_rgba(255,0,0,0.8)] pointer-events-none"
      />

      <div className="max-w-4xl w-full text-center relative z-10 space-y-8 p-10 border-4 border-red-600 bg-black/80 shadow-[0_0_100px_rgba(255,0,0,0.5)]">
        <ShieldAlert className="w-32 h-32 text-red-600 mx-auto animate-pulse" />
        
        <div>
          <h1 className="text-5xl md:text-7xl font-black text-red-600 tracking-widest uppercase mb-4">
            <GlitchText text="CRITICAL WARNING" />
          </h1>
          <p className="text-2xl md:text-3xl text-red-400 font-bold tracking-[0.2em] uppercase">
            UNAUTHORIZED ACCESS ATTEMPT DETECTED
          </p>
        </div>

        <div className="bg-red-900/40 border border-red-500 p-6 inline-block mx-auto text-left w-full md:w-auto">
          <p className="font-mono text-red-300 text-lg mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> HONEYPOT TRIGGERED
          </p>
          <ul className="font-mono text-sm md:text-base text-red-400 space-y-2 mt-4">
            <li><span className="text-gray-500">TARGET:</span> /admin-panel-secret</li>
            <li><span className="text-gray-500">PROTOCOL:</span> GRAVITON DEFENSE INITIATIVE</li>
            <li><span className="text-gray-500">ACTION:</span> NETWORK LOCKDOWN INITIATED</li>
            <li className="pt-4 border-t border-red-900 mt-4">
              <span className="text-gray-500">INTRUDER IP:</span> <span className="font-bold text-white tracking-widest">{ipInfo}</span>
            </li>
            <li>
              <span className="text-gray-500">STATUS:</span> {logged ? <span className="text-red-500 font-bold animate-pulse">LOGGED TO SECURITY DATABASE</span> : "LOGGING..."}
            </li>
          </ul>
        </div>

        <p className="text-gray-400 font-mono text-xs max-w-lg mx-auto leading-relaxed">
          This incident has been recorded and flagged. Repeated attempts to access restricted directories will result in automatic IP blacklisting and potential disqualification from RANBHOOMI.
        </p>
      </div>
    </div>
  );
}
