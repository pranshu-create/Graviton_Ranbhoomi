"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Calendar, Award, Zap, Layers, Globe, Activity } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";
import GlitchText from "./GlitchText";

// Neon Color Mapping for visual consistency and premium look
const colorMap = {
  "green-500": {
    text: "text-green-400",
    border: "border-green-500/30 hover:border-green-400/60",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)]",
    bg: "bg-green-500/5",
    pulse: "bg-green-400",
    line: "from-green-500/80 to-transparent",
  },
  "blue-500": {
    text: "text-blue-400",
    border: "border-blue-500/30 hover:border-blue-400/60",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]",
    bg: "bg-blue-500/5",
    pulse: "bg-blue-400",
    line: "from-blue-500/80 to-transparent",
  },
  "cyan-500": {
    text: "text-cyan-400",
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]",
    bg: "bg-cyan-500/5",
    pulse: "bg-cyan-400",
    line: "from-cyan-500/80 to-transparent",
  },
  "yellow-500": {
    text: "text-yellow-400",
    border: "border-yellow-500/30 hover:border-yellow-400/60",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_25px_rgba(234,179,8,0.35)]",
    bg: "bg-yellow-500/5",
    pulse: "bg-yellow-400",
    line: "from-yellow-500/80 to-transparent",
  },
  "purple-500": {
    text: "text-purple-400",
    border: "border-purple-500/30 hover:border-purple-400/60",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]",
    bg: "bg-purple-500/5",
    pulse: "bg-purple-400",
    line: "from-purple-500/80 to-transparent",
  },
  "red-500": {
    text: "text-red-400",
    border: "border-red-500/30 hover:border-red-400/60",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]",
    bg: "bg-red-500/5",
    pulse: "bg-red-400",
    line: "from-red-500/80 to-transparent",
  },
  "indigo-500": {
    text: "text-indigo-400",
    border: "border-indigo-500/30 hover:border-indigo-400/60",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.35)]",
    bg: "bg-indigo-500/5",
    pulse: "bg-indigo-400",
    line: "from-indigo-500/80 to-transparent",
  }
};

const defaultColors = {
  text: "text-gray-400",
  border: "border-white/10 hover:border-white/30",
  glow: "shadow-none",
  bg: "bg-white/5",
  pulse: "bg-white/40",
  line: "from-white/20 to-transparent"
};

const cutCornersStyle = {
  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
};

export default function TimelineSection() {
  const [schedule, setSchedule] = useState({ day1: [], day2: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of system configurations
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/system");
        const data = await res.json();
        if (data.success && data.config?.schedule) {
          setSchedule(data.config.schedule);
        }
      } catch (err) {
        console.error("Failed to load schedule", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();

    // Setup Pusher real-time synchronization
    let pusherChannel = null;
    const bindPusher = async () => {
      const pusher = await getPusherClient();
      if (pusher) {
        pusherChannel = pusher.subscribe("god-mode-channel");
        pusherChannel.bind("system-update", (config) => {
          if (config && config.schedule) {
            setSchedule(config.schedule);
          }
        });
      }
    };

    bindPusher();

    return () => {
      if (pusherChannel) {
        pusherChannel.unbind("system-update");
      }
    };
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-20 font-mono text-white select-none">
      
      {/* Visual Tech Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      {/* METRIC STATS HEADER (The Brief) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-20 relative z-10">
        
        {/* Metric 1 */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-black/60 border border-white/10 p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden" 
          style={cutCornersStyle}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-neon-cyan/5 to-transparent rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <Layers className="w-5 h-5 text-neon-cyan" />
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">[SYSTEM_MTRX]</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">EVENTS MATRIX</p>
            <h3 className="text-xl font-bold font-display text-white mt-1 uppercase">5+ Combat & Speed</h3>
            <p className="text-[9px] text-gray-400 mt-1 truncate">Robo Soccer, Sumo, Race, LFR, CTF</p>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-black/60 border border-white/10 p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden" 
          style={cutCornersStyle}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-electric-purple/5 to-transparent rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <Globe className="w-5 h-5 text-electric-purple" />
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">[ARENA_ZNS]</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">TACTICAL ZONES</p>
            <h3 className="text-xl font-bold font-display text-white mt-1 uppercase">3 Main Arenas</h3>
            <p className="text-[9px] text-gray-400 mt-1 truncate">Combat Ring, Speedway, Soccer Field</p>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-black/60 border border-white/10 p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden" 
          style={cutCornersStyle}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">[TOTAL_POOL]</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">TOTAL BOUNTY</p>
            <h3 className="text-xl font-bold font-display text-yellow-500 mt-1 uppercase">₹85,000+ Prize</h3>
            <p className="text-[9px] text-gray-400 mt-1 truncate">Cash Awards, Vouchers & Trophies</p>
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-black/60 border border-white/10 p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden" 
          style={cutCornersStyle}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">[OP_WINDOW]</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">EVENT TIMELINE</p>
            <h3 className="text-xl font-bold font-display text-white mt-1 uppercase">2 Days of Action</h3>
            <p className="text-[9px] text-gray-400 mt-1 truncate">Non-Stop Bracket Elimination</p>
          </div>
        </motion.div>

      </div>

      {/* HEADER SECTION TITLE */}
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-5xl font-black font-display tracking-widest uppercase">
          <GlitchText text="EVENT PROTOCOL SCHEDULE" />
        </h2>
        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent mx-auto mt-4"></div>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-4">Real-Time Event Chronology Sync</p>
      </div>

      {/* TWO DAY PARTITION LAYOUT SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        
        {/* DAY 1 COLUMN */}
        <div className="space-y-8 relative">
          
          {/* Day Label Header */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-8">
            <div className="w-10 h-10 bg-neon-cyan/15 border border-neon-cyan flex items-center justify-center font-bold text-neon-cyan shadow-[0_0_15px_rgba(102,252,241,0.2)]" style={cutCornersStyle}>
              01
            </div>
            <div>
              <h3 className="font-display font-black text-lg tracking-wider text-white">DAY 01 // START PROTOCOL</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Calibration & Initial Brackets</p>
            </div>
            <div className="ml-auto h-2 w-2 rounded-full bg-neon-cyan animate-ping"></div>
          </div>

          {/* Timeline Connector Line */}
          <div className="absolute left-[13px] top-[80px] bottom-[20px] w-0.5 bg-gradient-to-b from-neon-cyan/50 via-neon-cyan/10 to-transparent pointer-events-none z-0"></div>

          {/* Day 1 Cards */}
          {loading ? (
            <div className="text-center py-20 text-gray-500 uppercase text-xs animate-pulse">Loading Uplink...</div>
          ) : schedule.day1 && schedule.day1.length > 0 ? (
            schedule.day1.map((item, index) => {
              const colors = colorMap[item.color] || defaultColors;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="flex items-start gap-3 md:gap-6 relative z-10 pl-2 group"
                >
                  {/* Timeline Node Dot */}
                  <div className="w-[10px] h-[10px] rounded-full bg-black border-2 border-neon-cyan flex-shrink-0 mt-3 group-hover:scale-125 transition-transform duration-300 relative z-20">
                    <div className="absolute -inset-1 rounded-full bg-neon-cyan/25 animate-pulse pointer-events-none z-10"></div>
                    <div className="absolute -inset-1 rounded-full bg-neon-cyan/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Card Container */}
                  <div 
                    className={`flex-grow bg-black/75 border transition-all duration-300 p-5 ${colors.border} ${colors.glow}`}
                    style={cutCornersStyle}
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${colors.text} flex items-center gap-1.5`}>
                        <Zap className="w-3.5 h-3.5" />
                        {item.phase || `PHASE-0${index + 1}`}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-white text-base tracking-wide uppercase mb-2 group-hover:text-neon-cyan transition-colors">
                      {item.title}
                    </h4>
                    
                    <p className="text-xs text-gray-400 font-mono leading-relaxed mb-4">
                      {item.desc}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest border-t border-white/5 pt-3">
                      <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-gray-500 text-xs uppercase text-center py-10">No Day 1 protocol loaded.</p>
          )}

        </div>

        {/* DAY 2 COLUMN */}
        <div className="space-y-8 relative">
          
          {/* Day Label Header */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-8">
            <div className="w-10 h-10 bg-electric-purple/15 border border-electric-purple flex items-center justify-center font-bold text-electric-purple shadow-[0_0_15px_rgba(184,41,234,0.2)]" style={cutCornersStyle}>
              02
            </div>
            <div>
              <h3 className="font-display font-black text-lg tracking-wider text-white">DAY 02 // RESOLUTION</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Final Brackets & Award Ceremonies</p>
            </div>
            <div className="ml-auto h-2 w-2 rounded-full bg-electric-purple animate-ping"></div>
          </div>

          {/* Timeline Connector Line */}
          <div className="absolute left-[13px] top-[80px] bottom-[20px] w-0.5 bg-gradient-to-b from-electric-purple/50 via-electric-purple/10 to-transparent pointer-events-none z-0"></div>

          {/* Day 2 Cards */}
          {loading ? (
            <div className="text-center py-20 text-gray-500 uppercase text-xs animate-pulse">Loading Uplink...</div>
          ) : schedule.day2 && schedule.day2.length > 0 ? (
            schedule.day2.map((item, index) => {
              const colors = colorMap[item.color] || defaultColors;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="flex items-start gap-3 md:gap-6 relative z-10 pl-2 group"
                >
                  {/* Timeline Node Dot */}
                  <div className="w-[10px] h-[10px] rounded-full bg-black border-2 border-electric-purple flex-shrink-0 mt-3 group-hover:scale-125 transition-transform duration-300 relative z-20">
                    <div className="absolute -inset-1 rounded-full bg-electric-purple/25 animate-pulse pointer-events-none z-10"></div>
                    <div className="absolute -inset-1 rounded-full bg-electric-purple/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Card Container */}
                  <div 
                    className={`flex-grow bg-black/75 border transition-all duration-300 p-5 ${colors.border} ${colors.glow}`}
                    style={cutCornersStyle}
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${colors.text} flex items-center gap-1.5`}>
                        <Zap className="w-3.5 h-3.5" />
                        {item.phase || `PHASE-0${index + 1}`}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-white text-base tracking-wide uppercase mb-2 group-hover:text-electric-purple transition-colors">
                      {item.title}
                    </h4>
                    
                    <p className="text-xs text-gray-400 font-mono leading-relaxed mb-4">
                      {item.desc}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest border-t border-white/5 pt-3">
                      <MapPin className="w-3.5 h-3.5 text-electric-purple" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-gray-500 text-xs uppercase text-center py-10">No Day 2 protocol loaded.</p>
          )}

        </div>

      </div>

    </section>
  );
}
