"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";
import { motion } from "framer-motion";

export default function TeamPage() {
  const extremeCut = { clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)" };
  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-electric-purple/20 -z-10"></div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 bg-background inline-block px-8 tracking-tighter">
            THE <GlitchText text="ARCHITECTS" className="text-electric-purple text-glow-purple" />
          </h1>
          <p className="font-mono text-xs text-gray-400 max-w-2xl mx-auto uppercase tracking-[0.3em]">
            &gt; MEET THE MINDS BEHIND THE MACHINE.
          </p>
        </div>

        {/* Core Team Section */}
        <section className="mb-24">
          <div className="flex items-center mb-12">
            <h2 className="font-display font-bold text-2xl text-neon-cyan tracking-[0.2em] uppercase whitespace-nowrap">
              &gt; CORE_COMMAND
            </h2>
            <div className="w-full h-px bg-neon-cyan/30 ml-6"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Pranshu Sharma", role: "President" },
              { name: "Neer Jain", role: "Vice-President" },
              { name: "Bhumi Agrawal", role: "Secretary" },
              { name: "Yana Patni", role: "Secretary" }
            ].map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative"
              >
                <div style={extremeCut} className="bg-black/60 border border-neon-cyan/20 md:border-white/10 p-4 relative overflow-hidden group-hover:border-neon-cyan/50 transition-colors duration-500 z-10">
                  <div className="w-full aspect-[3/4] bg-[#111] relative overflow-hidden mb-4" style={cutCorners}>
                    {/* Placeholder image effect */}
                    <div className="absolute inset-0 bg-[url('https://via.placeholder.com/300x400/1f2833/66FCF1?text=CORE')] bg-cover bg-center opacity-70 md:opacity-50 group-hover:opacity-100 transition-opacity duration-500 mix-blend-luminosity group-hover:mix-blend-normal"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    
                    {/* Hover scanline */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan opacity-80 animate-[scan_2s_linear_infinite] md:opacity-0 md:group-hover:opacity-100 drop-shadow-[0_0_5px_#66FCF1]"></div>
                  </div>
                  
                  <div className="relative z-20">
                    <h3 className="font-display font-bold text-xl text-neon-cyan md:text-white md:group-hover:text-neon-cyan transition-colors">{member.name}</h3>
                    <p className="font-mono text-xs text-gray-500 mt-1 uppercase tracking-widest">&gt; {member.role}</p>
                  </div>
                </div>
                {/* Background glow shadow */}
                <div style={extremeCut} className="absolute inset-0 bg-neon-cyan opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Heads Section */}
        <section>
          <div className="flex items-center mb-12">
            <h2 className="font-display font-bold text-2xl text-electric-purple tracking-[0.2em] uppercase whitespace-nowrap">
              &gt; DEPT_HEADS
            </h2>
            <div className="w-full h-px bg-electric-purple/30 ml-6"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((member, i) => (
              <motion.div 
                key={member}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={cutCorners} 
                className="bg-black/40 border-l-2 border-electric-purple border border-electric-purple/10 md:border-white/5 p-6 flex items-center space-x-6 hover:bg-electric-purple/10 transition-colors duration-300 group cursor-pointer"
              >
                {/* Photo Container */}
                <div 
                  className="relative w-24 h-24 bg-[#111] shrink-0 border border-electric-purple/30 md:border-white/10 group-hover:border-electric-purple/50 transition-all duration-500 overflow-hidden group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(184,41,234,0.4)]" 
                  style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                >
                  {/* Default Head Photo */}
                  <div className="absolute inset-0 w-full h-full bg-[url('https://via.placeholder.com/150/1f2833/B829EA?text=HEAD')] bg-cover opacity-70 md:opacity-50 mix-blend-luminosity transition-all duration-500 group-hover:opacity-0 group-hover:scale-110"></div>
                  
                  {/* Group Photo (Revealed on Hover) */}
                  <div className="absolute inset-0 w-full h-full bg-[url('https://via.placeholder.com/150/02050A/66FCF1?text=TEAM')] bg-cover opacity-0 scale-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100"></div>
                </div>
                
                <div>
                  <h3 className="font-display font-bold text-lg text-electric-purple md:text-white md:group-hover:text-electric-purple transition-colors">Head Name {member}</h3>
                  <p className="font-mono text-xs text-neon-cyan md:text-gray-500 mt-1 uppercase tracking-widest transition-colors md:group-hover:text-neon-cyan">&gt; DEPARTMENT</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
