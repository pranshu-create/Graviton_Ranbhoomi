"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function AdminVerify2FAPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("adminEmail") || "";
      setEmail(storedEmail);
      if (!storedEmail) {
        router.push("/admin-login");
      }
    }
  }, [router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Two-Factor Authentication verified. Access Granted.");
        setTimeout(() => {
          router.push("/super-admin");
        }, 1500);
      } else {
        setError(data.error || "Invalid verification code.");
        setLoading(false);
      }
    } catch (err) {
      setError("System connection failure. Please try again.");
      setLoading(false);
    }
  };

  const extremeCut = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  return (
    <div className="min-h-screen bg-black text-neon-cyan font-mono flex flex-col justify-center items-center p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(102,252,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
      
      <div className="w-full max-w-md relative z-20 bg-black/80 border border-red-500/50 p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]" style={extremeCut}>
        <div className="flex items-center gap-4 mb-8 justify-center border-b border-red-500/30 pb-6">
          <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          <h1 className="font-display font-black text-3xl tracking-widest uppercase text-white">ROOT SECURE</h1>
        </div>

        <div className="text-center mb-8">
          <p className="text-xs text-red-500 tracking-[0.15em] uppercase mb-1">&gt; TWO-FACTOR VERIFICATION REQUIRED</p>
          {email && <p className="text-[10px] text-gray-500 lowercase">{email}</p>}
        </div>
        
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            
            {error && (
              <p className="text-red-500 text-[10px] uppercase tracking-widest text-center font-bold">
                {error}
              </p>
            )}

            {successMsg && (
              <p className="text-green-500 text-[10px] uppercase tracking-widest text-center font-bold">
                {successMsg}
              </p>
            )}

            <div>
              <label className="text-[10px] tracking-widest uppercase text-red-500 mb-2 block font-bold text-center">
                ENTER 6-DIGIT OTP SECURITY CODE
              </label>
              <input 
                type="text" 
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full bg-black border border-white/20 focus:border-red-500 p-3 text-center text-white tracking-[1em] text-lg focus:outline-none transition-colors"
                placeholder="000000"
                autoFocus
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || otp.length !== 6}
            className={`w-full bg-red-500/20 text-red-500 border border-red-500 py-3 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors ${otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "VERIFYING..." : "CONFIRM ACCESS"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              localStorage.removeItem("adminEmail");
              router.push("/admin-login");
            }}
            className="text-[10px] text-red-500 hover:text-white uppercase tracking-widest"
          >
            ABORT AND LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
}
