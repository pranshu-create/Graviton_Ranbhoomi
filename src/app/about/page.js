"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";
import { motion } from "framer-motion";
import { Cpu, Eye, Shield, Users, Calendar, Award, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const extremeCut = { clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)" };

  const stats = [
    { label: "OPERATIVE_MEMBERS", value: "50+", icon: Users, color: "neon-cyan" },
    { label: "ESTABLISHED_YEAR", value: "2020", icon: Calendar, color: "electric-purple" },
    { label: "ARENA_CAMPAIGNS", value: "12+", icon: Zap, color: "yellow-500" },
    { label: "TECH_AWARDS", value: "8+", icon: Award, color: "green-500" }
  ];

  const pillars = [
    {
      title: "RESEARCH_AND_DEVELOPMENT",
      desc: "Pushing limits of sensor integration, computer vision, ROS (Robot Operating System), and custom firmware optimization. We architect autonomous machines that perceive, map, and conquer complex terrains.",
      icon: Cpu,
      color: "text-neon-cyan border-neon-cyan/30 group-hover:border-neon-cyan/80 hover:shadow-[0_0_15px_rgba(102,252,241,0.3)]"
    },
    {
      title: "COMBAT_ENGINEERING",
      desc: "Designing pneumatic flippers, spinning blades, and heavy armor for high-impact combat robots (Robowars). From mechanical stress-analysis to battery power-management, we build indestructible machines.",
      icon: Shield,
      color: "text-electric-purple border-electric-purple/30 group-hover:border-electric-purple/80 hover:shadow-[0_0_15px_rgba(184,41,234,0.3)]"
    },
    {
      title: "OUTREACH_AND_WORKSHOPS",
      desc: "Democratizing hardware control, CAD modeling, and microcontrollers. Graviton Robotics hosts active bootcamps, hands-on workshops, and open mentoring initiatives across schools and universities.",
      icon: Eye,
      color: "text-yellow-500 border-yellow-500/30 group-hover:border-yellow-500/80 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
    }
  ];

  const timeline = [
    { year: "2020", title: "GENESIS", desc: "Formed by SVKM NMIMS engineering students to consolidate robotics research and build high-grade autonomous bots." },
    { year: "2022", title: "COMBAT REGISTRY", desc: "Constructed the first 15kg pneumatic combat robot and secured podium positions at state level RoboWars." },
    { year: "2024", title: "INTELLIGENT TELEMETRY", desc: "Integrated computer vision algorithms for real-time target tracking on autonomous maze solvers." },
    { year: "2026", title: "RANBHOOMI 2.0", desc: "Hosting India's most advanced tactical robotics fest, bringing together hundreds of campus squads." }
  ];

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Background ambient text */}
        <div className="absolute top-[15vh] left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none z-0">
          <div className="font-display font-black text-[25vh] tracking-tighter leading-none">
            GRAVITON MAINFRAME DIRECTIVE
          </div>
        </div>

        {/* Heading Section */}
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-electric-purple/20 -z-10"></div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 bg-background inline-block px-8 tracking-tighter">
            ABOUT <GlitchText text="GRAVITON" className="text-electric-purple text-glow-purple" />
          </h1>
          <p className="font-mono text-xs text-gray-400 max-w-2xl mx-auto uppercase tracking-[0.3em]">
            &gt; CODEBASE ORIGIN, CAPABILITIES, AND ALLIANCE
          </p>
        </div>

        {/* Origin / Briefing Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h2 className="font-display font-black text-3xl text-white tracking-wide uppercase">
                &gt; CORE_OVERVIEW
              </h2>
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                Graviton Robotics is the premier robotics, automation, and combat engineering division of SVKM NMIMS, Indore. Built on a foundation of endless curiosity and strict mechanical discipline, we exist to bridge the gap between academic theory and high-octane physical execution.
              </p>
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                Whether routing PCB traces, programming sensor arrays, or machining solid metal chassis, members of Graviton Robotics handle every phase of mechanical construction. Ranbhoomi is our testing ground — the ultimate arena where metal meets metal, code meets physics, and champions are forged.
              </p>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5">
            {/* Holographic Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    style={cutCorners}
                    className="bg-black/60 border border-white/10 p-5 flex flex-col justify-between h-36 hover:border-neon-cyan/50 transition-colors group cursor-default relative"
                  >
                    <div className="flex justify-between items-start">
                      <StatIcon className={`w-5 h-5 text-${stat.color}`} />
                      <span className="text-[9px] font-mono text-gray-500">SYS_V.{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-black text-3xl text-white group-hover:text-neon-cyan transition-colors">{stat.value}</h3>
                      <p className="font-mono text-[9px] text-gray-400 mt-1 uppercase tracking-widest leading-none">{stat.label}</p>
                    </div>
                    {/* Corner accent glow */}
                    <div className="absolute top-0 right-0 w-2 h-2 bg-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pillars / Departments */}
        <section className="mb-24">
          <div className="flex items-center mb-12">
            <h2 className="font-display font-bold text-2xl text-neon-cyan tracking-[0.2em] uppercase whitespace-nowrap">
              &gt; DIVISION_CAPABILITIES
            </h2>
            <div className="w-full h-px bg-neon-cyan/30 ml-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="group relative"
                >
                  <div 
                    style={extremeCut}
                    className={`bg-black/60 border p-6 flex flex-col h-full relative overflow-hidden transition-all duration-500 z-10 ${pillar.color}`}
                  >
                    {/* Glowing background laser indicator */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 group-hover:opacity-40 transition-opacity"></div>

                    <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6" style={cutCorners}>
                      <PillarIcon className="w-6 h-6" />
                    </div>

                    <h3 className="font-display font-black text-xl text-white mb-4 tracking-wide uppercase">
                      {pillar.title}
                    </h3>
                    
                    <p className="font-mono text-xs text-gray-400 leading-relaxed flex-grow">
                      {pillar.desc}
                    </p>
                  </div>
                  {/* Subtle hover glow */}
                  <div style={extremeCut} className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.02] blur-xl transition-opacity duration-500 -z-10"></div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Campaign Timeline / Campaign Milestones */}
        <section className="mb-24">
          <div className="flex items-center mb-16">
            <h2 className="font-display font-bold text-2xl text-electric-purple tracking-[0.2em] uppercase whitespace-nowrap">
              &gt; HISTORICAL_TIMELINE
            </h2>
            <div className="w-full h-px bg-electric-purple/30 ml-6"></div>
          </div>

          <div className="relative border-l-2 border-electric-purple/30 pl-8 ml-4 space-y-12">
            {timeline.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative"
              >
                {/* Timeline node node */}
                <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-black border-2 border-electric-purple flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-electric-purple animate-pulse"></div>
                </div>

                <div className="font-mono">
                  <span className="text-electric-purple font-black text-lg tracking-widest">{item.year}</span>
                  <h3 className="text-white font-display font-black text-xl mt-1 uppercase tracking-wide">{item.title}</h3>
                  <p className="text-gray-400 text-xs mt-2 max-w-3xl leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Join CTA */}
        <section className="text-center relative">
          <div className="absolute inset-0 bg-neon-cyan/5 blur-3xl pointer-events-none -z-10"></div>
          
          <div style={extremeCut} className="bg-black/80 border border-neon-cyan/30 p-12 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent"></div>
            
            <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-6 uppercase tracking-tighter">
              READY_TO_TEST_YOUR_LIMITS?
            </h2>
            
            <p className="font-mono text-sm text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed uppercase">
              REGISTER YOUR SQUAD TO RANBHOOMI 2.0 OR BROWSE ACTIVE ARENAS. ACCESS IS STRICTLY RESTRICTED TO VALID OPERATIVES.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/events"
                style={cutCorners}
                className="px-8 py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-mono text-sm tracking-widest hover:bg-neon-cyan hover:text-black transition-all flex items-center gap-2 group cursor-pointer"
              >
                BROWSE ARENAS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/register"
                style={cutCorners}
                className="px-8 py-3 bg-transparent border border-white/20 text-white font-mono text-sm tracking-widest hover:border-white/50 hover:bg-white/5 transition-colors cursor-pointer"
              >
                INITIATE REGISTRATION
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
