"use client";

import { motion } from "framer-motion";

export default function MechHUD() {
  return (
    // Hidden on mobile — prevents corner HUD overlapping content on small screens
    // md:block restores full display on tablets and desktop, no change to desktop appearance
    <div className="hidden md:block">
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden mix-blend-screen opacity-60">
        {/* Top Left Corner */}
        <div className="absolute top-4 left-4 w-32 h-32 border-l-2 border-t-2 border-neon-cyan opacity-80" />
        <div className="absolute top-6 left-6 font-mono text-[10px] text-neon-cyan tracking-widest uppercase">
          SYS.V 2.0.4<br />
          <span className="animate-pulse">RECORDING...</span>
        </div>

        {/* Top Right Corner */}
        <div className="absolute top-4 right-4 w-32 h-32 border-r-2 border-t-2 border-neon-cyan opacity-80" />
        <div className="absolute top-6 right-6 font-mono text-[10px] text-neon-cyan tracking-widest text-right uppercase">
          PWR: 100%<br />
          NET: STABLE
        </div>

        {/* Bottom Left Corner */}
        <div className="absolute bottom-4 left-4 w-32 h-32 border-l-2 border-b-2 border-neon-cyan opacity-80" />
        <div className="absolute bottom-6 left-6 font-mono text-[10px] text-neon-cyan tracking-widest uppercase">
          TGT_LOCK: N/A<br />
          COORD: X-84 Y-92
        </div>

        {/* Bottom Right Corner */}
        <div className="absolute bottom-4 right-4 w-32 h-32 border-r-2 border-b-2 border-neon-cyan opacity-80" />
        
        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full text-neon-cyan stroke-current">
            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="0.5" strokeDasharray="2, 4" />
            <circle cx="50" cy="50" r="30" fill="none" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="15" strokeWidth="0.5" />
            <line x1="50" y1="85" x2="50" y2="100" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="15" y2="50" strokeWidth="0.5" />
            <line x1="85" y1="50" x2="100" y2="50" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Grid Lines Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #66FCF1 1px, transparent 1px),
              linear-gradient(to bottom, #66FCF1 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />
        
        {/* Moving scanline */}
        <motion.div 
          animate={{ y: ["-10vh", "110vh"] }}
          transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          className="absolute left-0 w-full h-32 bg-gradient-to-b from-transparent via-neon-cyan/10 to-transparent"
        />
      </div>
    </div>
  );
}
