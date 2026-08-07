"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HackerTerminal() {
  const [isVisible, setIsVisible] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [isPurging, setIsPurging] = useState(false);
  
  // Easter egg trigger: Listen for "graviton" globally
  useEffect(() => {
    let keyBuffer = '';
    const secretCode = 'graviton';
    
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      keyBuffer += e.key.toLowerCase();
      if (keyBuffer.length > secretCode.length) {
        keyBuffer = keyBuffer.slice(keyBuffer.length - secretCode.length);
      }
      
      if (keyBuffer === secretCode) {
        setIsVisible(true);
        keyBuffer = '';
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Print text sequence effect with variable delays for realism
  useEffect(() => {
    if (!isVisible) return;
    let isCancelled = false;

    const runTerminal = async () => {
      await new Promise(resolve => setTimeout(resolve, 10)); // Prevent synchronous state update
      setIsPurging(false);
      
      // Check if they are a logged-in participant (for CTF)
      let email = null;
      if (typeof window !== "undefined") {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (isLoggedIn) {
          email = localStorage.getItem("userEmail");
        }
      }
      
      const baseLines = [
        { text: "> OVERRIDING SYSTEM PROTOCOLS...", delay: 800 },
        { text: "> BYPASSING MAIN SECURITY GRID [OK]", delay: 500 },
        { text: "> ACCESSING REGISTRY DATABASE...", delay: 1200 },
        { text: "WARNING: UNAUTHORIZED ACCESS DETECTED.", delay: 400, type: "warn" },
        { text: " ", delay: 100 },
        { text: "> INITIATING ANTI-INTRUSION PROTOCOL...", delay: 1500, type: "warn" },
        { text: "> DELETING ALL USER REGISTRATIONS...", delay: 2000, type: "danger" },
        { text: "CRITICAL: DATA PURGE IN PROGRESS [||||||||||] 100%", delay: 100, type: "critical" },
        { text: " ", delay: 100 },
        { text: "FATAL ERROR: ALL SQUAD DATA HAS BEEN PERMANENTLY ERASED.", delay: 800, type: "danger" },
        { text: "RANBHOOMI '26 REGISTRATIONS ARE NOW CLOSED.", delay: 3500, type: "danger" },
        { text: "...", delay: 1500 },
        { text: "...", delay: 1500 },
        { text: "SYSTEM REBOOTING...", delay: 2000, clear: true }
      ];

      const endingLines = [
        { text: "> JUST KIDDING. GRAVITON CORE IS SECURE.", delay: 1500, type: "relief" },
        { text: email ? "MAIN FRAME BREACHED. TOP OPERATIVE STATUS CONFIRMED." : "NICE TRY, ROOKIE. ACCESS DENIED.", delay: 800, type: email ? "secret" : "warn" },
        { text: email ? "CYBER-ATTACK DASHBOARD THEME UNLOCKED." : "DISCONNECTING UNREGISTERED TERMINAL...", delay: 2000, type: "relief" },
        { text: " ", delay: 500 },
        { text: "> SYSTEM SHUTDOWN INITIATED...", delay: 1000 }
      ];

      const lines = [...baseLines, ...endingLines];
      
      for (let i = 0; i < lines.length; i++) {
        if (isCancelled) break;
        
        await new Promise(resolve => setTimeout(resolve, lines[i].delay));
        if (isCancelled) break;
        
        if (lines[i].type === "danger" || lines[i].type === "critical") {
            setIsPurging(true);
        } else if (lines[i].type === "relief") {
            setIsPurging(false);
        }

        if (lines[i].clear) {
          setSequence([]); // Clear the screen dramatically
        }

        setSequence(prev => [...prev, lines[i]]);
      }
      
      if (!isCancelled) {
        // Normal Easter Egg flow
        if (email) {
          // Log CTF completion to database
          fetch("/api/ctf-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
          }).catch(err => console.error("Failed to log CTF:", err));
          
          // Dispatch event for dashboard
          window.dispatchEvent(new Event("ctf-unlocked"));
        }
        
        setTimeout(() => {
          setIsVisible(false);
          setSequence([]);
          setIsPurging(false);
        }, 8000);
      }
    };
    
    runTerminal();
    
    return () => {
      isCancelled = true;
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[999] flex items-center justify-center pointer-events-auto transition-colors duration-200 ${isPurging ? 'bg-red-900/40 backdrop-blur-sm' : 'bg-black bg-opacity-90'}`}
        >
          {/* CRT Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-neon-cyan/5 to-transparent bg-[length:100%_4px] opacity-30"></div>
          
          <motion.div 
            animate={{ 
                x: isPurging ? [-5, 5, -5, 5, 0] : 0,
                y: isPurging ? [2, -2, 2, -2, 0] : 0
            }}
            transition={{ repeat: isPurging ? Infinity : 0, duration: 0.1 }}
            className={`w-full max-w-4xl h-[80vh] bg-black border p-8 overflow-hidden relative transition-all duration-300 ${
                isPurging ? 'border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.6)]' : 'border-neon-cyan shadow-[0_0_50px_rgba(0,229,255,0.2)]'
            }`}
          >
            {/* Flashing Red Overlay for Danger */}
            {isPurging && (
                <motion.div 
                    animate={{ opacity: [0, 0.2, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.5 }} 
                    className="absolute inset-0 bg-red-500 pointer-events-none"
                />
            )}

            <div className={`flex flex-col gap-4 font-mono text-sm md:text-lg tracking-widest relative z-10 ${isPurging ? 'text-red-500' : 'text-neon-cyan text-glow-cyan'}`}>
              {sequence.map((item, i) => {
                let textClass = "";
                if (item.type === "warn") textClass = "text-yellow-500 font-bold";
                if (item.type === "danger") textClass = "text-red-500 font-bold animate-pulse";
                if (item.type === "critical") textClass = "text-red-500 text-2xl md:text-4xl font-black bg-red-900/30 w-full p-2 uppercase";
                if (item.type === "secret") textClass = "text-electric-purple text-glow-purple font-black text-2xl";
                if (item.type === "relief") textClass = "text-white";

                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className={textClass}
                  >
                    {item.text}
                  </motion.div>
                );
              })}
              <motion.div 
                animate={{ opacity: [1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className={`w-4 h-6 mt-2 ${isPurging ? 'bg-red-500' : 'bg-neon-cyan'}`}
              ></motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
