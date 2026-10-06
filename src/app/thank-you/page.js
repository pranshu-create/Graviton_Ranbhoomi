"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import GlitchText from "@/components/GlitchText";

export default function ThankYouPage() {
  const cutCorners = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 flex items-center justify-center min-h-[80vh] relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl relative"
        >
          <div className="absolute inset-0 bg-neon-cyan/5 blur-3xl rounded-full"></div>
          
          <div style={cutCorners} className="bg-black/80 backdrop-blur-md p-10 border border-neon-cyan/30 relative overflow-hidden group text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite]"></div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-cyan/10 border border-neon-cyan mb-6 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <svg className="w-10 h-10 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="font-display font-black text-4xl text-white tracking-tighter mb-4 uppercase">
              TRANSACTION <GlitchText text="COMPLETE" className="text-neon-cyan text-glow-cyan" />
            </h1>
            
            <p className="font-mono text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              Your registration data has been successfully securely transmitted to the central server. Welcome to RANBHOOMI. Prepare your systems for combat.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="px-8 py-4 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all font-display font-bold tracking-[0.2em] shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]" style={cutCorners}>
                ENTER_DASHBOARD
              </Link>
              <Link href="/" className="px-8 py-4 bg-white/5 border border-white/20 text-white hover:bg-white hover:text-black transition-all font-display font-bold tracking-[0.2em]" style={cutCorners}>
                RETURN_TO_BASE
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
