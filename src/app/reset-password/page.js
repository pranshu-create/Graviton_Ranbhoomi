"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!token) {
      setError("Missing security reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passphrases do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Passphrase must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Security credentials updated. Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Password reset failed. Token might be expired.");
        setLoading(false);
      }
    } catch (err) {
      setError("System connection failure. Please try again.");
      setLoading(false);
    }
  };

  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const extremeCut = { clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)" };

  return (
    <div style={extremeCut} className="bg-black/80 backdrop-blur-md p-10 border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite]"></div>
      
      <div className="text-center mb-8">
        <h1 className="font-display font-black text-3xl text-white tracking-tighter mb-2 uppercase">
          RESET <GlitchText text="CREDENTIALS" className="text-neon-cyan text-glow-cyan" />
        </h1>
        <p className="font-mono text-xs text-gray-500 tracking-[0.15em] uppercase">&gt; UPDATE SECURE PASSPHRASE</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
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
          <label className="block text-[10px] font-mono text-neon-cyan mb-2 uppercase tracking-[0.2em]">&gt; NEW_PASSPHRASE</label>
          <div style={cutCorners} className="relative">
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-neon-cyan/5 transition-all font-mono text-sm" 
              placeholder="••••••••" 
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-neon-cyan mb-2 uppercase tracking-[0.2em]">&gt; CONFIRM_PASSPHRASE</label>
          <div style={cutCorners} className="relative">
            <input 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-neon-cyan/5 transition-all font-mono text-sm" 
              placeholder="••••••••" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !token}
          style={cutCorners}
          className={`w-full py-4 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-display font-bold tracking-[0.2em] hover:bg-neon-cyan hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(102,252,241,0.5)] flex items-center justify-center relative overflow-hidden group/btn ${!token ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="relative z-10 group-hover/btn:text-black">
            {loading ? "SAVING CREDENTIALS..." : "OVERRIDE PASSWORD"}
          </span>
          <div className="absolute inset-0 h-full w-0 bg-neon-cyan transition-all duration-300 ease-out group-hover/btn:w-full z-0"></div>
        </button>
      </form>

      <div className="mt-6 text-center border-t border-white/10 pt-4">
        <a 
          href="/login" 
          className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-mono"
        >
          &lt; BACK_TO_LOGIN
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          
          <Suspense fallback={
            <div className="text-center font-mono text-xs text-neon-cyan uppercase animate-pulse">
              Initializing Secure Handshake...
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
