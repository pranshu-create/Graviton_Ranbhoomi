"use client";

import { motion } from "framer-motion";
import { Terminal, AlertTriangle, FileText, Scale } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
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
            <div className="p-3 bg-electric-purple/10 border border-electric-purple/30 rounded-lg">
              <FileText className="w-8 h-8 text-electric-purple" />
            </div>
            <div>
              <h1 className="font-display font-black text-4xl text-white tracking-widest uppercase">Terms & Conditions</h1>
              <p className="font-mono text-electric-purple text-sm tracking-widest mt-1">OPERATIONAL DIRECTIVES</p>
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
              1. General Regulations
            </h2>
            <p className="mb-4">
              By registering for RANBHOOMI 2.0, participants agree to adhere strictly to the operational guidelines set forth by the Graviton Robotics administrative core. The organizers reserve the sovereign right to alter rules, schedules, and arena configurations as deemed necessary for event integrity.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>All robotic constructs must pass the pre-event compliance checks.</li>
              <li>Unauthorized modification of bots post-inspection will result in immediate disqualification.</li>
              <li>The decisions rendered by the arena judges and Overwatch command are final and binding.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-neon-cyan" />
              2. Conduct and Safety Protocols
            </h2>
            <p className="mb-4">
              Safety is the highest priority within the Graviton facilities. Any breach of safety protocols may result in expulsion from the campus.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Participants must handle high-voltage equipment and kinetic machinery responsibly.</li>
              <li>Sabotage, unsportsmanlike conduct, or damage to Graviton property will be met with severe disciplinary action and potential financial liability.</li>
              <li>Protective gear must be worn in designated hazardous zones (e.g., Robo Wars Arena).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-neon-cyan" />
              3. Registration and Financial Transactions
            </h2>
            <p className="mb-4">
              Access to the battlegrounds is strictly restricted to verified squads.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Registration fees are non-refundable under any circumstances unless the event is officially cancelled by the organizers.</li>
              <li>Payment verification may take up to 24-48 hours. Fraudulent transaction attempts will result in an immediate permanent ban.</li>
              <li>Accommodation fees, if applicable, are separate from event registration and subject to hostel authority guidelines.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">
              4. Media and Broadcasting Rights
            </h2>
            <p className="mb-4">
              By participating in RANBHOOMI 2.0, you grant Graviton Robotics the right to capture and utilize photographic and video material featuring your team and constructs for promotional, archival, and broadcasting purposes without compensation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">
              5. Liability Disclaimer
            </h2>
            <p className="mb-4">
              Graviton Robotics and the hosting institution shall not be held liable for any physical injury, loss of property, or damage to robotic equipment sustained during the course of the event. Participants engage in the competitions entirely at their own risk.
            </p>
            <div className="mt-4 p-4 border border-red-500/30 bg-red-500/5 text-red-500 rounded-md">
              [WARNING]: Failure to comply with the Terms and Conditions will trigger the immediate revocation of your access pass and removal from the premises.
            </div>
          </section>

        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
