"use client";

import Link from "next/link";
import { Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function SuperAdminLink() {
  const pathname = usePathname();

  // Hide the link if we are already on the admin-login or super-admin page
  if (pathname?.startsWith("/super-admin") || pathname?.startsWith("/admin-login")) return null;

  return (
    <Link href="/admin-login" className="fixed bottom-6 left-6 z-[100] group cursor-pointer" title="Admin Access">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 bg-black/50 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center relative overflow-hidden transition-colors hover:border-electric-purple/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(184,41,234,0.3)]"
      >
        <div className="absolute inset-0 bg-electric-purple/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Fingerprint className="w-5 h-5 text-gray-500 group-hover:text-electric-purple transition-colors relative z-10" />
        
        {/* Subtle scanning effect on hover */}
        <motion.div 
          className="absolute left-0 right-0 h-0.5 bg-electric-purple/50 opacity-0 group-hover:opacity-100"
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        ></motion.div>
      </motion.div>
    </Link>
  );
}
