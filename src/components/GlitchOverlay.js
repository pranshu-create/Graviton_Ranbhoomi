"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Skull } from "lucide-react";

export default function GlitchOverlay() {
  const audioContext = useRef(null);

  useEffect(() => {
    // Generate static noise using Web Audio API
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext.current = new AudioContext();
      
      const bufferSize = audioContext.current.sampleRate * 2; // 2 seconds of noise
      const buffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate);
      const output = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioContext.current.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      // Filter for radio static effect
      const filter = audioContext.current.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      
      // Volume
      const gainNode = audioContext.current.createGain();
      gainNode.gain.value = 0.2;
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      noise.start();
      
      return () => {
        noise.stop();
        if (audioContext.current?.state !== 'closed') {
          audioContext.current?.close();
        }
      };
    } catch (err) {
      console.log("Web Audio API not supported or blocked");
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-red-900/40 mix-blend-color-burn"
    >
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
      
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-50 z-20 animate-glitch-anim"></div>
      
      {/* Glitch text */}
      <motion.div
        animate={{ 
          x: [-5, 5, -5, 5, 0],
          opacity: [1, 0.8, 1, 0.5, 1] 
        }}
        transition={{ 
          repeat: Infinity,
          repeatType: "mirror",
          duration: 0.2
        }}
        className="relative z-30 text-center space-y-6"
      >
        <div className="flex justify-center">
          <Skull className="w-32 h-32 text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
        </div>
        <h1 className="font-display font-black text-6xl md:text-8xl text-red-500 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(239,68,68,1)]">
          ACCESS <span className="text-white mix-blend-overlay">REVOKED</span>
        </h1>
        <p className="font-mono text-xl text-white tracking-[0.5em] bg-red-600 inline-block px-4 py-1">
          FATAL: OPERATIVE DISQUALIFIED
        </p>
      </motion.div>
    </motion.div>
  );
}
