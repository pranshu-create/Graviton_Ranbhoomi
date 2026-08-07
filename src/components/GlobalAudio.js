"use client";

import { useEffect } from 'react';
import { unlockAudio, playBackgroundSound } from '@/utils/audio';

export default function GlobalAudio() {
  useEffect(() => {
    // Unlock Web Audio API on first interaction anywhere
    const handleFirstInteraction = () => {
      unlockAudio();
      playBackgroundSound(); // Start continuous background drone
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return null;
}
