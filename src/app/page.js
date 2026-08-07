"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TimelineSection from "@/components/TimelineSection";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

export default function Home() {
  const router = useRouter();
  const constraintsRef = useRef(null);

  const handleNavigate = () => {
    router.push("/comm-center");
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center min-h-screen relative z-10 w-full overflow-x-hidden bg-transparent">
        
        {/* Background ambient text (huge, scrolling) */}
        <div className="absolute top-[20vh] left-0 w-[200vw] overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none z-0">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="font-display font-black text-[30vh] tracking-tighter leading-none"
          >
            RANBHOOMI WINTER 26 GRAVITON ROBOTICS RANBHOOMI WINTER 26
          </motion.div>
        </div>

        {/* HERO SECTION - PERFECT ORBITAL REPLICA */}
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
          
          {/* Orbital Rings Background SVG - Shifted up to avoid button overlap */}
          {/* On mobile: scale-[0.38] shrinks the 800px container visually; section overflow-hidden clips any remainder */}
          {/* On desktop (md+): scale-100 restores original appearance — NO desktop change */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0 flex items-center justify-center scale-[0.55] md:scale-100">


            {/* Center Interactive Logo */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
              className="absolute w-[200px] h-[200px] z-10 opacity-70 flex items-center justify-center"
              style={{ perspective: 1000 }}
            >
              <motion.div
                animate={{ rotateX: [0, 20, 0], rotateY: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <img src="/Raw.png" alt="Raw Logo" className="w-full h-full object-contain mix-blend-screen" />
              </motion.div>
            </motion.div>

            {/* Orbit SVG 1 */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
              className="absolute w-[300px] h-[300px]"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
              </svg>
            </motion.div>

            {/* Orbit SVG 2 */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
              className="absolute w-[500px] h-[500px]"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
              </svg>
            </motion.div>

            {/* Orbit SVG 3 */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
              className="absolute w-[700px] h-[700px]"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" strokeDasharray="1,1" />
              </svg>
            </motion.div>
            
          </div>

          {/* Centered Typography */}
          <div className="relative z-20 text-center px-4 flex flex-col items-center justify-center w-full mt-[-5vh]">
            <motion.p 
              initial={{ opacity: 0, tracking: "0em" }}
              animate={{ opacity: 1, tracking: "0.3em" }}
              transition={{ duration: 1.2 }}
              className="text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] mb-4"
            >
              TECHNICAL ROBOTICS FEST
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-display font-black text-4xl sm:text-6xl md:text-8xl lg:text-[8rem] tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] leading-none mb-6 uppercase flex flex-col md:flex-row items-center justify-center gap-4"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500">RANBHOOMI</span>
              <span className="text-neon-cyan text-glow-cyan">2.0</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ duration: 1, delay: 0.6 }}
              className="relative flex items-center justify-center max-w-2xl mx-auto w-full mb-10"
            >
               <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent absolute"></div>
               <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="bg-black px-4 text-gray-300 font-mono text-[9px] md:text-[11px] uppercase tracking-[0.4em] relative z-10"
              >
                CHRONOVERSE: PAST, PRESENT, FUTURE
              </motion.p>
            </motion.div>
            
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              onClick={handleNavigate}
              className="relative flex items-center justify-center px-12 py-4 group bg-transparent border-none outline-none mt-[8vh] cursor-pointer"
            >
              {/* Image-accurate bracket corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-neon-cyan transition-all duration-300 group-hover:w-full group-hover:h-full group-hover:bg-neon-cyan/5 animate-pulse md:animate-none"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-neon-cyan transition-all duration-300 group-hover:w-full group-hover:h-full group-hover:bg-neon-cyan/5 animate-pulse md:animate-none"></div>
              
              <span className="font-mono text-sm tracking-[0.3em] text-neon-cyan md:text-gray-300 md:group-hover:text-neon-cyan transition-colors z-10 flex items-center gap-3 uppercase">
                NAVIGATE <span className="text-neon-cyan font-sans">-&gt;</span>
              </span>
            </motion.button>

            {/* Hype Prize Pool */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-12 text-center flex flex-col items-center"
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">&gt; TOTAL_BOUNTY_POOL</p>
              
              <motion.div className="relative group inline-block cursor-default" whileHover={{ scale: 1.05 }}>
                <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-neon-cyan tracking-tighter drop-shadow-[0_0_15px_rgba(102,252,241,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(102,252,241,0.8)] relative z-10">
                  ₹85,000+
                </h2>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Event Schedule Section */}
        <TimelineSection />

      </main>
      <Footer />
    </>
  );
}
