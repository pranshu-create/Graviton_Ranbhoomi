"use client";

import { motion } from "framer-motion";
import { Cookie, Shield, CheckCircle, Info, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#02050A] text-gray-300 font-sans selection:bg-neon-cyan selection:text-black">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 border-b border-white/10 pb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
              <Cookie className="w-8 h-8 text-neon-cyan" />
            </div>
            <div>
              <h1 className="font-display font-black text-4xl text-white tracking-widest uppercase">Cookie Policy</h1>
              <p className="font-mono text-neon-cyan text-sm tracking-widest mt-1">LAST UPDATED: OCTOBER 2026</p>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-12 font-mono text-sm leading-relaxed"
        >
          
          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-electric-purple" />
              1. What Are Cookies
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Cookies are small data files placed on your device (computer, smartphone, or tablet) when you visit the RANBHOOMI 2.0 platform. They allow the system to recognize your device, maintain authenticated sessions, secure forms against automated bots, and retain your preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-electric-purple" />
              2. Cookies We Utilize
            </h2>
            <p className="text-gray-400 mb-4">
              RANBHOOMI strictly adheres to the principle of data minimization. We only deploy essential technical cookies required for the core operations of our platform:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">team_token</span>
                  <span className="text-xs text-neon-cyan">Essential / Authentication</span>
                </div>
                <p className="text-xs text-gray-400">Stores cryptographically signed JWT tokens for team squad leaders to securely access the command dashboard. Configured with HttpOnly, Secure, and SameSite: Strict flags.</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">admin_token</span>
                  <span className="text-xs text-neon-cyan">Essential / Security</span>
                </div>
                <p className="text-xs text-gray-400">Maintains role-authenticated sessions for event coordinators, judges, and administrators. Expires in 24 hours.</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">cf_turnstile / __cf_bm</span>
                  <span className="text-xs text-neon-cyan">Security / Anti-Bot</span>
                </div>
                <p className="text-xs text-gray-400">Provided by Cloudflare Turnstile to protect team registration and login endpoints from malicious DDoS attacks, automated bots, and brute force attempts.</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">cookie_consent</span>
                  <span className="text-xs text-neon-cyan">Preference</span>
                </div>
                <p className="text-xs text-gray-400">Stores your acknowledgment of our cookie protocol locally in your browser so you are not prompted repeatedly.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-electric-purple" />
              3. Managing & Disabling Cookies
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Most web browsers allow you to control cookies through browser settings. Please note that disabling essential authentication cookies (`team_token` or `admin_token`) will prevent you from logging in and accessing the squad management dashboard.
            </p>
            <p className="text-gray-400 leading-relaxed">
              For further inquiries regarding data security, please review our{" "}
              <Link href="/privacy" className="text-neon-cyan underline hover:text-white">Privacy Policy</Link>
              {" "}or contact our coordinators at{" "}
              <span className="text-white">gravitonroboticsidr@gmail.com</span>.
            </p>
          </section>

        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
