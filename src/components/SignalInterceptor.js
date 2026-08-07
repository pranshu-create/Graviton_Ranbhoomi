"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Terminal } from "lucide-react";
import GlitchText from "@/components/GlitchText";
import { useState, useEffect } from "react";

export default function SignalInterceptor({ eventName, onClose }) {
  const [dataStream, setDataStream] = useState("");
  
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const interval = setInterval(() => {
      let str = "";
      for(let i=0; i<150; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setDataStream(str);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-hidden"
      >
        {/* Radar Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[800px] h-[800px] rounded-full border border-red-500/30 flex items-center justify-center">
            <div className="w-[600px] h-[600px] rounded-full border border-red-500/40 flex items-center justify-center">
              <div className="w-[400px] h-[400px] rounded-full border border-red-500/50"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[2px] bg-gradient-to-r from-red-500/80 to-transparent origin-left animate-[spin_3s_linear_infinite]"></div>
          </div>
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>

        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative z-20 w-full max-w-2xl bg-black/80 border border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)] p-8"
          style={cutCorners}
        >
          {/* Animated red border top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-[scan_2s_linear_infinite]"></div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            
            <div>
              <h2 className="font-display font-black text-4xl text-red-500 tracking-tighter uppercase mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                <GlitchText text="SIGNAL INTERCEPTED" />
              </h2>
              <p className="font-mono text-sm text-white tracking-[0.3em] uppercase bg-red-600 px-3 py-1 inline-block">
                CHANNEL LOCKED BY OVERWATCH HQ
              </p>
            </div>
            
            <div className="w-full bg-red-950/30 border border-red-900 p-4 text-left font-mono text-xs overflow-hidden h-32 relative">
              <div className="flex items-center text-red-500 mb-2 border-b border-red-900/50 pb-2">
                <Terminal className="w-4 h-4 mr-2" />
                <span>TERMINAL_OUTPUT // SYSTEM_ERR</span>
              </div>
              <p className="text-red-400 break-all leading-tight opacity-70">
                {dataStream}
              </p>
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 p-2 border border-red-500/30 text-red-500 text-center font-bold">
                REGISTRATIONS FOR <span className="text-white">[{eventName}]</span> ARE CURRENTLY FROZEN.
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full py-4 bg-red-500/10 border border-red-500 text-red-500 font-mono text-sm uppercase tracking-[0.3em] font-bold hover:bg-red-500 hover:text-black transition-all duration-300"
              style={cutCorners}
            >
              ACKNOWLEDGE & DISCONNECT
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
