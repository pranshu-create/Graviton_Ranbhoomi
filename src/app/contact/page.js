"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, Send, CheckCircle2, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "REGISTRATION ISSUE",
    message: "",
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: null,
    error: null,
  });

  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const borderCorners = { clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: null, error: null });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ submitting: false, success: data.message, error: null });
        setFormData({ name: "", email: "", subject: "REGISTRATION ISSUE", message: "" });
      } else {
        setStatus({ submitting: false, success: null, error: data.error });
      }
    } catch (err) {
      console.error(err);
      setStatus({ submitting: false, success: null, error: "Network anomaly detected. Failed to transmit." });
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Background ambient text */}
        <div className="absolute top-[10vh] left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none z-0">
          <div className="font-display font-black text-[20vh] tracking-tighter leading-none">
            SIGNAL TERMINAL TRANSMIT HQ
          </div>
        </div>

        {/* Heading Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-neon-cyan/20 -z-10"></div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 bg-background inline-block px-8 tracking-tighter">
            CONTACT <GlitchText text="TERMINAL" className="text-neon-cyan text-glow-cyan" />
          </h1>
          <p className="font-mono text-xs text-gray-400 max-w-2xl mx-auto uppercase tracking-[0.3em]">
            &gt; ESTABLISH A SECURE INTERCEPT WITH ORGANIZERS
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Info Panels Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Communication HQ Details */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={cutCorners}
              className="bg-black/60 border border-white/10 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan/30"></div>
              
              <h2 className="font-display font-bold text-xl text-neon-cyan mb-6 tracking-wider uppercase flex items-center gap-2">
                <HelpCircle className="w-5 h-5" /> DIRECT_TUNNEL
              </h2>
              
              <div className="space-y-6 font-mono text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{"// EMAIL INBOX"}</p>
                  <p className="text-white hover:text-neon-cyan transition-colors">
                    <a href="mailto:gravitonroboticsidr@gmail.com">gravitonroboticsidr@gmail.com</a>
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{"// INSTAGRAM BEACON"}</p>
                  <p className="text-white hover:text-pink-500 transition-colors">
                    <a href="https://www.instagram.com/team.graviton.robotics?utm_source=qr&igsh=MWl5OHptZmQ1Nms4bA==" target="_blank" rel="noopener noreferrer">
                      @team.graviton.robotics
                    </a>
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{"// COMMAND QUARTERS"}</p>
                  <p className="text-gray-300 leading-relaxed">
                    SVKM NMIMS, Indore Campus<br />
                    Off Super Corridor, Bada Bangarda<br />
                    Indore, MP - 453112
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick Diagnostic / SLA status */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={cutCorners}
              className="bg-black/40 border border-white/10 p-6 relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-electric-purple/30"></div>
              
              <h2 className="font-display font-bold text-lg text-electric-purple mb-4 tracking-wider uppercase">
                &gt; TERMINAL_METRICS
              </h2>
              
              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>AVERAGE RESPONSE TIME:</span>
                  <span className="text-neon-cyan font-bold">&lt; 180 MINUTES</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>ENCRYPTION LEVEL:</span>
                  <span className="text-neon-cyan font-bold">AES-256 STATELESS</span>
                </div>
                <div className="flex justify-between">
                  <span>TUNNEL STATUS:</span>
                  <span className="text-green-500 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> ONLINE
                  </span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              {/* Form Outer Glass Container */}
              <div 
                style={cutCorners} 
                className="bg-black/60 border border-white/10 p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-electric-purple to-transparent opacity-50"></div>
                
                <h2 className="font-display font-black text-2xl text-white mb-6 uppercase tracking-wider">
                  SEND_MESSAGE
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name field */}
                  <div>
                    <label className="block font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">
                      01 / SENDER_NAME
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="ENTER YOUR REGISTERED OR FULL NAME"
                      className="w-full bg-black/60 border border-white/20 p-4 font-mono text-sm focus:border-neon-cyan focus:outline-none transition-colors text-white uppercase tracking-wider"
                      style={borderCorners}
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">
                      02 / PAYLOAD_EMAIL
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ENTER E-MAIL FOR TRANSMISSION RESPONSE"
                      className="w-full bg-black/60 border border-white/20 p-4 font-mono text-sm focus:border-neon-cyan focus:outline-none transition-colors text-white tracking-wide"
                      style={borderCorners}
                    />
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="block font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">
                      03 / TUNNEL_SUBJECT
                    </label>
                    <div className="relative">
                      <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/20 p-4 font-mono text-sm focus:border-neon-cyan focus:outline-none transition-colors text-white appearance-none uppercase tracking-wide cursor-pointer"
                        style={borderCorners}
                      >
                        <option value="REGISTRATION ISSUE">REGISTRATION ISSUE</option>
                        <option value="EVENT RULES INQUIRY">EVENT RULES INQUIRY</option>
                        <option value="ACCOMMODATION REQUEST">ACCOMMODATION REQUEST</option>
                        <option value="SPONSORSHIP DEALS">SPONSORSHIP DEALS</option>
                        <option value="TECHNICAL SUPPORT">TECHNICAL SUPPORT</option>
                        <option value="OTHER INQUIRIES">OTHER INQUIRIES</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neon-cyan font-mono text-xs">
                        [SELECT]
                      </div>
                    </div>
                  </div>

                  {/* Message field */}
                  <div>
                    <label className="block font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">
                      04 / MESSAGE_CONTENT (MIN 10 CHARS)
                    </label>
                    <textarea 
                      name="message"
                      required
                      minLength={10}
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="TRANSMIT YOUR DETAILED CORRESPONDENCE HERE..."
                      className="w-full bg-black/60 border border-white/20 p-4 font-mono text-sm focus:border-neon-cyan focus:outline-none transition-colors text-white tracking-wide resize-none"
                      style={borderCorners}
                    ></textarea>
                  </div>

                  {/* Alerts */}
                  <AnimatePresence mode="wait">
                    {status.success && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-neon-cyan/10 border border-neon-cyan p-4 text-neon-cyan font-mono text-sm flex gap-3 items-center"
                      >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{status.success}</span>
                      </motion.div>
                    )}

                    {status.error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-500/10 border border-red-500 p-4 text-red-500 font-mono text-sm flex gap-3 items-center"
                      >
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>{status.error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={status.submitting}
                    className="w-full py-4 relative group cursor-pointer bg-transparent border-none outline-none flex items-center justify-center gap-3 font-mono text-sm tracking-[0.2em] uppercase text-white font-bold transition-all disabled:opacity-50"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-neon-cyan/20 border border-neon-cyan transition-all duration-300 group-hover:bg-neon-cyan group-hover:text-black" style={borderCorners}></div>
                    
                    <span className="relative z-10 flex items-center gap-3 group-hover:text-black transition-colors font-semibold">
                      {status.submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          TRANSMITTING_SIGNAL...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          LAUNCH_TRANSMISSION
                        </>
                      )}
                    </span>
                  </button>

                </form>
              </div>

              {/* Background Glow */}
              <div 
                style={cutCorners} 
                className="absolute inset-0 bg-neon-cyan opacity-0 group-hover:opacity-[0.03] blur-2xl transition-opacity duration-500 -z-10 pointer-events-none"
              ></div>
            </motion.div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
