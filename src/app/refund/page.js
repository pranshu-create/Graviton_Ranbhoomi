"use client";

import { motion } from "framer-motion";
import { Terminal, ShieldAlert, CreditCard, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPolicy() {
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
              <CreditCard className="w-8 h-8 text-neon-cyan" />
            </div>
            <div>
              <h1 className="font-display font-black text-4xl text-white tracking-widest uppercase">Refund Policy</h1>
              <p className="font-mono text-neon-cyan text-sm tracking-widest mt-1">TRANSACTION PROTOCOLS</p>
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
              <Terminal className="w-5 h-5 text-neon-cyan" />
              1. General Refund & Transfer Policy
            </h2>
            <div className="p-4 border border-red-500/30 bg-red-500/5 text-gray-300 rounded-md mb-6">
              <span className="text-red-500 font-bold uppercase tracking-wider block mb-2">[CRITICAL POLICY NOTICE]:</span>
              <strong>Under no circumstances shall any registered team or participant be eligible for a refund of their registration fee or accommodation fee. Furthermore, transfer of registration passes, slots, or fees to another team, squad, or individual is strictly prohibited.</strong>
            </div>
            <p className="mb-4">
              Registration slots for RANBHOOMI 2.0 are highly limited and dynamically allocated. Once a booking or team slot is locked in, it represents a dedicated resource allocation within the mainframe database and event schedule.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-neon-cyan" />
              2. Authorized Exceptions
            </h2>
            <p className="mb-4">
              The only scenario in which a refund or transfer will be approved, processed, or verified is:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-gray-400">
              <li>
                <strong className="text-white">Mistakes by Graviton Team:</strong> An administrative error, payment gateway validation failure, or database record error proven to be directly caused by the Graviton Robotics organizing core.
              </li>
              <li>
                <strong className="text-white">Duplicate Payments:</strong> Verified system-level duplicate charges for the exact same team registration. In such cases, the duplicate transaction will be refunded upon verification of the UTR / Transaction ID logs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-neon-cyan" />
              3. Disqualification & Compliance
            </h2>
            <p className="mb-4">
              Compliance with RANBHOOMI 2.0 safety regulations and structural rules is mandatory.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>If a team is disqualified for failing technical inspections, safety checks, or violating the codes of conduct, no refunds will be granted.</li>
              <li>No-show teams (who fail to report to the registration desk on time) forfeit their fees completely.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">
              4. Contact & Disputes
            </h2>
            <p className="mb-4">
              For any payment-related discrepancies, duplicate transactions, or questions, please email the administrative core at:
              <br />
              <span className="text-neon-cyan mt-2 block font-bold">gravitonroboticsidr@gmail.com</span>
            </p>
            <div className="mt-4 p-4 border border-red-500/20 bg-red-950/10 text-gray-400 rounded-md">
              [NOTICE]: Unauthorized chargebacks or dispute filings via banks without email resolution attempt will result in the immediate permanent blacklist of all team members from all future events.
            </div>
          </section>

        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
