"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, Trophy, Wrench } from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";
import { usePathname } from "next/navigation";
import GlitchText from "./GlitchText";

export default function GodModeListener() {
  const pathname = usePathname();
  const isAdminPage = pathname && (pathname.startsWith("/super-admin") || pathname.startsWith("/admin"));

  const [eventData, setEventData] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // Fetch initial config on mount
  useEffect(() => {
    if (isAdminPage) return;
    fetch("/api/system")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config && data.config.isMaintenanceMode) {
          setEventData({ type: "MAINTENANCE" });
        }
      })
      .catch(console.error);
  }, [isAdminPage]);

  useEffect(() => {
    if (isAdminPage) return;
    let channel;
    let pusherClient;

    const handleGodMode = (data) => {
      console.log("GOD MODE TRIGGERED:", data);
      
      if (data.type === "FLASH") {
        setEventData(data);
        setTimeout(() => setEventData(null), 3000); // Flash for 3 seconds
      } 
      else if (data.type === "CUSTOM_ALERT") {
        setEventData(data);
        setTimeout(() => setEventData(null), 10000); // Alert for 10 seconds
      }
      else if (data.type === "PURGE") {
        setEventData(data);
        setTimeout(() => setEventData(null), 8000);
      }
      else if (data.type === "MAINTENANCE") {
        setEventData(data);
        // Maintenance persists, so no timeout
      }
      else if (data.type === "WINNER_REVEAL") {
        setEventData(data);
        setTimeout(() => setEventData(null), 15000); // 15s display
      }
      else if (data.type === "COUNTDOWN") {
        const minutes = data.payload.minutes || 10;
        setCountdown({
          title: data.payload.title || "SYSTEM SHUTDOWN IN",
          endTime: Date.now() + minutes * 60 * 1000
        });
      }
    };

    const handleSystemUpdate = (config) => {
      if (config.isMaintenanceMode !== undefined) {
        setEventData(config.isMaintenanceMode ? { type: "MAINTENANCE" } : null);
      }
    };

    const setupPusher = async () => {
      pusherClient = await getPusherClient();
      if (!pusherClient) return;

      channel = pusherClient.subscribe("god-mode-channel");
      channel.bind("god-mode-event", handleGodMode);
      channel.bind("system-update", handleSystemUpdate);
    };

    setupPusher();

    return () => {
      if (channel) {
        channel.unbind("god-mode-event", handleGodMode);
        channel.unbind("system-update", handleSystemUpdate);
      }
    };
  }, [isAdminPage]);

  // Timer loop for countdown
  const [timeLeft, setTimeLeft] = useState("00:00.00");
  useEffect(() => {
    if (isAdminPage || !countdown) return;

    const interval = setInterval(() => {
      const remaining = countdown.endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(null);
        return;
      }

      const mins = Math.floor(remaining / 60000).toString().padStart(2, '0');
      const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
      const ms = Math.floor((remaining % 1000) / 10).toString().padStart(2, '0');
      setTimeLeft(`${mins}:${secs}.${ms}`);
    }, 50);

    return () => clearInterval(interval);
  }, [isAdminPage, countdown]);

  const extremeCut = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {/* FLASH EFFECT */}
        {eventData?.type === "FLASH" && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: [0, 1, 0, 0.8, 0] }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 3, times: [0, 0.1, 0.2, 0.5, 1] }}
            className={`fixed inset-0 z-[9999] pointer-events-none bg-${eventData.payload.color || 'red'}-600 mix-blend-overlay`}
          />
        )}

        {/* CUSTOM ALERT */}
        {eventData?.type === "CUSTOM_ALERT" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="bg-red-950/80 border-2 border-red-500 p-10 max-w-2xl w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.5)] relative overflow-hidden" style={extremeCut}>
              <motion.div 
                animate={{ y: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="absolute inset-0 bg-red-500/10"
              />
              <ShieldAlert className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-black text-red-500 mb-4 tracking-widest uppercase"><GlitchText text="SYSTEM OVERRIDE" /></h1>
              <p className="text-xl text-white font-mono uppercase tracking-widest">{eventData.payload.message}</p>
            </div>
          </motion.div>
        )}

        {/* PURGE EFFECT */}
        {eventData?.type === "PURGE" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-red-950/90 flex flex-col items-center justify-center"
          >
            <h1 className="text-8xl font-black text-red-600 animate-pulse tracking-tighter"><GlitchText text="PURGING DATA" /></h1>
            <div className="w-full max-w-4xl h-4 border border-red-500 mt-10">
               <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 7, ease: "linear" }}
                  className="h-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]"
               />
            </div>
          </motion.div>
        )}

        {/* MAINTENANCE MODE */}
        {eventData?.type === "MAINTENANCE" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center pointer-events-auto"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,165,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            <div className="text-center border-4 border-orange-500 bg-orange-950/20 p-16 max-w-3xl relative overflow-hidden" style={extremeCut}>
              <div className="absolute inset-0 bg-[url('/noise.png')] mix-blend-overlay opacity-30"></div>
              <Wrench className="w-32 h-32 text-orange-500 mx-auto mb-8 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-black text-orange-500 tracking-widest uppercase mb-4">SYSTEM MAINTENANCE</h1>
              <p className="text-xl text-orange-300 font-mono uppercase tracking-widest">
                Graviton Engineering Division is currently performing critical upgrades.
              </p>
              <p className="text-sm text-gray-500 font-mono mt-8">PLEASE STAND BY</p>
            </div>
          </motion.div>
        )}

        {/* WINNER REVEAL */}
        {eventData?.type === "WINNER_REVEAL" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-transparent"></div>
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-center z-10"
            >
              <Trophy className="w-40 h-40 text-yellow-500 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] animate-pulse" />
              <p className="text-yellow-400 font-mono uppercase tracking-[0.4em] mb-4 text-xl md:text-2xl">CHAMPIONS OF {eventData.payload.event}</p>
              <h1 className="text-6xl md:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] uppercase">
                {eventData.payload.team}
              </h1>
              <div className="mt-8 border border-yellow-500/50 bg-yellow-500/10 px-8 py-3 inline-block">
                <span className="text-yellow-500 font-mono tracking-widest uppercase text-sm">GLORY IN THE ARENA</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* GLOBAL COUNTDOWN */}
        {countdown && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9998] flex justify-center pointer-events-none mt-20"
          >
            <div className="bg-black/90 border-b-2 border-x-2 border-red-500 px-8 py-4 shadow-[0_10px_50px_rgba(239,68,68,0.3)] backdrop-blur-md flex flex-col items-center">
              <span className="text-[10px] text-red-400 font-mono uppercase tracking-[0.3em] font-bold mb-1 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 animate-pulse" /> {countdown.title}
              </span>
              <span className="font-display font-black text-4xl md:text-5xl text-red-500 tracking-widest tabular-nums">
                {timeLeft}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
