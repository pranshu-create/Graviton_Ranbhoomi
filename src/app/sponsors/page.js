"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";
import { motion } from "framer-motion";

export default function SponsorsPage() {
  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const extremeCut = { clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)" };

  // Placeholder images for sponsors
  const placeholderLogo = "https://via.placeholder.com/300x100/1f2833/66FCF1?text=SPONSOR+LOGO";

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-neon-cyan/20 -z-10"></div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 bg-background inline-block px-8 tracking-tighter">
            OUR <GlitchText text="PARTNERS" className="text-neon-cyan text-glow-cyan" />
          </h1>
          <p className="font-mono text-xs text-gray-400 max-w-2xl mx-auto uppercase tracking-[0.3em]">
            &gt; POWERING THE FUTURE OF ROBOTICS THROUGH STRATEGIC ALLIANCES.
          </p>
        </div>

        <div className="space-y-24">
          {/* Title Sponsor */}
          <section className="text-center">
            <h2 className="font-mono font-bold text-lg text-neon-cyan mb-8 tracking-[0.3em] uppercase">
              &gt; TITLE_SPONSOR
            </h2>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={extremeCut} 
              className="bg-black/60 p-12 max-w-3xl mx-auto border-y-2 border-neon-cyan hover:bg-neon-cyan/10 transition-colors duration-500 flex items-center justify-center relative group"
            >
              <div className="absolute inset-0 bg-neon-cyan opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500"></div>
              <img src={placeholderLogo} alt="Title Sponsor" className="w-full max-w-md mx-auto opacity-70 group-hover:opacity-100 transition-opacity mix-blend-luminosity group-hover:mix-blend-normal" />
            </motion.div>
          </section>

          {/* Powered By */}
          <section className="text-center">
            <h2 className="font-mono font-bold text-lg text-electric-purple mb-8 tracking-[0.3em] uppercase">
              &gt; POWERED_BY
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[1, 2].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  style={cutCorners}
                  className="bg-black/40 p-10 border border-electric-purple/20 border-l-4 border-l-electric-purple flex items-center justify-center hover:bg-electric-purple/10 md:border-white/5 transition-colors duration-300 group relative"
                >
                  <img src={placeholderLogo} alt={`Powered By ${i}`} className="w-full max-w-xs mx-auto opacity-70 group-hover:opacity-100 transition-opacity mix-blend-luminosity group-hover:mix-blend-normal" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tech Partners */}
          <section className="text-center">
            <h2 className="font-mono font-bold text-lg text-white mb-8 tracking-[0.3em] uppercase border-b border-white/20 inline-block pb-2">
              &gt; TECH_PARTNERS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                  className="bg-black/20 p-6 border border-neon-cyan/25 md:border-white/10 flex items-center justify-center hover:border-neon-cyan/50 hover:bg-white/5 transition-all duration-300 group"
                >
                  <img src={placeholderLogo} alt={`Tech Partner ${i}`} className="w-full max-w-[150px] mx-auto opacity-50 group-hover:opacity-100 transition-opacity mix-blend-luminosity group-hover:mix-blend-normal" />
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
