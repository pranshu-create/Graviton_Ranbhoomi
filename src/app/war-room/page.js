"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldAlert, Crosshair, Skull, Trophy } from "lucide-react";
import GlitchText from "@/components/GlitchText";
import { motion } from "framer-motion";

export default function WarRoomPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (data.success) {
          setTeams(data.teams);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Polling every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const topOperatives = teams.filter(t => t.hasHackedMainframe);
  const regularTeams = teams.filter(t => !t.hasHackedMainframe);

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-6xl mx-auto w-full min-h-screen">
        <div className="text-center mb-16 relative">
          <h1 className="font-display font-black text-4xl md:text-6xl text-white mb-4 uppercase tracking-tighter">
            WAR <GlitchText text="ROOM" className="text-neon-cyan text-glow-cyan" />
          </h1>
          <p className="font-mono text-sm text-gray-500 uppercase tracking-[0.3em]">&gt; LIVE TELEMETRY & STANDINGS</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Top Operatives Section */}
            {topOperatives.length > 0 ? (
              <section className="relative">
                <div className="absolute inset-0 bg-red-900/10 blur-xl pointer-events-none"></div>
                <div className="border border-red-500/50 bg-black/60 p-6 md:p-10 relative shadow-[0_0_50px_rgba(239,68,68,0.15)]">
                  <div className="flex items-center gap-4 mb-10 border-b border-red-500/30 pb-6">
                    <Skull className="text-red-500 w-10 h-10 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    <div>
                      <h2 className="font-display text-3xl md:text-4xl text-red-500 font-black uppercase tracking-widest text-glow-red">ELITE HACKERS</h2>
                      <p className="font-mono text-sm text-red-400 mt-2">CLASS-S THREAT DETECTED. THESE SQUADS HAVE SUCCESSFULLY BREACHED THE GRAVITON MAINFRAME.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {topOperatives.map((team, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={team._id} 
                        className="bg-red-950/30 border border-red-500/40 p-6 relative overflow-hidden group hover:bg-red-900/20 transition-colors"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay pointer-events-none"></div>
                        
                        <div className="absolute top-2 right-2 text-red-500/30 font-display font-black text-4xl pointer-events-none">
                          #{idx + 1}
                        </div>

                        <h3 className="font-display font-bold text-white text-2xl mb-2 truncate relative z-10">{team.name}</h3>
                        
                        <div className="inline-block px-2 py-1 bg-red-500/20 border border-red-500/30 mb-6 relative z-10">
                           <span className="font-mono text-[10px] text-red-300 uppercase tracking-widest">Top Operative</span>
                        </div>

                        <div className="flex justify-between items-end relative z-10 border-t border-red-500/20 pt-4 mt-2">
                          <span className="font-mono text-[10px] text-gray-400">BREACH TIME:</span>
                          <span className="font-mono text-sm text-red-500 font-bold">
                            {new Date(team.hackedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <div className="bg-black/60 border border-white/10 p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <ShieldAlert className="w-16 h-16 text-gray-600 mx-auto mb-6 relative z-10" />
                <h3 className="font-display text-2xl text-gray-500 mb-2 relative z-10">SYSTEM SECURE</h3>
                <p className="font-mono text-sm text-gray-600 tracking-widest uppercase relative z-10">No unauthorized breaches detected in the mainframe... yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
