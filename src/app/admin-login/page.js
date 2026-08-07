"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);
  const router = useRouter();

  const extremeCut = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("adminEmail", emailInput);
        if (data.requires2FA) {
          router.push("/admin-verify-2fa");
          return;
        }
        router.push("/super-admin");
      } else {
        setAuthError(true);
        setTimeout(() => setAuthError(false), 2000);
      }
    } catch (err) {
      setAuthError(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neon-cyan font-mono flex flex-col justify-center items-center p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(102,252,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
      
      <div className="w-full max-w-md relative z-20 bg-black/80 border border-red-500/50 p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]" style={extremeCut}>
        <div className="flex items-center gap-4 mb-8 justify-center border-b border-red-500/30 pb-6">
          <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          <h1 className="font-display font-black text-3xl tracking-widest uppercase text-white">ROOT ACCESS</h1>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-red-500 mb-2 block font-bold">ADMIN EMAIL</label>
              <input 
                type="email" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)}
                className={`w-full bg-black border ${authError ? 'border-red-500 animate-pulse' : 'border-white/20 focus:border-red-500'} p-3 text-center text-white tracking-[0.2em] focus:outline-none transition-colors`}
                placeholder="admin@graviton.in"
                autoFocus
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2 font-bold">
                <label className="text-[10px] tracking-widest uppercase text-red-500">PASSPHRASE</label>
                <Link href="/forgot-password" className="text-[9px] text-gray-500 hover:text-red-500 tracking-wider uppercase transition-colors">
                  Forgot passphrase?
                </Link>
              </div>
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full bg-black border ${authError ? 'border-red-500 animate-pulse' : 'border-white/20 focus:border-red-500'} p-3 text-center text-white tracking-[0.5em] focus:outline-none transition-colors`}
                placeholder="••••••••••••••"
              />
            </div>
            {authError && <p className="text-red-500 text-[10px] mt-2 uppercase tracking-widest text-center font-bold">ACCESS DENIED. INTRUSION LOGGED.</p>}
          </div>
          <button 
            type="submit" 
            className="w-full bg-red-500/20 text-red-500 border border-red-500 py-3 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
          >
            AUTHENTICATE
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest">
            &lt;- ABORT AND RETURN TO BASE
          </Link>
        </div>
      </div>
    </div>
  );
}
