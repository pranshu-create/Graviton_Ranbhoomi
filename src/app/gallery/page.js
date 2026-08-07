"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlitchText from "@/components/GlitchText";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { X, ZoomIn, Shield, Clock, FileText, Tag } from "lucide-react";

const OPERATIONS = ["ALL", "ROBO RACE", "ROBO SUMO", "LINE FOLLOWER", "BEHIND THE SCENES", "CEREMONY"];

const galleryData = [
  {
    id: "RBM-2024-0001",
    src: "/gallery_robo_race.png",
    operation: "ROBO RACE",
    subject: "High-speed bot navigating obstacle course — Section 4-B",
    clearance: "OPERATOR",
    classification: "DECLASSIFIED",
    date: "2024-NOV-14",
    location: "ARENA ALPHA",
    photographer: "FIELD_AGENT_07",
  },
  {
    id: "RBM-2024-0012",
    src: "/gallery_robo_sumo.png",
    operation: "ROBO SUMO",
    subject: "Combat engagement — Unit IRON-HAWK vs. Unit PROMETHEUS",
    clearance: "OPERATOR",
    classification: "DECLASSIFIED",
    date: "2024-NOV-15",
    location: "ARENA BETA",
    photographer: "FIELD_AGENT_12",
  },
  {
    id: "RBM-2024-0023",
    src: "/gallery_line_follower.png",
    operation: "LINE FOLLOWER",
    subject: "Autonomous unit executing precision path — Junction 7",
    clearance: "OPERATOR",
    classification: "DECLASSIFIED",
    date: "2024-NOV-14",
    location: "TRACK GAMMA",
    photographer: "FIELD_AGENT_03",
  },
  {
    id: "RBM-2024-0031",
    src: "/gallery_behind_scenes.png",
    operation: "BEHIND THE SCENES",
    subject: "Field operatives conducting final hardware diagnostics",
    clearance: "OPERATOR",
    classification: "DECLASSIFIED",
    date: "2024-NOV-13",
    location: "COMMAND LAB",
    photographer: "FIELD_AGENT_01",
  },
  {
    id: "RBM-2024-0044",
    src: "/gallery_crowd_energy.png",
    operation: "BEHIND THE SCENES",
    subject: "Mass civilian attendance — Peak engagement recorded",
    clearance: "OPERATOR",
    classification: "DECLASSIFIED",
    date: "2024-NOV-15",
    location: "MAIN STAGE",
    photographer: "FIELD_AGENT_09",
  },
  {
    id: "RBM-2024-0058",
    src: "/gallery_trophy_ceremony.png",
    operation: "CEREMONY",
    subject: "Honours Distribution — Top operatives commended",
    clearance: "OPERATOR",
    classification: "DECLASSIFIED",
    date: "2024-NOV-15",
    location: "MAIN STAGE",
    photographer: "FIELD_AGENT_07",
  },
];

function ClassifiedCard({ photo, index, onOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.innerWidth < 768
      );
    };
    setTimeout(checkTouch, 0);
  }, []);

  useEffect(() => {
    if (isTouchDevice) {
      const scanTimer = setTimeout(() => {
        setIsScanning(true);
        const completeTimer = setTimeout(() => {
          setScanComplete(true);
          setIsScanning(false);
          setIsHovered(true);
        }, 850);
        return () => clearTimeout(completeTimer);
      }, index * 180);
      return () => clearTimeout(scanTimer);
    }
  }, [isTouchDevice, index]);

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice) return;
    setIsHovered(true);
    setIsScanning(true);
    setScanComplete(false);
    const timer = setTimeout(() => {
      setScanComplete(true);
      setIsScanning(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    if (isTouchDevice) return;
    setIsHovered(false);
    setScanComplete(false);
    setIsScanning(false);
  }, [isTouchDevice]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.08 }}
      className="relative group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpen(photo)}
    >
      {/* Card Container */}
      <div className="relative overflow-hidden bg-black border border-white/10 transition-all duration-500"
        style={{
          clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
          boxShadow: isHovered ? "0 0 30px rgba(77,184,255,0.25), inset 0 0 20px rgba(77,184,255,0.05)" : "none",
          borderColor: isHovered ? "rgba(77,184,255,0.5)" : "rgba(255,255,255,0.08)",
        }}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <img
            src={photo.src}
            alt={photo.subject}
            className="w-full h-full object-cover transition-all duration-700"
            style={{
              filter: isHovered
                ? scanComplete ? "grayscale(0%) brightness(1) contrast(1)" : "grayscale(40%) brightness(0.7) contrast(1.2)"
                : "grayscale(100%) brightness(0.4) contrast(1.4) sepia(30%)",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />

          {/* Noise/Static Overlay — fades on declassify */}
          <div
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
            style={{
              opacity: scanComplete ? 0 : isHovered ? 0.3 : 0.75,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "150px 150px",
              mixBlendMode: "overlay",
            }}
          />

          {/* Scan Line */}
          {isScanning && (
            <motion.div
              className="absolute left-0 w-full h-1 pointer-events-none z-20"
              style={{ background: "linear-gradient(90deg, transparent, rgba(77,184,255,0.9), transparent)", boxShadow: "0 0 20px rgba(77,184,255,0.8)" }}
              initial={{ top: "-2px" }}
              animate={{ top: "102%" }}
              transition={{ duration: 0.85, ease: "linear" }}
            />
          )}

          {/* CLASSIFIED Stamp — shown when not hovered */}
          <AnimatePresence>
            {!isHovered && (
              <motion.div
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div
                  className="border-4 border-red-600 px-4 py-2 rotate-[-15deg]"
                  style={{ boxShadow: "0 0 20px rgba(220,38,38,0.5)" }}
                >
                  <p className="font-display font-black text-red-600 text-xl tracking-[0.4em] uppercase"
                    style={{ textShadow: "0 0 10px rgba(220,38,38,0.8)" }}
                  >
                    CLASSIFIED
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DECLASSIFIED Stamp — shown when scan complete */}
          <AnimatePresence>
            {scanComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 1.4, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute top-3 right-3 pointer-events-none"
              >
                <div
                  className="border-2 border-green-400 px-3 py-1"
                  style={{ boxShadow: "0 0 15px rgba(74,222,128,0.6)" }}
                >
                  <p className="font-display font-bold text-green-400 text-[10px] tracking-[0.3em]"
                    style={{ textShadow: "0 0 8px rgba(74,222,128,0.8)" }}
                  >
                    DECLASSIFIED ✓
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hover gradient overlay with metadata */}
          <AnimatePresence>
            {scanComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)" }}
              >
                <div className="p-3">
                  <p className="font-mono text-[9px] text-neon-cyan tracking-widest mb-1">&gt; {photo.operation}</p>
                  <p className="font-mono text-[10px] text-white/80 leading-tight truncate">{photo.subject}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom icon */}
          <AnimatePresence>
            {scanComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 left-3 w-8 h-8 bg-black/70 border border-neon-cyan/50 flex items-center justify-center pointer-events-none"
              >
                <ZoomIn className="w-4 h-4 text-neon-cyan" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Footer */}
        <div className="px-3 py-2 border-t border-white/5 flex justify-between items-center">
          <span className="font-mono text-[9px] text-gray-500 tracking-widest">{photo.id}</span>
          <span className="font-mono text-[9px] text-gray-600">{photo.date}</span>
        </div>
      </div>
    </motion.div>
  );
}

function LightboxViewer({ photo, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const rows = [
    { label: "FILE_ID", value: photo.id },
    { label: "OPERATION", value: photo.operation },
    { label: "DATE", value: photo.date },
    { label: "LOCATION", value: photo.location },
    { label: "PHOTOGRAPHER", value: photo.photographer },
    { label: "CLEARANCE", value: photo.clearance },
    { label: "STATUS", value: "DECLASSIFIED" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full max-w-5xl bg-[#080c10] border border-neon-cyan/30 overflow-hidden relative"
        style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-neon-cyan/20 bg-black/60">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="font-mono text-xs text-green-400 tracking-[0.3em] uppercase">EVIDENCE DOSSIER — {photo.id}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row">
          {/* Image Side */}
          <div className="flex-1 relative bg-black">
            <img src={photo.src} alt={photo.subject} className="w-full h-full object-cover max-h-[40vh] md:max-h-[none]" />
            {/* Corner marks */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-neon-cyan/70 pointer-events-none" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-neon-cyan/70 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-neon-cyan/70 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-neon-cyan/70 pointer-events-none" />
            {/* Declassified stamp on lightbox */}
            <div className="absolute top-4 right-4 border-2 border-green-400 px-3 py-1 rotate-[-12deg]"
              style={{ boxShadow: "0 0 15px rgba(74,222,128,0.5)" }}>
              <p className="font-display font-bold text-green-400 text-xs tracking-[0.3em]">DECLASSIFIED ✓</p>
            </div>
          </div>

          {/* Metadata Side */}
          <div className="md:w-64 lg:w-80 border-t md:border-t-0 md:border-l border-neon-cyan/10 flex flex-col">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="font-mono text-[9px] text-gray-500 tracking-widest mb-2 uppercase">Subject Description</p>
              <p className="font-mono text-xs text-gray-200 leading-relaxed">{photo.subject}</p>
            </div>
            <div className="flex-1 divide-y divide-white/5">
              {rows.map((row) => (
                <div key={row.label} className="px-5 py-3 flex justify-between items-center gap-4">
                  <span className="font-mono text-[9px] text-gray-500 tracking-widest whitespace-nowrap">{row.label}</span>
                  <span className={`font-mono text-[10px] font-bold truncate ${
                    row.label === "STATUS" ? "text-green-400" :
                    row.label === "CLEARANCE" ? "text-neon-cyan" :
                    row.label === "OPERATION" ? "text-electric-purple" : "text-white"
                  }`}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-white/5">
              <p className="font-mono text-[9px] text-gray-600 leading-relaxed">
                &gt; GRAVITON ROBOTICS INTEL ARCHIVE<br />
                &gt; AUTHORIZED ACCESS ONLY<br />
                &gt; RANBHOOMI 2.0 OPERATIVE CLEARANCE
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [terminalLines, setTerminalLines] = useState([]);

  const filtered = activeFilter === "ALL"
    ? galleryData
    : galleryData.filter(p => p.operation === activeFilter);

  useEffect(() => {
    const lines = [
      "> CONNECTING TO GRAVITON SECURE ARCHIVE...",
      "> VERIFYING OPERATIVE CLEARANCE...",
      "> CLEARANCE CONFIRMED: OPERATOR LEVEL",
      "> LOADING CLASSIFIED INTEL FILES...",
      `> ${galleryData.length} FILES RETRIEVED. READY FOR REVIEW.`,
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setTerminalLines(prev => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-neon-cyan/10 -z-10" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.5em] mb-4"
          >
            GRAVITON ROBOTICS — INTEL DIVISION
          </motion.p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white mb-4 bg-background inline-block px-8 tracking-tighter">
            DECLASSIFIED&nbsp;
            <GlitchText text="ARCHIVES" className="text-neon-cyan text-glow-cyan" />
          </h1>
          <p className="font-mono text-xs text-gray-400 max-w-xl mx-auto uppercase tracking-[0.3em]">
            &gt; SECURITY CLEARANCE: OPERATOR &nbsp;|&nbsp; HOVER TO DECLASSIFY
          </p>
        </div>

        {/* Terminal Boot Sequence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-12 bg-black/80 border border-neon-cyan/20 p-4"
          style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
        >
          {terminalLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`font-mono text-[11px] leading-relaxed ${i === terminalLines.length - 1 ? "text-green-400" : "text-gray-500"}`}
            >
              {line}
              {i === terminalLines.length - 1 && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="text-neon-cyan"
                > _</motion.span>
              )}
            </motion.p>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto md:flex-wrap gap-2 mb-10 justify-start md:justify-center scrollbar-hide px-4 -mx-4 pb-2">
          {OPERATIONS.map((op) => (
            <button
              key={op}
              onClick={() => setActiveFilter(op)}
              className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 transition-all duration-300 border ${
                activeFilter === op
                  ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10"
                  : "border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300"
              }`}
              style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
            >
              {op === "ALL" ? `ALL FILES (${galleryData.length})` : op}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((photo, i) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ClassifiedCard photo={photo} index={i} onOpen={setSelectedPhoto} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Upload CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center border border-dashed border-white/10 p-10"
          style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
        >
          <FileText className="w-8 h-8 text-gray-600 mx-auto mb-4" />
          <p className="font-mono text-sm text-gray-500 uppercase tracking-widest mb-2">SUBMIT FIELD INTEL</p>
          <p className="font-mono text-[11px] text-gray-600 max-w-md mx-auto">
            Are you a field operative with uncatalogued mission photography? Contact the Intel Division to submit your files for archival and declassification.
          </p>
          <a
            href="mailto:gravitonroboticsidr@gmail.com?subject=Gallery Submission — RANBHOOMI Archive"
            className="inline-block mt-6 font-mono text-xs text-neon-cyan border border-neon-cyan/50 px-6 py-2 hover:bg-neon-cyan/10 transition-colors tracking-widest"
            style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
          >
            &gt; TRANSMIT FILES
          </a>
        </motion.div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <LightboxViewer photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
