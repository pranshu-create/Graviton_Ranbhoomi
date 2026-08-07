"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

export default function AcceptanceLetter({ teamName, eventName, teamId, onClose }) {
  const cutCorners = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };
  const sealCut = { clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={cutCorners}
          className="relative max-w-2xl w-full bg-[#0a0a0a] border-2 border-neon-cyan p-1 sm:p-2 shadow-[0_0_50px_rgba(102,252,241,0.3)]"
        >
          {/* Internal Border */}
          <div className="w-full h-full border border-neon-cyan/30 p-8 relative overflow-hidden" style={cutCorners}>
            
            {/* Background Ink / Tech Effects */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-0 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 2 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl z-0 pointer-events-none"
            ></motion.div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-neon-cyan/10 border border-neon-cyan rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(102,252,241,0.4)]">
                <CheckCircle className="w-8 h-8 text-neon-cyan" />
              </div>
              
              <p className="font-mono text-neon-cyan tracking-[0.3em] uppercase text-xs mb-2">
                GRAVITON ROBOTICS HQ
              </p>
              
              <h1 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tighter mb-8 border-b border-white/10 pb-6 w-full">
                OFFICIAL <span className="text-neon-cyan text-glow-cyan">ENLISTMENT</span> ORDER
              </h1>
              
              <div className="space-y-6 w-full text-left">
                <div className="bg-white/5 p-4 border-l-2 border-neon-cyan">
                  <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">OPERATIVE / SQUAD</p>
                  <p className="font-display text-2xl text-white uppercase">{teamName}</p>
                </div>
                
                <div className="bg-white/5 p-4 border-l-2 border-electric-purple">
                  <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">ASSIGNED MISSION</p>
                  <p className="font-display text-2xl text-white uppercase">{eventName}</p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">CLEARANCE CODE</p>
                    <p className="font-mono text-sm text-neon-cyan uppercase">{teamId}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">STATUS</p>
                    <p className="font-mono text-sm text-green-500 uppercase font-bold tracking-widest">VERIFIED</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button 
                  onClick={onClose}
                  style={sealCut}
                  className="px-8 py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-mono text-sm font-bold tracking-[0.2em] uppercase hover:bg-neon-cyan hover:text-black transition-all hover:shadow-[0_0_20px_rgba(102,252,241,0.6)]"
                >
                  ACKNOWLEDGE ORDERS
                </button>
              </div>
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
