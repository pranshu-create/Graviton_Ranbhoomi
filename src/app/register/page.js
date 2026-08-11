"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlitchText from "@/components/GlitchText";
import { motion } from "framer-motion";
import SignalInterceptor from "@/components/SignalInterceptor";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLockdown, setIsLockdown] = useState(false);
  const [frozenEvents, setFrozenEvents] = useState([]);
  const [systemCheckLoading, setSystemCheckLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("ROBO SOCCER");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showInterceptor, setShowInterceptor] = useState(false);
  const [interceptedEvent, setInterceptedEvent] = useState("");

  useEffect(() => {
    const checkSystemState = async () => {
      try {
        const res = await fetch("/api/system");
        const data = await res.json();
        if (data.success && data.config) {
          setIsLockdown(data.config.isLockdown);
          setFrozenEvents(data.config.frozenEvents || []);
        }
      } catch (err) {
        console.error("System state fetch failed", err);
      } finally {
        setSystemCheckLoading(false);
      }
    };
    checkSystemState();

    // Check URL parameters to pre-fill the event
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefilled = params.get("event");
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const email = localStorage.getItem("userEmail") || "";
      setTimeout(() => {
        if (prefilled) {
          setSelectedEvent(prefilled);
        }
        setIsLoggedIn(loggedIn);
        setUserEmail(email);
      }, 0);
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Extract data from form (simplified for prototype)
    const formData = new FormData(e.target);
    const eventName = formData.get("event");

    if (frozenEvents.some(fe => fe.toUpperCase() === eventName.toUpperCase())) {
      setInterceptedEvent(eventName);
      setShowInterceptor(true);
      return;
    }

    setLoading(true);
    
    const teamName = formData.get("teamName");
    const institution = formData.get("institution");
    const password = formData.get("password") || undefined;
    
    const memberDetails = [];
    
    const m1Name = formData.get("m1_name")?.trim();
    const m1Email = formData.get("m1_email")?.trim();
    const m1Phone = formData.get("m1_phone")?.trim();
    if (m1Name && m1Email) {
      memberDetails.push({ role: "Leader", name: m1Name, email: m1Email, phone: m1Phone || undefined });
    }

    for (let i = 2; i <= 4; i++) {
      const name = formData.get(`m${i}_name`)?.trim();
      const email = formData.get(`m${i}_email`)?.trim();
      if (name && email) {
        memberDetails.push({ role: "Member", name, email });
      }
    }

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName,
          event: eventName,
          institution,
          password,
          memberDetails
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userEmail", formData.get("m1_email")); // Save Leader Email
        localStorage.setItem("isLoggedIn", "true");
        window.dispatchEvent(new Event("auth-change"));
        router.push("/dashboard");
      } else {
        alert("Registration Failed: " + data.error + (data.details ? "\nDetails: " + data.details : ""));
        setLoading(false);
      }
    } catch (err) {
      alert("Error connecting to backend");
      setLoading(false);
    }
  };

  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const extremeCut = { clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)" };

  return (
    <>
      <Navbar />
      
      {showInterceptor && (
        <SignalInterceptor 
          eventName={interceptedEvent} 
          onClose={() => setShowInterceptor(false)} 
        />
      )}

      <main className="flex-grow pt-32 pb-20 px-4 flex items-center justify-center min-h-[80vh] relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl relative"
        >
          {/* Background decorative glow */}
          <div className="absolute inset-0 bg-electric-purple/5 blur-3xl rounded-full"></div>
          
          <div style={extremeCut} className="bg-black/80 backdrop-blur-md p-10 border border-white/10 relative overflow-hidden group">
            {/* Animated border top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-purple to-transparent opacity-50 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite]"></div>
            
            <div className="text-center mb-10">
              <h1 className="font-display font-black text-4xl text-white tracking-tighter mb-2 uppercase">
                NEW <GlitchText text="SQUAD" className="text-electric-purple text-glow-purple" />
              </h1>
              <p className="font-mono text-xs text-gray-500 tracking-[0.2em] uppercase">&gt; REGISTER YOUR UNIT FOR COMBAT (1-4 MEMBERS)</p>
            </div>

            {systemCheckLoading ? (
              <div className="text-center py-20">
                <p className="font-mono text-neon-cyan animate-pulse">CHECKING SYSTEM CLEARANCE...</p>
              </div>
            ) : isLockdown ? (
              <div className="text-center py-10 space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500 mb-4 animate-pulse">
                  <span className="text-red-500 font-black text-4xl">!</span>
                </div>
                <h2 className="font-display font-black text-3xl text-red-500 tracking-tighter uppercase">
                  REGISTRATIONS CLOSED
                </h2>
                <p className="font-mono text-sm text-gray-400 max-w-md mx-auto leading-relaxed border border-red-500/20 bg-red-500/5 p-4" style={cutCorners}>
                  The RANBHOOMI central server is currently under lockdown. Registration protocols have been temporarily suspended. Please await further instructions.
                </p>
                <div className="pt-8">
                  <Link href="/" className="font-mono text-xs text-gray-500 tracking-widest hover:text-white transition-colors">
                    &lt;- RETURN_TO_BASE
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-8">
                
                {/* Unit Info */}
                <div className="space-y-4">
                  <h3 className="font-display text-electric-purple text-lg border-b border-electric-purple/30 pb-2">UNIT_DETAILS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-electric-purple mb-2 uppercase tracking-[0.2em]">&gt; TARGET_EVENT</label>
                      <div style={cutCorners} className="relative">
                        <select 
                          name="event" 
                          required 
                          className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-electric-purple focus:bg-electric-purple/5 transition-colors font-mono text-sm appearance-none cursor-pointer"
                          value={selectedEvent}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                        >
                          {["ROBO SOCCER", "ROBO RACE", "LINE FOLLOWER", "ROBO SUMO", "HACKATHON"].map(e => {
                            const isFrozen = frozenEvents.some(fe => fe.toUpperCase() === e.toUpperCase());
                            return (
                              <option key={e} value={e} className="bg-black text-white">
                                {e} {isFrozen ? ' [FROZEN]' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-electric-purple mb-2 uppercase tracking-[0.2em]">&gt; TEAM_NAME</label>
                      <div style={cutCorners} className="relative">
                        <input name="teamName" type="text" required className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-electric-purple focus:bg-electric-purple/5 transition-colors font-mono text-sm" placeholder="Alpha Squad" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-electric-purple mb-2 uppercase tracking-[0.2em]">&gt; INSTITUTION</label>
                      <div style={cutCorners} className="relative">
                        <input name="institution" type="text" required className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-electric-purple focus:bg-electric-purple/5 transition-colors font-mono text-sm" placeholder="University Name" />
                      </div>
                    </div>
                    {!isLoggedIn && (
                      <div>
                        <label className="block text-[10px] font-mono text-electric-purple mb-2 uppercase tracking-[0.2em]">&gt; SECURE_PASSWORD</label>
                        <div style={cutCorners} className="relative">
                          <input name="password" type="password" required className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-electric-purple focus:bg-electric-purple/5 transition-colors font-mono text-sm" placeholder="••••••••" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-4">
                  <h3 className="font-display text-electric-purple text-lg border-b border-electric-purple/30 pb-2">PERSONNEL_DATA</h3>
                  
                  {/* Leader */}
                  <div className="bg-white/5 p-4 border border-white/10" style={cutCorners}>
                    <label className="block text-[10px] font-mono text-neon-cyan mb-3 uppercase tracking-[0.2em]">&gt; MEMBER_1 (LEADER)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input name="m1_name" type="text" required className="bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-neon-cyan font-mono text-xs w-full" placeholder="Full Name" />
                      <input name="m1_email" type="email" defaultValue={userEmail} readOnly={isLoggedIn} required className={`bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-neon-cyan font-mono text-xs w-full ${isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="Email" />
                      <input name="m1_phone" type="tel" required className="bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-neon-cyan font-mono text-xs w-full" placeholder="Phone" />
                    </div>
                  </div>

                  {/* Member 2 */}
                  <div className="bg-white/5 p-4 border border-white/10" style={cutCorners}>
                    <label className="block text-[10px] font-mono text-gray-400 mb-3 uppercase tracking-[0.2em]">&gt; MEMBER_2 (OPTIONAL)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input name="m2_name" type="text" className="bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-electric-purple font-mono text-xs w-full" placeholder="Full Name" />
                      <input name="m2_email" type="email" className="bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-electric-purple font-mono text-xs w-full" placeholder="Email" />
                    </div>
                  </div>

                  {/* Member 3 */}
                  <div className="bg-white/5 p-4 border border-white/10" style={cutCorners}>
                    <label className="block text-[10px] font-mono text-gray-400 mb-3 uppercase tracking-[0.2em]">&gt; MEMBER_3 (OPTIONAL)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input name="m3_name" type="text" className="bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-electric-purple font-mono text-xs w-full" placeholder="Full Name" />
                      <input name="m3_email" type="email" className="bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-electric-purple font-mono text-xs w-full" placeholder="Email" />
                    </div>
                  </div>

                  {/* Member 4 */}
                  <div className="bg-white/5 p-4 border border-white/10" style={cutCorners}>
                    <label className="block text-[10px] font-mono text-gray-400 mb-3 uppercase tracking-[0.2em]">&gt; MEMBER_4 (OPTIONAL)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input name="m4_name" type="text" className="bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-electric-purple font-mono text-xs w-full" placeholder="Full Name" />
                      <input name="m4_email" type="email" className="bg-black/50 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-electric-purple font-mono text-xs w-full" placeholder="Email" />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={cutCorners}
                  className="w-full py-5 bg-electric-purple/10 border border-electric-purple text-electric-purple font-display font-bold tracking-[0.2em] hover:bg-electric-purple hover:text-white transition-all duration-300 hover:box-glow-purple flex items-center justify-center mt-8 relative overflow-hidden group/btn"
                >
                  <span className="relative z-10 group-hover/btn:text-white">
                    {loading ? "INITIALIZING DATA..." : "COMMIT TEAM DATA"}
                  </span>
                  <div className="absolute inset-0 h-full w-0 bg-electric-purple transition-all duration-300 ease-out group-hover/btn:w-full z-0"></div>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
