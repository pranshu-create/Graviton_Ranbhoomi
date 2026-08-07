"use client";

import { useEffect, useState } from "react";
import HackMinigame from "./HackMinigame";

export default function HackMinigameListener() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Sequence: up up down down
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];
    let konamiIndex = 0;

    const handleKeyDown = (e) => {
      if (isOpen) return; // Don't listen if it's already open

      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setIsOpen(true);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return isOpen ? <HackMinigame onClose={() => setIsOpen(false)} /> : null;
}
