"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Template({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    // Play the transition audio on every page transition/mount
    const playTransitionAudio = async () => {
      try {
        const audio = new Audio('/Transition-audio.mp3');
        audio.volume = 0.5; // Set volume to 50%
        await audio.play();
      } catch (error) {
        // This fails silently if the user hasn't interacted with the page yet (browser policy)
        console.log("Transition audio play blocked by browser:", error);
      }
    };
    
    playTransitionAudio();
  }, []);

  return (
    <>
      {/* Clean System Boot Overlay */}
      <motion.div 
        className="fixed inset-0 z-[100] bg-[#02050A] pointer-events-none flex items-center justify-center border-t-2 border-neon-cyan"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 1.2 }}
      >
        <motion.div 
          className="flex flex-col items-center w-full max-w-sm px-6"
          initial={{ scale: 0.95, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <img src="/logo.png" alt="System Logo" className="w-24 h-24 object-contain mb-8 animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          <span className="text-neon-cyan font-mono text-xs tracking-[0.4em] uppercase mb-6 text-center">
            ESTABLISHING_UPLINK
          </span>
          
          {/* Terminal Boot Sequence */}
          <div className="w-full flex flex-col gap-3 font-mono text-[10px] text-gray-500 uppercase tracking-widest text-left border-t border-white/10 pt-6">
             <div className="flex justify-between items-center">
                <span>[TARGET_VECTOR]</span> 
                <span className="text-white">{pathname || "/"}</span>
             </div>
             <div className="flex justify-between items-center">
                <span>[NEURAL_NET]</span> 
                <span className="text-neon-cyan">SYNCED</span>
             </div>
             <div className="flex justify-between items-center">
                <span>[DATALOG_ACCESS]</span> 
                <span className="text-neon-cyan animate-pulse">VERIFYING...</span>
             </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Clean Content Fade In */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </>
  );
}
