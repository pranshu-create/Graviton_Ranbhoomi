"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Server } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
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
              <Shield className="w-8 h-8 text-neon-cyan" />
            </div>
            <div>
              <h1 className="font-display font-black text-4xl text-white tracking-widest uppercase">Privacy Policy</h1>
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
              <Database className="w-5 h-5 text-electric-purple" />
              1. Data Collection
            </h2>
            <p className="mb-4">
              Graviton Robotics collects information necessary to facilitate your participation in RANBHOOMI 2.0. This includes, but is not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Personal identification information (Name, Email address, Phone number).</li>
              <li>Academic affiliations (Institution name, Student ID).</li>
              <li>Payment details necessary for registration (Transaction IDs, UTR numbers).</li>
              <li>Technical data associated with your interaction with our platforms (IP address, browser type).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-electric-purple" />
              2. Data Usage & Security
            </h2>
            <p className="mb-4">
              We implement state-of-the-art encryption protocols to safeguard your telemetry and personal records. The data collected is utilized strictly for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Verifying participant identities and managing event registrations.</li>
              <li>Processing accommodation requests and maintaining hostel security logs.</li>
              <li>Generating promotional assets (e.g., dynamic ID cards, Instagram templates) with explicit participant consent.</li>
              <li>Communicating crucial event updates and mission-critical alerts.</li>
            </ul>
            <p className="mt-4 p-4 border border-electric-purple/30 bg-electric-purple/5 text-electric-purple rounded-md">
              [SYSTEM NOTE]: Your data will NEVER be sold or distributed to third-party entities outside the scope of the RANBHOOMI event operations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-electric-purple" />
              3. Cookies and Tracking
            </h2>
            <p className="mb-4">
              Our Command Center utilizes localized session tokens (cookies) to maintain your authenticated state across the platform. These minimal tracking footprints are essential for the operation of the dashboard and ensuring secure access to restricted modules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-electric-purple" />
              4. Data Retention
            </h2>
            <p className="mb-4">
              Participant data is securely retained in our encrypted databanks for the duration of the event lifecycle and a limited subsequent archival period. Following the conclusion of RANBHOOMI operations and final audits, non-essential personal identifiers are scheduled for systemic purging.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">
              5. Contact Overhead
            </h2>
            <p>
              If you have inquiries regarding your data footprint or wish to initiate a data deletion protocol, dispatch a transmission to our central communications relay at: <a href="mailto:gravitonroboticsidr@gmail.com" className="text-neon-cyan hover:underline">gravitonroboticsidr@gmail.com</a>.
            </p>
          </section>

        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
