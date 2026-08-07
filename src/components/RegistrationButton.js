"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Lock } from "lucide-react";

export default function RegistrationButton({ eventName, isCyan, cutCorners }) {
  const [isFrozen, setIsFrozen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSystemState = async () => {
      try {
        const res = await fetch("/api/system");
        const data = await res.json();
        if (data.success && data.config) {
          const isFrozenEvent = data.config.frozenEvents && data.config.frozenEvents.some(e => e.toUpperCase() === eventName.toUpperCase());
          if (data.config.isLockdown || isFrozenEvent) {
            setIsFrozen(true);
          }
        }
      } catch (err) {
        console.error("System state fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkSystemState();
  }, [eventName]);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center gap-2 w-full py-5 bg-white/20 text-gray-400 font-display font-black tracking-widest uppercase cursor-wait"
        style={cutCorners}
      >
        VERIFYING STATUS...
      </div>
    );
  }

  if (isFrozen) {
    return (
      <div 
        className="flex items-center justify-center gap-2 w-full py-5 bg-red-500/20 border border-red-500 text-red-500 font-display font-black tracking-widest uppercase cursor-not-allowed"
        style={cutCorners}
      >
        REGISTRATION FROZEN <Lock className="w-4 h-4" />
      </div>
    );
  }

  return (
    <Link 
      href={`/register?event=${encodeURIComponent(eventName)}`} 
      className={`flex items-center justify-center gap-2 w-full py-5 bg-white text-black font-display font-black tracking-widest uppercase transition-transform hover:scale-[1.02] active:scale-[0.98] ${isCyan ? 'hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]' : 'hover:shadow-[0_0_25px_rgba(138,43,226,0.5)]'}`}
      style={cutCorners}
    >
      INITIATE_REGISTRATION <Zap className="w-4 h-4 fill-black" />
    </Link>
  );
}
