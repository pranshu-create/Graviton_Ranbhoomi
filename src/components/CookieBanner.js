"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShowBanner(false);
  };

  const cutCorners = { clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-black/90 backdrop-blur-md border border-electric-purple/50 p-4 z-50 shadow-[0_0_15px_rgba(188,19,254,0.3)]"
          style={cutCorners}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <h3 className="text-electric-purple font-display font-bold text-sm tracking-wider uppercase">
                &gt; Cookie_Protocol
              </h3>
            </div>
            <p className="text-gray-400 font-mono text-xs leading-relaxed">
              RANBHOOMI utilizes essential cookies to ensure optimal system performance and secure connections. Acknowledge to proceed.
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-electric-purple/20 border border-electric-purple text-electric-purple hover:bg-electric-purple hover:text-white transition-all font-mono text-xs uppercase tracking-widest"
                style={cutCorners}
              >
                Acknowledge
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
