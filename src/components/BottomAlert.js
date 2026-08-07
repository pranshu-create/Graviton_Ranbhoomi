"use client";

import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function BottomAlert() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // mobile expand toggle
  const pathname = usePathname();

  // Do not render the alert on the super-admin page
  if (pathname?.startsWith("/super-admin")) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 50, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 md:bottom-8 left-1/2 z-[100] pointer-events-none w-[92%] md:w-[90%] max-w-4xl"
        >
          {/* 
            Pointer events are enabled on the inner container so users can click the close button, 
            but the outer wrapper is transparent to clicks.
          */}
          <div
            className="pointer-events-auto bg-[#0a0a0a] border-l-4 border-[#ff6b00] p-3 md:p-4 shadow-2xl flex items-start gap-3 md:gap-4 relative"
          >
            {/* Icon Box */}
            <div className="bg-[#1a110b] p-2 rounded-md shrink-0 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#ff6b00]" />
            </div>

            {/* Content Area */}
            <div className="flex flex-col gap-1.5 md:gap-2 pr-8 w-full">
              {/* Title Row */}
              <div className="flex items-center gap-3 md:gap-4">
                <span className="font-bold text-[#ff6b00] text-[10px] md:text-xs tracking-[0.2em] uppercase whitespace-nowrap">
                  OFFICIAL PROTOCOL
                </span>
                <div className="h-px bg-[#ff6b00]/30 w-10 md:w-16"></div>
              </div>

              {/* Text Body — truncated on mobile with expand toggle */}
              <p className={`text-gray-300 text-[10px] md:text-xs leading-relaxed font-sans transition-all ${
                isExpanded ? "" : "line-clamp-2 md:line-clamp-none"
              }`}>
                All events conducted under <span className="font-bold text-white">RANBHOOMI 2.0</span> are <span className="text-[#ff6b00]">ticketed events</span>. Only the officially prescribed registration fee for participation is permitted. All participants are welcome; however, blacklisted individuals or teams are not permitted to participate. No external guests or visitors are allowed without prior permission from the authorities. Any claim of ticket sales from unauthorized persons should be reported to <span className="text-white">GRAVITON</span> authorities.
              </p>

              {/* Expand toggle — only visible on mobile */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="md:hidden text-[#ff6b00] text-[9px] font-mono tracking-widest uppercase mt-0.5 text-left hover:text-[#ff8533] transition-colors"
              >
                {isExpanded ? "[ COLLAPSE ]" : "[ READ MORE ]"}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-[#ff6b00] hover:text-[#ff8533] p-1 transition-colors group"
              aria-label="Close Alert"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
