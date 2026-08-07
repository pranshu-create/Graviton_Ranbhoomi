"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import GlitchText from "@/components/GlitchText";
import { motion } from "framer-motion";
import { MapPin, Camera, Mail, Globe, MessageSquare, ExternalLink } from "lucide-react";

export default function CommCenterPage() {
  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const extremeCut = { clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)" };

  return (
    <>
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center min-h-screen relative z-10 w-full overflow-x-hidden bg-[#050B14] pt-24 pb-20">

        {/* Entrance effect fading from black hole */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="fixed inset-0 bg-black z-50 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16 relative"
          >
            <h1 className="font-display font-black text-5xl md:text-6xl text-white mb-4 uppercase tracking-tighter">
              COMM <GlitchText text="CENTER" className="text-neon-cyan text-glow-cyan" />
            </h1>
            <p className="font-mono text-sm text-gray-500 uppercase tracking-[0.3em]">&gt; ESTABLISH CONNECTION WITH HQ</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Location Data - NMIMS Indore */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={extremeCut}
              className="bg-black/60 border border-white/10 p-8 md:p-12 relative group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-transparent opacity-50"></div>

              <h3 className="font-mono text-neon-cyan tracking-[0.2em] mb-8 flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5" /> &gt; HQ_LOCATION
              </h3>

              <div className="mb-8">
                <h4 className="font-display font-bold text-3xl text-white mb-2">NMIMS INDORE</h4>
                <p className="text-gray-400 font-mono text-xs leading-relaxed max-w-sm">
                  Narsee Monjee Institute of Management Studies.<br /><br />
                  Super Corridor, Bada Bangarda,<br />
                  Indore, Madhya Pradesh 453112<br />
                  INDIA
                </p>
              </div>

              {/* Radar/Map Mockup */}
              <a
                href="https://www.google.com/maps/place/SVKM's+NMIMS,+Indore/@22.749462,75.789681,17z/data=!3m1!4b1!4m6!3m5!1s0x396301fb24138e1d:0xac456fd4ef7e05c9!8m2!3d22.7494621!4d75.7945519!16s%2Fg%2F11b7l7w1z4?entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full aspect-video bg-[#0a0f18] relative overflow-hidden flex items-center justify-center border border-white/5 group cursor-crosshair hover:border-neon-cyan/50 transition-colors block"
                style={cutCorners}
              >
                {/* Radar grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] group-hover:bg-[linear-gradient(rgba(102,252,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.05)_1px,transparent_1px)] transition-colors"></div>

                {/* Radar sweep */}
                <div className="absolute w-[150%] h-[150%] rounded-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(102,252,241,0.2)_100%)] animate-spin" style={{ animationDuration: '4s' }}></div>

                {/* Target Blip */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-neon-cyan rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-4 h-4 bg-neon-cyan rounded-full relative z-10 shadow-[0_0_15px_#66FCF1]"></div>
                </div>

                {/* Map Text Overlay */}
                <div className="absolute bottom-4 left-4 font-mono text-[8px] text-neon-cyan tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
                  LAT: 22.7667° N<br />
                  LONG: 75.8203° E<br />
                  TARGET LOCKED<br />
                  <span className="text-white mt-1 inline-block">[ CLICK TO OPEN MAPS ]</span>
                </div>
              </a>
            </motion.div>

            {/* Social Network Nodes */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col justify-center"
            >
              <h3 className="font-mono text-electric-purple tracking-[0.2em] mb-8 flex items-center gap-3 text-sm">
                <MessageSquare className="w-5 h-5" /> &gt; SOCIAL_NODES
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: "INSTAGRAM", icon: Camera, color: "hover:bg-pink-500/20 hover:border-pink-500 hover:text-pink-500", url: "https://www.instagram.com/team.graviton.robotics?utm_source=qr&igsh=MWl5OHptZmQ1Nms4bA==" },
                  { name: "EMAIL HQ", icon: Mail, color: "hover:bg-red-500/20 hover:border-red-500 hover:text-red-500", url: "mailto:gravitonroboticsidr@gmail.com" }
                ].map((social, i) => (
                  <Link
                    key={social.name}
                    href={social.url}
                    style={cutCorners}
                    className={`bg-black/40 border border-white/10 p-6 flex flex-col items-start justify-between h-32 group transition-all duration-300 ${social.color}`}
                  >
                    <div className="w-full flex justify-between items-start text-gray-400 group-hover:text-inherit transition-colors">
                      <social.icon className="w-6 h-6" />
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="w-full">
                      <p className="font-mono text-xs tracking-widest text-white group-hover:text-inherit transition-colors">&gt; {social.name}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Status Box */}
              <div className="mt-8 bg-electric-purple/5 border-l-2 border-electric-purple p-6" style={cutCorners}>
                <p className="font-mono text-xs text-gray-400 leading-relaxed uppercase tracking-wider">
                  <span className="text-electric-purple font-bold">TRANSMISSION:</span> Follow our comm channels for real-time updates on schedules, problem statements, and intel drops.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
