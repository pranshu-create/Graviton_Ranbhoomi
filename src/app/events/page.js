"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { eventsData } from "@/data/events";
import GlitchText from "@/components/GlitchText";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ShieldAlert, X, Video } from "lucide-react";
import MissionBriefing from "@/components/MissionBriefing";

export default function EventsPage() {
  const [frozenEvents, setFrozenEvents] = useState([]);
  const [frozenAlertEvent, setFrozenAlertEvent] = useState(null);
  const [briefingEvent, setBriefingEvent] = useState(null);

  useEffect(() => {
    fetch("/api/system")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setFrozenEvents(data.config.frozenEvents || []);
        }
      })
      .catch(console.error);
  }, []);

  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-0 pointer-events-none"></div>
      
      {/* Frozen Event Alert Modal */}
      <AnimatePresence>
        {frozenAlertEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black/80 border-2 border-red-500 max-w-lg w-full p-8 relative shadow-[0_0_50px_rgba(239,68,68,0.4)]"
              style={cutCorners}
            >
              <button 
                onClick={() => setFrozenAlertEvent(null)}
                className="absolute top-4 right-4 text-white hover:text-red-500 z-10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/20 border border-red-500 flex items-center justify-center rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                
                <div>
                  <h2 className="font-display font-black text-3xl text-white tracking-tighter uppercase mb-2">
                    ACCESS <span className="text-red-500">DENIED</span>
                  </h2>
                  <p className="font-mono text-sm text-gray-300 leading-relaxed">
                    Registrations for <span className="text-red-500 font-bold">{frozenAlertEvent}</span> are currently in <span className="text-red-500 font-bold">FREEZE MODE</span>. The system is locked by OVERWATCH.
                  </p>
                </div>
                
                <button 
                  onClick={() => setFrozenAlertEvent(null)}
                  className="w-full py-4 bg-red-500/10 border border-red-500 text-red-500 font-mono text-xs uppercase tracking-[0.3em] font-bold hover:bg-red-500 hover:text-black transition-colors"
                  style={cutCorners}
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {briefingEvent && (
        <MissionBriefing 
          event={briefingEvent}
          onClose={() => setBriefingEvent(null)}
        />
      )}

      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-neon-cyan/20 -z-10"></div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 bg-black/40 backdrop-blur-md border border-white/5 inline-block px-8 py-2 tracking-tighter" style={cutCorners}>
            THE <GlitchText text="BATTLEGROUND" className="text-neon-cyan text-glow-cyan" />
          </h1>
          <p className="font-mono text-xs text-gray-400 max-w-2xl mx-auto uppercase tracking-[0.3em]">
            &gt; CHOOSE YOUR ARENA. TEST YOUR SKILLS. PROVE YOUR DOMINANCE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {eventsData.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.03, 
                y: -10,
                boxShadow: event.color === 'neon-cyan' 
                  ? "0px 25px 50px -12px rgba(0, 229, 255, 0.4), inset 0 0 20px rgba(0, 229, 255, 0.1)" 
                  : "0px 25px 50px -12px rgba(138, 43, 226, 0.4), inset 0 0 20px rgba(138, 43, 226, 0.1)",
                borderColor: event.color === 'neon-cyan' ? "rgba(0, 229, 255, 0.8)" : "rgba(138, 43, 226, 0.8)"
              }}
              transition={{ 
                duration: 0.4, 
                type: "spring", 
                stiffness: 300, 
                damping: 20, 
                delay: i * 0.1 
              }}
              style={cutCorners}
              className={`bg-black/60 backdrop-blur-md p-6 md:p-8 border-l-2 border group relative overflow-hidden
                ${event.color === 'neon-cyan' 
                  ? 'border-neon-cyan/20 border-l-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.05)] md:border-white/5 md:shadow-none' 
                  : 'border-electric-purple/20 border-l-electric-purple shadow-[0_0_15px_rgba(138,43,226,0.05)] md:border-white/5 md:shadow-none'}
              `}
            >
              {/* Animated Glare Effect */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:animate-glare"></div>

              <h2 className={`font-display font-black text-2xl md:text-3xl mb-2 tracking-tighter relative z-10 transition-colors duration-300
                ${event.color === 'neon-cyan' ? 'text-neon-cyan md:text-white md:group-hover:text-neon-cyan' : 'text-electric-purple md:text-white md:group-hover:text-electric-purple'}`}
              >
                {event.name}
              </h2>
              <div className={`w-16 h-1 mb-6 group-hover:w-full transition-all duration-700 relative z-10
                ${event.color === 'neon-cyan' ? 'bg-white/20 group-hover:bg-neon-cyan' : 'bg-white/20 group-hover:bg-electric-purple'}
              `}></div>
              
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mb-8 min-h-[60px] font-mono text-xs leading-relaxed relative z-10">
                {event.shortDescription}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
                <div className="bg-black/40 border border-white/5 p-3 group-hover:border-white/10 transition-colors duration-300" style={cutCorners}>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">&gt; TEAM_SIZE</p>
                  <p className="text-white font-bold font-display text-sm">{event.teamSize}</p>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 group-hover:border-white/10 transition-colors duration-300" style={cutCorners}>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">&gt; PRIZE_POOL</p>
                  <p className="text-white font-bold font-display text-sm">{event.prizePool}</p>
                </div>
              </div>

              {frozenEvents.some(e => e.toLowerCase() === event.name.toLowerCase()) ? (
                <button 
                  onClick={() => setFrozenAlertEvent(event.name)}
                  style={cutCorners}
                  className={`block w-full text-center py-3 font-display font-bold tracking-[0.2em] text-sm transition-all duration-300 relative overflow-hidden group/btn z-10 bg-red-500/10 border border-red-500 text-red-500 hover:box-glow-red mb-3`}
                >
                  <span className="relative z-10 group-hover/btn:text-white">VIEW DATALOG</span>
                  <div className={`absolute inset-0 h-full w-0 transition-all duration-300 ease-out group-hover/btn:w-full z-0 bg-red-500`}></div>
                </button>
              ) : (
                <Link 
                  href={`/events/${event.id}`}
                  style={cutCorners}
                  className={`block w-full text-center py-3 font-display font-bold tracking-[0.2em] text-sm transition-all duration-300 relative overflow-hidden group/btn z-10 mb-3
                    ${event.color === 'neon-cyan' 
                      ? 'bg-neon-cyan/10 border border-neon-cyan text-neon-cyan hover:box-glow-cyan' 
                      : 'bg-electric-purple/10 border border-electric-purple text-electric-purple hover:box-glow-purple'}
                  `}
                >
                  <span className="relative z-10 group-hover/btn:text-white">VIEW DATALOG</span>
                  <div className={`absolute inset-0 h-full w-0 transition-all duration-300 ease-out group-hover/btn:w-full z-0
                    ${event.color === 'neon-cyan' ? 'bg-neon-cyan' : 'bg-electric-purple'}
                  `}></div>
                </Link>
              )}

              <button 
                onClick={() => setBriefingEvent(event)}
                style={cutCorners}
                className={`flex items-center justify-center w-full py-2 font-mono text-[10px] tracking-widest uppercase transition-all duration-300 bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white hover:bg-white/10`}
              >
                <Video className="w-3 h-3 mr-2" /> MISSION BRIEFING
              </button>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
