"use client";

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AmbientPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        if (audioRef.current) {
          audioRef.current.volume = 0.3; // Default to 30% volume
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(e => console.log("Audio play failed pending interaction", e));
        }
      }
    };

    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, [hasInteracted]);

  const toggleMute = (e) => {
    e.stopPropagation(); // Prevent triggering the global interaction listener
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio 
        ref={audioRef}
        src="/bg-audio.mp3" 
        loop 
        preload="auto"
      />
      {/* Mute/Unmute Toggle Button */}
      <button 
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-[999] p-3 rounded-full bg-[#050B14]/80 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all backdrop-blur-md cursor-pointer"
        title={isPlaying ? "Mute Background Audio" : "Play Background Audio"}
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </>
  );
}
