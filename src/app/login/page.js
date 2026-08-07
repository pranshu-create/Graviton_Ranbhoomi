"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userEmail", data.userEmail);
        if (data.requires2FA) {
          router.push("/verify-2fa");
          return;
        }
        localStorage.setItem("isLoggedIn", "true");
        window.dispatchEvent(new Event("auth-change"));
        router.push("/dashboard");
      } else {
        setError(data.error || "Authentication failed. Check credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("System error connecting to mainframe.");
      setLoading(false);
    }
  };

  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const extremeCut = { clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)" };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 flex items-center justify-center min-h-[80vh] relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative"
        >
          {/* Background decorative glow */}
          <div className="absolute inset-0 bg-neon-cyan/5 blur-3xl rounded-full"></div>
          
          <div style={extremeCut} className="bg-black/80 backdrop-blur-md p-10 border border-white/10 relative overflow-hidden group">
            {/* Animated border top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite]"></div>
            
            <div className="text-center mb-10">
              <h1 className="font-display font-black text-4xl text-white tracking-tighter mb-2 uppercase">
                SYSTEM <GlitchText text="LOGIN" className="text-neon-cyan text-glow-cyan" />
              </h1>
              <p className="font-mono text-xs text-gray-500 tracking-[0.2em] uppercase">&gt; AUTHENTICATE TO ACCESS COMMAND CENTER</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 text-xs font-mono text-center" style={cutCorners}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-neon-cyan mb-2 uppercase tracking-[0.2em]">&gt; LEADER_EMAIL</label>
                <div style={cutCorners} className="relative">
                  <input name="email" type="email" required className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-neon-cyan/5 transition-colors font-mono text-sm" placeholder="commander@squad.com" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-mono text-neon-cyan uppercase tracking-[0.2em]">&gt; SECURE_PASSWORD</label>
                  <Link href="/forgot-password" className="text-[9px] text-gray-500 hover:text-neon-cyan font-mono uppercase tracking-widest transition-colors">
                    Forgot passphrase?
                  </Link>
                </div>
                <div style={cutCorners} className="relative">
                  <input name="password" type="password" required className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-neon-cyan/5 transition-colors font-mono text-sm" placeholder="••••••••" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={cutCorners}
                className="w-full py-5 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-display font-bold tracking-[0.2em] hover:bg-neon-cyan hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(102,252,241,0.5)] flex items-center justify-center mt-8 relative overflow-hidden group/btn"
              >
                <span className="relative z-10 group-hover/btn:text-black">
                  {loading ? "AUTHENTICATING..." : "INITIATE LINK"}
                </span>
                <div className="absolute inset-0 h-full w-0 bg-neon-cyan transition-all duration-300 ease-out group-hover/btn:w-full z-0"></div>
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
                NO CLEARANCE YET? <Link href="/register" className="text-electric-purple hover:text-white transition-colors">REGISTER SQUAD</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
