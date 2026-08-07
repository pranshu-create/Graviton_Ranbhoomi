"use client";

import Link from "next/link";
import { Globe, MessageSquare, Monitor, Share2, Mail, MapPin, Camera } from "lucide-react";
import { useState, useEffect } from "react";

function HQLocation() {
  const finalAddress = "LAT: 28.5355° N\nLONG: 77.3910° E\nGRAVITON ROBOTICS HQ";
  const [text, setText] = useState("LOCATING SIGNAL...\nENCRYPTED DATA\n[ TAP / HOVER TO DECRYPT ]");
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    let interval;
    if (isHovered) {
      let iteration = 0;
      interval = setInterval(() => {
        setText(finalAddress.split("").map((char, index) => {
          if(char === '\n') return '\n';
          if(index < iteration) return finalAddress[index];
          return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*".charAt(Math.floor(Math.random() * 42));
        }).join(""));
        
        if (iteration >= finalAddress.length) clearInterval(interval);
        iteration += 1/2; // Controls speed of decryption
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className="mt-4 p-3 border border-white/10 bg-black/50 font-mono text-[10px] sm:text-xs text-neon-cyan relative cursor-crosshair group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setText("LOCATING SIGNAL...\nENCRYPTED DATA\n[ HOVER TO DECRYPT ]"); }}
      // On mobile: tap to trigger decrypt (touch devices don't have hover)
      onClick={() => {
        if (!isHovered) {
          setIsHovered(true);
          // Auto-reset after decrypt animation completes
          setTimeout(() => {
            setIsHovered(false);
            setText("LOCATING SIGNAL...\nENCRYPTED DATA\n[ TAP TO DECRYPT ]");
          }, 3500);
        }
      }}
      style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan/20 group-hover:bg-neon-cyan/50 transition-colors"></div>
      <div className="flex gap-2 items-start">
        <MapPin className="w-4 h-4 text-gray-500 group-hover:text-neon-cyan shrink-0 transition-colors" />
        <pre className="whitespace-pre-wrap leading-tight">{text}</pre>
      </div>
      <div className="absolute bottom-1 right-2 w-2 h-2 bg-neon-cyan animate-pulse opacity-0 group-hover:opacity-100"></div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-t-neon-cyan/20 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display font-bold text-2xl text-white tracking-widest">
                RAN<span className="text-neon-cyan text-glow-cyan">BHOOMI</span>
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              The ultimate technical robotics fest by Graviton Robotics. 
              Join us in Winter 2026 for a spectacular display of innovation and engineering.
            </p>
            <div className="flex space-x-6 items-center">
              <a href="https://www.instagram.com/team.graviton.robotics?utm_source=qr&igsh=MWl5OHptZmQ1Nms4bA==" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors p-2 -m-2 inline-block" title="Instagram">
                <Camera className="h-5 w-5" />
              </a>
              <a href="mailto:gravitonroboticsidr@gmail.com" className="text-gray-400 hover:text-red-500 transition-colors p-2 -m-2 inline-block" title="Email HQ">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white tracking-wider mb-4">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">About</Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">Events</Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">Gallery</Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">Resources</Link>
              </li>
              <li>
                <Link href="/sponsors" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">Sponsors</Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">Team</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white tracking-wider mb-4">CONTACT</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400 text-sm">
                <Mail className="h-4 w-4 mr-2 text-neon-cyan" />
                gravitonroboticsidr@gmail.com
              </li>
            </ul>
            <HQLocation />
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Graviton Robotics. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-500 hover:text-white text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-sm">Terms of Service</Link>
            <Link href="/refund" className="text-gray-500 hover:text-white text-sm">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
