"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function GlitchText({ text, className }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className={isGlitching ? "opacity-0" : "opacity-100"}>{text}</span>
      
      {isGlitching && (
        <>
          <motion.span 
            className="absolute top-0 left-0 text-neon-cyan opacity-70"
            initial={{ x: -2, y: 1 }}
            animate={{ x: [2, -2, 3, -1], y: [-1, 2, -1, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            {text}
          </motion.span>
          <motion.span 
            className="absolute top-0 left-0 text-electric-purple opacity-70"
            initial={{ x: 2, y: -1 }}
            animate={{ x: [-2, 3, -1, 2], y: [1, -1, 2, -1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            {text}
          </motion.span>
        </>
      )}
    </div>
  );
}
