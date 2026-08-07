import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { eventsData } from "@/data/events";
import { ChevronLeft, Trophy, Users, Target, Zap, Download, Info, AlertTriangle, Layers, Activity, ShieldAlert, Phone, Mail } from "lucide-react";
import RegistrationButton from "@/components/RegistrationButton";

export function generateStaticParams() {
  return eventsData.map((event) => ({
    id: event.id,
  }));
}

export default async function EventDetails({ params }) {
  const resolvedParams = await params;
  const event = eventsData.find((e) => e.id === resolvedParams.id);

  if (!event) {
    return <div className="text-white text-center pt-40">Event not found</div>;
  }

  const isCyan = event.color === 'neon-cyan';
  const themeColorText = isCyan ? 'text-neon-cyan' : 'text-electric-purple';
  const themeColorBg = isCyan ? 'bg-neon-cyan' : 'bg-electric-purple';
  
  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const cutCornersSmall = { clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" };

  return (
    <div className="min-h-screen text-gray-300 font-mono relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10 pointer-events-none z-0 ${themeColorBg}`}></div>
      <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-5 pointer-events-none z-0 ${themeColorBg}`}></div>
      
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-4 max-w-[1400px] mx-auto w-full relative z-10">
        
        <div className="flex items-center justify-between mb-8">
          <Link href="/events" className="inline-flex items-center text-[10px] tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            RETURN_TO_DATABASE
          </Link>
          <h1 className={`font-display font-black text-3xl md:text-5xl uppercase tracking-tighter ${themeColorText} opacity-20`}>
            {event.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Mission Objective */}
            <div className="bg-black/60 border border-white/5 p-6 relative overflow-hidden group" style={cutCornersSmall}>
               <h2 className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${themeColorText}`}>
                 <Target className="w-4 h-4" /> MISSION_OBJECTIVE
               </h2>
               <p className="italic text-gray-400 text-[13px] mb-6 leading-relaxed">&quot;{event.objectiveQuote || event.shortDescription}&quot;</p>
               
               <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4 mb-2">
                 <span className="text-gray-500 uppercase tracking-widest text-[11px]">PARTICIPATION</span>
                 <span className={`font-bold flex items-center gap-1 ${themeColorText}`}><Users className="w-4 h-4" /> {event.teamSize}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 uppercase tracking-widest text-[11px]">BASE FEE (PER TEAM)</span>
                 <span className={`font-bold ${themeColorText}`}>{event.fees}</span>
               </div>
            </div>

            {/* 2x2 Specs Grid */}
            {event.structuredSpecs && (
              <div className="grid grid-cols-2 gap-4">
                {event.structuredSpecs.map((spec, i) => (
                  <div key={i} className="bg-black/60 border border-white/5 p-4 hover:bg-white/5 transition-colors" style={cutCornersSmall}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{spec.label}</p>
                    <p className="text-white font-bold text-[14px] mb-1">{spec.value}</p>
                    <p className={`text-[9px] ${themeColorText} opacity-80 italic`}>{spec.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Arena Specs */}
            {event.arenaSpecs && (
              <div className="bg-black/60 border border-white/5 p-6 relative" style={cutCornersSmall}>
                 <div className={`absolute left-0 top-0 bottom-0 w-1 ${themeColorBg} opacity-50`}></div>
                 <h2 className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-white`}>
                   <Layers className="w-4 h-4" /> ARENA_SPECS
                 </h2>
                 {event.arenaSpecs.map((spec, i) => (
                   <div key={i} className={`flex justify-between items-center text-xs ${i !== 0 ? 'mt-4 border-t border-white/5 pt-4' : ''}`}>
                     <span className="text-gray-500 uppercase tracking-widest text-[11px]">{spec.label}</span>
                     <span className="text-white text-right max-w-[60%] font-bold text-[13px] leading-relaxed">{spec.value}</span>
                   </div>
                 ))}
              </div>
            )}
            
          </div>

          {/* MIDDLE COLUMN (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Competition Rounds */}
            <div className="bg-black/60 border border-white/5 p-6 flex-grow" style={cutCornersSmall}>
              <h2 className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-white`}>
                 <Activity className="w-4 h-4" /> COMPETITION_ROUNDS
              </h2>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-white/10 before:border-dashed">
                {event.phases ? event.phases.map((phase, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-8 h-8 border border-white/20 bg-black text-[11px] font-bold text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 ${i===0 ? (isCyan ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 'border-electric-purple shadow-[0_0_10px_rgba(138,43,226,0.2)]') : ''}`}>
                      {phase.id}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border border-white/5 bg-black/40 hover:bg-white/5 transition-colors" style={cutCornersSmall}>
                      <h3 className="font-bold text-white text-[13px] mb-1 uppercase tracking-wider">{phase.name}</h3>
                      <span className={`inline-block px-2 py-0.5 text-[9px] tracking-widest font-bold uppercase mb-2 ${isCyan ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-electric-purple/10 text-electric-purple'}`}>{phase.subtitle}</span>
                      <p className="text-xs text-gray-400 leading-relaxed">{phase.desc}</p>
                    </div>
                  </div>
                )) : (
                   <p className="text-[13px] text-gray-500 italic px-4">Stages data actively compiling...</p>
                )}
              </div>
            </div>

            {/* Protocol Compliance */}
            <div className="bg-black/60 border border-white/5 p-6" style={cutCornersSmall}>
              <h2 className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-white`}>
                 <ShieldAlert className="w-4 h-4" /> PROTOCOL_COMPLIANCE
              </h2>
              <ul className="space-y-3 mb-6">
                {event.rules.slice(0, 4).map((rule, i) => (
                  <li key={i} className="text-[13px] text-gray-300 flex items-start gap-3 leading-relaxed">
                    <div className={`w-1.5 h-1.5 mt-1.5 shrink-0 ${themeColorBg}`}></div>
                    {rule}
                  </li>
                ))}
              </ul>
              <p className={`text-[10px] italic ${themeColorText} mb-6 flex items-center gap-2 opacity-80`}>
                <AlertTriangle className="w-4 h-4" /> Rules are subject to change at organizers&apos; discretion
              </p>
              
              <button className="flex items-center gap-2 text-[11px] font-bold text-white bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest w-full justify-center">
                <Download className="w-4 h-4" /> DOWNLOAD_FULL_RULES_PDF
              </button>
            </div>
            
          </div>

          {/* RIGHT COLUMN (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Event Context */}
            <div className="bg-black/60 border border-white/5 p-6" style={cutCornersSmall}>
              <h2 className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${themeColorText}`}>
                 <Info className="w-4 h-4" /> EVENT_CONTEXT
              </h2>
              <p className="text-[13px] text-gray-400 leading-relaxed italic">
                {event.description}
              </p>
            </div>

            {/* Bounty Pool */}
            <div className={`p-6 bg-gradient-to-br ${isCyan ? 'from-[#0A84FF]/20 to-[#00E5FF]/5 border border-[#00E5FF]/40' : 'from-[#8A2BE2]/20 to-[#D8BFD8]/5 border border-[#8A2BE2]/40'}`} style={cutCornersSmall}>
              <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                <h2 className={`text-[13px] font-bold uppercase tracking-[0.2em] italic flex items-center gap-2 text-white`}>
                   <Trophy className="w-5 h-5" /> BOUNTY_POOL
                </h2>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 font-bold">POOL TOTAL</p>
                  <p className="font-display font-black text-2xl text-white">{event.prizePool}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {event.bountyBreakdown ? event.bountyBreakdown.map((bounty, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider">{bounty.label}</span>
                    <span className="text-white italic font-bold text-sm">{bounty.value}</span>
                  </div>
                )) : (
                  <div className="text-center text-xs text-white">Breakdown pending...</div>
                )}
              </div>
            </div>

            {/* Contact Command */}
            <div className="bg-black/60 border border-white/5 p-6" style={cutCornersSmall}>
              <h2 className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${themeColorText}`}>
                 <Phone className="w-4 h-4" /> CONTACT_COMMAND
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">OVERALL COORDINATORS</p>
                  <div className="flex justify-between items-center text-[13px] text-gray-300">
                    <span className="font-bold text-white">Pranshu Sharma</span>
                    <span className={`text-[10px] italic flex items-center ${themeColorText}`}>
                      President 
                      <a href="mailto:spranshu671@gmail.com" className="hover:text-white transition-colors">
                        <Mail className="w-3 h-3 ml-1" />
                      </a>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] text-gray-300 mt-1">
                    <span className="font-bold text-white">Neer Jain</span>
                    <span className={`text-[10px] italic flex items-center ${themeColorText}`}>
                      Vice President 
                      <a href="mailto:neer14jain@gmail.com" className="hover:text-white transition-colors">
                        <Mail className="w-3 h-3 ml-1" />
                      </a>
                    </span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">EVENT COORDINATORS</p>
                  <div className="flex justify-between items-center text-[13px] text-gray-300">
                    <span className="font-bold text-white">Event Head 01</span>
                    <span className={`text-[10px] italic ${themeColorText}`}>+91 98765 43210</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] text-gray-300 mt-1">
                    <span className="font-bold text-white">Event Head 02</span>
                    <span className={`text-[10px] italic ${themeColorText}`}>+91 98765 43211</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <RegistrationButton eventName={event.name} isCyan={isCyan} cutCorners={cutCorners} />

            {/* Alert */}
            <div className="border border-red-500/30 bg-red-500/5 p-4 flex gap-3" style={cutCornersSmall}>
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold leading-relaxed">
                Strict adherence to technical constraints is mandatory for participation.
              </p>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
