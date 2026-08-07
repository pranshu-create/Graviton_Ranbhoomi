"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, RefreshCw, KeyRound } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("userEmail") || "";
      setEmail(storedEmail);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Email verified! Access authorized.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(data.error || "Verification failed. Check code.");
        setLoading(false);
      }
    } catch (err) {
      setError("System connection error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "New code dispatched.");
      } else {
        setError(data.error || "Failed to resend code.");
      }
    } catch (err) {
      setError("Error contacting server.");
    } finally {
      setResending(false);
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
          <div className="absolute inset-0 bg-neon-cyan/5 blur-3xl rounded-full"></div>
          
          <div style={extremeCut} className="bg-black/80 backdrop-blur-md p-10 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite]"></div>
            
            <div className="text-center mb-8">
              <h1 className="font-display font-black text-3xl text-white tracking-tighter mb-2 uppercase">
                VERIFY <GlitchText text="EMAIL" className="text-neon-cyan text-glow-cyan" />
              </h1>
              <p className="font-mono text-xs text-gray-500 tracking-[0.2em] uppercase">&gt; ENTER VERIFICATION PASSCODE</p>
              {email && <p className="font-mono text-[10px] text-neon-cyan/70 mt-2 lowercase">{email}</p>}
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 text-xs font-mono text-center" style={cutCorners}>
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 text-xs font-mono text-center" style={cutCorners}>
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-neon-cyan mb-2 uppercase tracking-[0.2em]">&gt; 6-DIGIT_OTP_CODE</label>
                <div style={cutCorners} className="relative">
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-neon-cyan/5 transition-colors font-mono text-center tracking-[1em] text-lg" 
                    placeholder="000000" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                style={cutCorners}
                className={`w-full py-4 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-display font-bold tracking-[0.2em] hover:bg-neon-cyan hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(102,252,241,0.5)] flex items-center justify-center relative overflow-hidden group/btn ${otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10 group-hover/btn:text-black">
                  {loading ? "AUTHORIZING..." : "VERIFY CODE"}
                </span>
                <div className="absolute inset-0 h-full w-0 bg-neon-cyan transition-all duration-300 ease-out group-hover/btn:w-full z-0"></div>
              </button>
            </form>

            <div className="mt-6 text-center border-t border-white/10 pt-4 flex justify-between items-center">
              <button 
                onClick={handleResend}
                disabled={resending}
                className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 font-mono"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                {resending ? "TRANSMITTING..." : "RESEND_CODE"}
              </button>
              <button 
                onClick={() => {
                  document.cookie = 'team_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  localStorage.removeItem("isLoggedIn");
                  localStorage.removeItem("userEmail");
                  router.push("/login");
                }}
                className="text-[10px] text-red-500 hover:text-white transition-colors uppercase tracking-widest font-mono"
              >
                ABORT_SESSION
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
