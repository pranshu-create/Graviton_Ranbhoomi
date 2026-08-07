"use client";

import { useEffect, useRef } from 'react';

export default function GenerativeAmbient() {
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const initAudio = () => {
      if (audioCtxRef.current) return; // Prevent multiple instances
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Master volume controller
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      // Fade in extremely slowly (10 seconds) so it's a very subtle entrance
      masterGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 10); 
      
      // Lowpass filter to muffle the sound and remove any harshness
      // This makes it sound like a deep space hum / cinematic pad
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350; // Cut off high frequencies for a warm sound

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Create a lush ambient pad using a C power chord (C2, G2, C3, G3)
      // These frequencies are mathematically very consonant and peaceful
      const frequencies = [65.41, 98.00, 130.81, 196.00];

      frequencies.forEach(freq => {
        // Oscillator 1
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;
        
        // Oscillator 2 (slightly detuned to create a slow, natural "beating" chorus effect)
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq + (Math.random() * 0.5 - 0.25);

        // Balance the volume so they combine nicely
        const oscGain = ctx.createGain();
        oscGain.gain.value = 1 / (frequencies.length * 2);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(masterGain);

        osc1.start();
        osc2.start();
      });

      // Remove the listener once audio has started
      window.removeEventListener('click', initAudio);
    };

    // The browser requires a user click to start audio
    window.addEventListener('click', initAudio);
    
    return () => {
      window.removeEventListener('click', initAudio);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return null;
}
