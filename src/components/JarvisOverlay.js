"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Terminal, Loader2, AlertTriangle, Check, Volume2, VolumeX } from "lucide-react";
import GlitchText from "./GlitchText";

export default function JarvisOverlay({
  isOpen,
  setIsOpen,
  systemContext,
  handlers
}) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jarvisResponse, setJarvisResponse] = useState("");
  const [logs, setLogs] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const micStreamRef = useRef(null);
  const clapTimestampsRef = useRef([]);
  const clapIntervalRef = useRef(null);
  const transcriptRef = useRef("");      // Tracks live transcript without stale closures
  const processCommandRef = useRef(null); // Ref to processCommand to avoid stale closures
  
  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          transcriptRef.current = currentTranscript; // Update ref immediately (no stale closure)
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          // Use ref to get fresh transcript value (avoids stale closure)
          const finalTranscript = transcriptRef.current.trim();
          if (finalTranscript.length > 0 && processCommandRef.current) {
            // Small delay to let React state settle
            setTimeout(() => {
              processCommandRef.current(finalTranscript);
              transcriptRef.current = "";
            }, 200);
          }
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setJarvisResponse("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [isListening]);

  const speak = useCallback((text) => {
    if (!soundEnabled) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      const ukVoice = voices.find(v => v.lang === "en-GB" && v.name.includes("Male"));
      if (ukVoice) utterance.voice = ukVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  }, [soundEnabled]);

  const addLog = useCallback((msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  }, []);

  const executeAction = useCallback(async (actionData) => {
    const { intent, params, narration } = actionData;
    
    setJarvisResponse(narration);
    speak(narration);
    addLog(`Executing Intent: ${intent}`);

    try {
      switch (intent) {
        case 'QUERY_STATS':
          addLog("System Status: Nominal.");
          break;
        case 'VERIFY_TEAM':
          if (params.teamName || params.teamId) {
             const target = systemContext.teams?.find(t => 
                t.id === params.teamId || 
                t.name?.toLowerCase() === params.teamName?.toLowerCase()
             );
             if (target && handlers.handleVerify) await handlers.handleVerify(target);
             else { setJarvisResponse("Team not found, Operative."); speak("Team not found, Operative."); }
          }
          break;
        case 'REJECT_TEAM':
          if (params.teamName || params.teamId) {
             const target = systemContext.teams?.find(t => 
                t.id === params.teamId || 
                t.name?.toLowerCase() === params.teamName?.toLowerCase()
             );
             if (target && handlers.handleReject) await handlers.handleReject(target);
          }
          break;
        case 'DISQUALIFY_TEAM':
          if (params.teamName || params.teamId) {
             const target = systemContext.teams?.find(t => 
                t.id === params.teamId || 
                t.name?.toLowerCase() === params.teamName?.toLowerCase()
             );
             if (target && handlers.handleDisqualify) await handlers.handleDisqualify(target);
          }
          break;
        case 'TOGGLE_LOCKDOWN':
          if (handlers.toggleLockdown) await handlers.toggleLockdown();
          break;
        case 'TOGGLE_MAINTENANCE':
          if (handlers.toggleMaintenanceMode) await handlers.toggleMaintenanceMode();
          break;
        case 'FREEZE_EVENT':
          if (params.eventName && handlers.handleToggleFreeze) await handlers.handleToggleFreeze(params.eventName.toUpperCase());
          break;
        case 'UNFREEZE_EVENT':
          if (params.eventName && handlers.handleToggleFreeze) await handlers.handleToggleFreeze(params.eventName.toUpperCase());
          break;
        case 'NAVIGATE_TAB':
          if (params.tabName && handlers.setActiveTab) {
              const tabMap = {
                  "database": "DATABASE", "scanner": "SCANNER", "arena": "ARENA",
                  "communications": "COMMS", "finances": "FINANCES", "ai screener": "AI_SCREENER",
                  "hostel": "HOSTEL"
              };
              const mappedTab = tabMap[params.tabName.toLowerCase()] || params.tabName.toUpperCase();
              handlers.setActiveTab(mappedTab);
              setTimeout(() => setIsOpen(false), 2000); // Auto close on navigate
          }
          break;
        case 'EXPORT_CSV':
          if (handlers.handleExportCSV) handlers.handleExportCSV();
          break;
        case 'TOGGLE_LEADERBOARD':
          if (handlers.toggleLeaderboard) await handlers.toggleLeaderboard();
          break;
        case 'SEND_BLAST':
            addLog("Navigate to Communications to send blasts.");
            break;
        case 'UNKNOWN':
            addLog("Awaiting further instructions.");
            break;
        default:
          addLog(`Action ${intent} triggered but not fully implemented yet.`);
      }
    } catch (e) {
      console.error(e);
      setJarvisResponse("Error executing action.");
      speak("An error occurred during execution.");
      addLog("ERROR: Execution failed.");
    }
  }, [speak, addLog, systemContext, handlers, setIsOpen]);

  const processCommand = useCallback(async (commandStr) => {
    setIsProcessing(true);
    setJarvisResponse("Processing...");
    addLog(`Sent command: "${commandStr}"`);
    
    try {
      const res = await fetch("/api/admin/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          command: commandStr,
          systemContext: {
              teamsCount: systemContext.teams?.length || 0,
              verifiedCount: systemContext.teams?.filter(t => t.status === "VERIFIED")?.length || 0,
              unverifiedCount: systemContext.teams?.filter(t => t.status !== "VERIFIED" && t.status !== "REJECTED" && t.status !== "DISQUALIFIED")?.length || 0,
              pendingCount: systemContext.teams?.filter(t => t.status === "PENDING" || t.status === "UNDER_REVIEW" || !t.status)?.length || 0,
              rejectedCount: systemContext.teams?.filter(t => t.status === "REJECTED")?.length || 0,
              disqualifiedCount: systemContext.teams?.filter(t => t.status === "DISQUALIFIED")?.length || 0,
              activeTab: systemContext.activeTab,
              isLockdown: systemContext.isLockdown,
              // Send first 5 team names for context
              recentTeams: systemContext.teams?.slice(0, 5).map(t => ({ name: t.teamName || t.name, status: t.status, event: t.event }))
          }
        })
      });
      
      const data = await res.json();
      
      if (data.requiresConfirmation) {
        setJarvisResponse(data.narration);
        speak(data.narration);
        setPendingAction(data);
      } else {
        await executeAction(data);
      }
      
    } catch (err) {
      console.error(err);
      setJarvisResponse("Connection to AI core failed.");
      speak("Connection to AI core failed.");
    } finally {
      setIsProcessing(false);
      setTranscript("");
    }
  }, [addLog, speak, systemContext, executeAction]);

  // Always keep the ref up-to-date so onend can call it without stale closure
  useEffect(() => {
    processCommandRef.current = processCommand;
  }, [processCommand]);

  // Fallback: also process via effect when transcript changes (typed input via keyboard)
  useEffect(() => {
      // Only for typed inputs (isListening will be false and won't trigger onend)
      // Speech input is handled directly by onend -> processCommandRef
  }, [isListening, transcript, isProcessing, pendingAction, processCommand]);

  // Clap Detection Logic (Background listening)
  useEffect(() => {
    let animationFrameId;

    const startClapDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;
        
        const source = audioCtx.createMediaStreamSource(stream);
        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzerRef.current = analyzer;

        const dataArray = new Uint8Array(analyzer.frequencyBinCount);

        const detectClaps = () => {
          if (!analyzerRef.current) return;
          analyzerRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const volume = sum / dataArray.length;

          // Threshold for a clap (adjust if needed)
          const CLAP_THRESHOLD = 130; 

          if (volume > CLAP_THRESHOLD) {
            const now = Date.now();
            const lastClap = clapTimestampsRef.current[clapTimestampsRef.current.length - 1] || 0;
            
            // Debounce claps (prevent one loud noise registering as multiple claps)
            if (now - lastClap > 300) {
              clapTimestampsRef.current.push(now);
              
              // Keep only claps from the last 1.5 seconds
              clapTimestampsRef.current = clapTimestampsRef.current.filter(time => now - time < 1500);

              // Two claps detected!
              if (clapTimestampsRef.current.length >= 2) {
                clapTimestampsRef.current = []; // reset
                if (!isOpen) {
                  setIsOpen(true);
                  // Optionally trigger listening immediately upon opening
                  setTimeout(() => toggleListening(), 500);
                }
              }
            }
          }

          animationFrameId = requestAnimationFrame(detectClaps);
        };

        detectClaps();
      } catch (err) {
        console.error("Clap detection mic access denied", err);
      }
    };

    startClapDetection();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isOpen, setIsOpen, toggleListening]);

  // Greeting on mount
  useEffect(() => {
     const hasGreeted = sessionStorage.getItem("jarvisGreeted");
     if (!hasGreeted) {
         sessionStorage.setItem("jarvisGreeted", "true");
         setTimeout(() => {
            speak("Welcome back, Commander. All systems are online.");
         }, 1000);
     }
  }, [speak]);

  // Wake word detection ("wake up jarvis")
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        let wakeWordRecognition = null;
        try {
           wakeWordRecognition = new SpeechRecognition();
           wakeWordRecognition.continuous = true;
           wakeWordRecognition.interimResults = true;
           wakeWordRecognition.lang = "en-US";
           
           wakeWordRecognition.onresult = (event) => {
             for (let i = event.resultIndex; i < event.results.length; ++i) {
               const transcriptChunk = event.results[i][0].transcript.toLowerCase();
               if (transcriptChunk.includes("wake up jarvis") || transcriptChunk.includes("wakeup jarvis") || transcriptChunk.includes("wake up, jarvis")) {
                  if (!isOpen) {
                     setIsOpen(true);
                     setTimeout(() => {
                         speak("Greetings Commander, JARVIS online and awaiting your command.");
                         toggleListening();
                     }, 800);
                  }
               }
             }
           };

           const startWakeWord = () => {
             if (!isOpen && wakeWordRecognition) {
                try { wakeWordRecognition.start(); } catch (e) {}
             }
           };
           
           // Start a bit after mount to avoid conflicts
           setTimeout(startWakeWord, 2000);

           wakeWordRecognition.onend = () => {
             if (!isOpen) {
                setTimeout(startWakeWord, 1000);
             }
           };
        } catch (err) {
           console.error("Wake word init error", err);
        }

        return () => {
          if (wakeWordRecognition) {
             wakeWordRecognition.onend = null; // Prevent restart loop on unmount
             try { wakeWordRecognition.stop(); } catch (e) {}
          }
        };
      }
    }
  }, [isOpen, setIsOpen, speak, toggleListening]);

  const confirmAction = useCallback(() => {
    if (pendingAction) {
      executeAction(pendingAction);
      setPendingAction(null);
    }
  }, [pendingAction, executeAction]);

  const cancelAction = useCallback(() => {
    setPendingAction(null);
    setJarvisResponse("Action cancelled, Operative.");
    speak("Action cancelled, Operative.");
    setTranscript("");
  }, [speak]);

  const handleManualSubmit = (e) => {
      e.preventDefault();
      if (transcript.trim()) {
          processCommand(transcript);
      }
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);


  const cutCorners = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed inset-0 z-[9999] bg-[#0B0C10]/95 backdrop-blur-2xl flex flex-col items-center justify-center font-mono overflow-hidden"
      >
        {/* Advanced Matrix Data Streams Background (Purple/Cyan) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 flex justify-between z-0">
            {Array.from({ length: 25 }).map((_, i) => (
               <motion.div 
                   key={i} 
                   className={`${i % 2 === 0 ? 'text-[#4DB8FF]' : 'text-[#B829EA]'} text-[10px] font-mono whitespace-pre w-4 text-center leading-none`}
                   animate={{ y: ["-100vh", "100vh"] }}
                   transition={{ repeat: Infinity, duration: (i * 3.7 % 5) + 10, ease: "linear", delay: -(i * 2.9 % 10) }}
               >
                   {Array.from({ length: 40 }).map((_, charIdx) => {
                     const charCode = (i * 7 + charIdx * 13) % 36;
                     return charCode.toString(36);
                   }).join('\n')}
               </motion.div>
            ))}
        </div>

        {/* Synthwave Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-15" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(77,184,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(184,41,234,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'bottom'
          }}
        ></div>

        {/* Scanlines & Vignette */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(77,184,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-0"></div>
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(11,12,16,1)] pointer-events-none z-0"></div>
        <motion.div 
            animate={{ y: ["-100%", "100%"] }} 
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }} 
            className="absolute left-0 right-0 h-1 shadow-[0_0_40px_rgba(184,41,234,0.6)] bg-gradient-to-r from-transparent via-[#B829EA] to-transparent z-0"
        ></motion.div>

        {/* Top Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
           <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-[#4DB8FF] hover:text-[#B829EA] transition-colors">
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
           </button>
           <button onClick={() => setIsOpen(false)} className="text-[#4DB8FF] hover:text-red-500 transition-colors flex items-center gap-2 border border-[#4DB8FF]/30 px-4 py-2 bg-[#1f2833]/50 backdrop-blur-md" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
              <X className="w-5 h-5" />
              <span className="text-xs tracking-widest uppercase font-bold">Close (ESC)</span>
           </button>
        </div>

        <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
            <Terminal className="w-6 h-6 text-[#B829EA]" />
            <span className="font-bold tracking-widest text-xl text-[#4DB8FF]"><GlitchText text="J.A.R.V.I.S. OVERWATCH" /></span>
        </div>

        {/* Central UI */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl px-4">
          
          {/* Synthwave AI Core */}
          <div className="relative w-64 h-64 mb-16 flex items-center justify-center perspective-1000">
            {/* Outer Rotating Ring */}
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="absolute inset-0 border-[1px] border-[#B829EA]/40 rounded-full"
                style={{ borderStyle: 'dashed', borderDasharray: '2 10' }}
            />
            {/* Middle Complex Ring */}
            <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute inset-4 border-4 border-t-[#4DB8FF] border-r-[#B829EA] border-b-transparent border-l-transparent rounded-full opacity-70"
            />
            {/* Middle Dashed Ring */}
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-8 border-[2px] border-dashed border-[#4DB8FF]/40 rounded-full"
            />
            {/* Inner Glowing Ring */}
            <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
                className="absolute inset-12 border-[1px] border-[#B829EA]/80 rounded-full shadow-[0_0_15px_rgba(184,41,234,0.5)_inset]"
            />
            
            {/* Core Energy Pulse */}
            {isListening ? (
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-14 bg-gradient-to-r from-[#4DB8FF]/40 to-[#B829EA]/40 rounded-full shadow-[0_0_80px_rgba(184,41,234,0.8)]"
                />
            ) : (
                <div className="absolute inset-14 bg-[#4DB8FF]/10 rounded-full shadow-[0_0_30px_rgba(77,184,255,0.4)]" />
            )}
            
            {/* Microphone Button */}
            <button 
                onClick={toggleListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-gradient-to-br from-[#4DB8FF] to-[#B829EA] text-white shadow-[0_0_50px_rgba(184,41,234,1)]' : 'bg-[#1f2833] border-2 border-[#4DB8FF] text-[#4DB8FF] hover:bg-[#4DB8FF]/20 hover:shadow-[0_0_25px_rgba(77,184,255,0.6)] hover:scale-105'}`}
            >
                <Mic className={`w-10 h-10 ${isListening ? 'animate-pulse text-white' : ''}`} />
            </button>
          </div>

          {/* Transcript & Response Area */}
          <div className="w-full max-w-3xl relative">
              {/* Synthwave Targeting Brackets */}
              <div className="absolute -left-6 top-0 bottom-0 w-8 border-l-4 border-y-4 border-[#B829EA]/50 opacity-70" style={{ borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem' }}></div>
              <div className="absolute -right-6 top-0 bottom-0 w-8 border-r-4 border-y-4 border-[#4DB8FF]/50 opacity-70" style={{ borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem' }}></div>
              
              <div className="bg-[#1f2833]/80 border border-[#B829EA]/30 p-8 relative backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 text-center space-y-6" style={cutCorners}>
                  {/* Status Overlay */}
                  <div className="text-xs uppercase tracking-[0.4em] text-[#B829EA] font-bold mb-4 flex items-center justify-center gap-2">
                      <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-[#4DB8FF]"></motion.div>
                      {isListening ? "AUDIO RECEPTORS ACTIVE" : isProcessing ? "ANALYZING NEURAL INPUT" : "SYSTEM IDLE // AWAITING COMMAND"}
                  </div>

                  {/* Transcript Form */}
                  <form onSubmit={handleManualSubmit} className="w-full flex justify-center relative">
                      <input 
                          type="text" 
                          value={transcript} 
                          onChange={(e) => setTranscript(e.target.value)}
                          placeholder="Speak or transmit command override..."
                          className="w-full text-center bg-transparent border-b border-[#4DB8FF]/30 focus:border-[#4DB8FF] focus:outline-none text-2xl font-light tracking-wider text-white placeholder-[#4DB8FF]/30 pb-2 transition-colors"
                      />
                  </form>

                  {/* Jarvis Response with typewriter feel */}
                  <AnimatePresence mode="wait">
                      {jarvisResponse && (
                          <motion.div 
                              key={jarvisResponse}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-[#4DB8FF] font-bold text-xl mt-6 border-t border-[#B829EA]/20 pt-6 tracking-wide drop-shadow-[0_0_8px_rgba(77,184,255,0.6)]"
                          >
                              <span className="text-[#B829EA] mr-2 text-sm tracking-widest">J.A.R.V.I.S //</span> 
                              {jarvisResponse}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </div>

          {/* Confirmation Box (High Threat Override) */}
          <AnimatePresence>
              {pendingAction && (
                  <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="mt-8 w-full max-w-2xl bg-red-950/90 border border-red-500 p-8 flex flex-col items-center shadow-[0_0_50px_rgba(239,68,68,0.4)] backdrop-blur-xl relative overflow-hidden"
                      style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
                  >
                      {/* Red Hazard Stripes */}
                      <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_20px)] pointer-events-none"></div>

                      <AlertTriangle className="w-14 h-14 text-red-500 mb-4 animate-pulse relative z-10" />
                      <h3 className="text-red-400 font-bold text-2xl uppercase tracking-[0.2em] mb-2 text-center relative z-10">Critical Override Required</h3>
                      <p className="text-red-200/90 text-sm text-center mb-8 max-w-lg relative z-10 tracking-wider">
                          WARNING: You are about to execute a destructive protocol. Double confirmation is mandatory to prevent accidental system wipe. Proceed?
                      </p>
                      
                      <div className="flex gap-6 w-full relative z-10">
                          <button onClick={confirmAction} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-4 uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.5)]" style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}>
                              <Check className="w-6 h-6" /> Execute Protocol
                          </button>
                          <button onClick={cancelAction} className="flex-1 bg-[#1f2833] border border-[#4DB8FF]/50 hover:bg-[#4DB8FF]/30 text-[#4DB8FF] font-bold py-4 uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-105" style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}>
                              <X className="w-6 h-6" /> Abort Sequence
                          </button>
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>

          {/* System Logs (Telemetry) */}
          <div className="mt-12 w-full max-w-3xl text-left border-l-4 border-[#B829EA]/50 pl-6 space-y-2 relative">
              <div className="absolute -left-2 top-0 w-3 h-3 bg-[#4DB8FF] rounded-full shadow-[0_0_10px_rgba(77,184,255,1)] animate-pulse"></div>
              {logs.map((log, i) => (
                  <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-sm font-mono uppercase tracking-[0.15em] ${i === 0 ? 'text-[#4DB8FF] font-bold drop-shadow-[0_0_5px_rgba(77,184,255,0.8)]' : 'text-[#B829EA]/80'}`}
                  >
                      <span className="opacity-50 mr-2 text-[#B829EA]">&gt;</span> {log}
                  </motion.div>
              ))}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
