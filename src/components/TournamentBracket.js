"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Zap, X, AlertCircle } from "lucide-react";

export default function TournamentBracket({ matches = [], eventName = "" }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [connections, setConnections] = useState([]);
  const containerRef = useRef(null);

  // Group and sort matches by rounds
  const roundsMap = {};
  matches.forEach((m) => {
    if (!roundsMap[m.round]) roundsMap[m.round] = [];
    roundsMap[m.round].push(m);
  });

  // Sort matches within each round by match ID
  Object.keys(roundsMap).forEach((r) => {
    roundsMap[r].sort((a, b) => a.matchId.localeCompare(b.matchId));
  });

  const roundOrder = [
    "Round One",
    "Round 1",
    "Round Two",
    "Round 2",
    "Round Three",
    "Round 3",
    "Round Four",
    "Round 4",
    "Quarter Finals",
    "Semi Finals",
    "Finals",
    "Grand Finals",
  ];

  const sortedRoundNames = Object.keys(roundsMap).sort((a, b) => {
    const idxA = roundOrder.findIndex((r) => a.toLowerCase().includes(r.toLowerCase()));
    const idxB = roundOrder.findIndex((r) => b.toLowerCase().includes(r.toLowerCase()));
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const rounds = sortedRoundNames.map((name) => ({
    name,
    matches: roundsMap[name],
  }));

  const updatePaths = () => {
    if (!containerRef.current || rounds.length < 2) {
      setConnections([]);
      return;
    }
    const newConnections = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    for (let rIdx = 0; rIdx < rounds.length - 1; rIdx++) {
      const currentMatches = rounds[rIdx].matches;
      const nextMatches = rounds[rIdx + 1].matches;

      currentMatches.forEach((match, mIdx) => {
        let nextMatchIdx = -1;

        // 1. Try to find match in next round by matching winner team ID
        if (match.winnerId) {
          nextMatchIdx = nextMatches.findIndex(
            (nm) => nm.team1?.id === match.winnerId || nm.team2?.id === match.winnerId
          );
        }

        // 2. Fallback to index-based connection
        if (nextMatchIdx === -1) {
          nextMatchIdx = Math.floor(mIdx / 2);
        }

        if (nextMatchIdx >= 0 && nextMatchIdx < nextMatches.length) {
          const nextMatch = nextMatches[nextMatchIdx];
          const startEl = document.getElementById(`match-node-${match.matchId}`);
          const endEl = document.getElementById(`match-node-${nextMatch.matchId}`);

          if (startEl && endEl) {
            const startRect = startEl.getBoundingClientRect();
            const endRect = endEl.getBoundingClientRect();

            const x1 = startRect.right - containerRect.left;
            const y1 = startRect.top + startRect.height / 2 - containerRect.top;

            const x2 = endRect.left - containerRect.left;
            const y2 = endRect.top + endRect.height / 2 - containerRect.top;

            const isWinnerPropagated = match.winnerId &&
              (nextMatch.team1?.id === match.winnerId || nextMatch.team2?.id === match.winnerId);

            newConnections.push({
              id: `${match.matchId}-${nextMatch.matchId}`,
              x1,
              y1,
              x2,
              y2,
              isHighlighted: !!isWinnerPropagated,
              isLive: match.status === "LIVE",
            });
          }
        }
      });
    }
    setConnections(newConnections);
  };

  useEffect(() => {
    updatePaths();
    
    // Set up MutationObserver to detect layout changes
    const observer = new MutationObserver(updatePaths);
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    window.addEventListener("resize", updatePaths);
    
    // Polling layout updates for safe alignment
    const interval = setInterval(updatePaths, 1000);

    return () => {
      window.removeEventListener("resize", updatePaths);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="text-center py-20 bg-black/40 border border-white/5 rounded-lg relative overflow-hidden" style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(184,41,234,0.01)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
        <p className="font-mono text-sm text-gray-500 uppercase tracking-widest">[ AWAITING MATCH SCHEDULING FROM HQ ]</p>
      </div>
    );
  }

  return (
    <div className="w-full relative mt-6 select-none">
      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className="w-full overflow-x-auto pb-10 pt-4 flex gap-12 min-w-full relative scrollbar-thin scrollbar-thumb-neon-cyan/20 scrollbar-track-transparent"
        style={{ minHeight: "500px" }}
      >
        {/* SVG Connector overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#66fcf1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b829ea" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {connections.map((c) => {
            // Cubic bezier curve path
            const midX = (c.x1 + c.x2) / 2;
            const pathD = `M ${c.x1} ${c.y1} C ${midX} ${c.y1}, ${midX} ${c.y2}, ${c.x2} ${c.y2}`;

            return (
              <path
                key={c.id}
                d={pathD}
                fill="none"
                stroke={c.isHighlighted ? "url(#cyanGradient)" : "rgba(255, 255, 255, 0.08)"}
                strokeWidth={c.isHighlighted ? 3 : 1.5}
                filter={c.isHighlighted ? "url(#glow)" : undefined}
                className={`transition-all duration-500 ${c.isLive ? "stroke-red-500/60" : ""}`}
                strokeDasharray={c.isLive ? "6, 4" : undefined}
                style={{
                  strokeDashoffset: c.isLive ? 100 : undefined,
                  animation: c.isLive ? "dash 5s linear infinite" : undefined,
                }}
              />
            );
          })}
        </svg>

        {/* Render Columns per Round */}
        {rounds.map((round, rIdx) => (
          <div 
            key={round.name} 
            className="flex flex-col justify-around gap-8 min-w-[260px] md:min-w-[280px] shrink-0 z-10 relative"
          >
            {/* Round Title */}
            <div className="text-center border-b border-white/10 pb-2 mb-4 bg-black/40 backdrop-blur-sm sticky top-0 py-1">
              <span className="font-mono text-xs font-bold text-neon-cyan tracking-[0.2em] uppercase">{round.name}</span>
            </div>

            {/* Matches list */}
            {round.matches.map((match) => {
              const isLive = match.status === "LIVE";
              const isCompleted = match.status === "COMPLETED";
              const team1Winner = isCompleted && match.winnerId === match.team1?.id;
              const team2Winner = isCompleted && match.winnerId === match.team2?.id;

              return (
                <div
                  key={match.matchId}
                  id={`match-node-${match.matchId}`}
                  onClick={() => setSelectedMatch(match)}
                  className={`bg-black/80 border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                    isLive
                      ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse"
                      : "border-white/10 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(102,252,241,0.15)]"
                  }`}
                  style={{
                    clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    minHeight: "115px",
                  }}
                >
                  {/* LIVE Scanline Overlay */}
                  {isLive && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.08)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none animate-scan"></div>
                  )}

                  {/* Top Bar inside Card */}
                  <div className="flex justify-between items-center border-b border-white/5 bg-white/2 px-3 py-1.5 font-mono text-[9px] tracking-wider text-gray-500 uppercase">
                    <span>MATCH {match.matchId}</span>
                    <span className={`px-1.5 py-0.5 border text-[8px] font-bold ${
                      isLive 
                        ? "border-red-500 text-red-500 bg-red-500/10 flex items-center gap-1" 
                        : isCompleted 
                          ? "border-green-500 text-green-500 bg-green-500/10" 
                          : "border-white/10 text-gray-500"
                    }`}>
                      {isLive && <Zap className="w-2 h-2 animate-bounce" />}
                      {match.status}
                    </span>
                  </div>

                  {/* Teams info */}
                  <div className="p-3 space-y-2.5 font-mono text-xs">
                    {/* Team 1 */}
                    <div className={`flex justify-between items-center px-2 py-1 rounded transition-colors ${
                      team1Winner 
                        ? "bg-green-500/10 border border-green-500/20" 
                        : isCompleted && match.team1?.id
                          ? "opacity-40"
                          : "bg-white/2"
                    }`}>
                      <div className="flex items-center gap-2 truncate pr-2">
                        <div className="w-1 h-3 bg-blue-500/80 shrink-0"></div>
                        <span className={`truncate uppercase tracking-wider font-bold ${team1Winner ? "text-green-400 text-glow-green" : "text-gray-300"}`}>
                          {match.team1?.name || "TBD"}
                        </span>
                      </div>
                      <span className={`font-bold ${team1Winner ? "text-green-400" : "text-white"}`}>
                        {!isCompleted && match.status === "UPCOMING" ? "-" : match.team1?.goals ?? 0}
                      </span>
                    </div>

                    {/* Team 2 */}
                    <div className={`flex justify-between items-center px-2 py-1 rounded transition-colors ${
                      team2Winner 
                        ? "bg-green-500/10 border border-green-500/20" 
                        : isCompleted && match.team2?.id
                          ? "opacity-40"
                          : "bg-white/2"
                    }`}>
                      <div className="flex items-center gap-2 truncate pr-2">
                        <div className="w-1 h-3 bg-red-500/80 shrink-0"></div>
                        <span className={`truncate uppercase tracking-wider font-bold ${team2Winner ? "text-green-400 text-glow-green" : "text-gray-300"}`}>
                          {match.team2?.name || "TBD"}
                        </span>
                      </div>
                      <span className={`font-bold ${team2Winner ? "text-green-400" : "text-white"}`}>
                        {!isCompleted && match.status === "UPCOMING" ? "-" : match.team2?.goals ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Styled Scanlines Animation */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>

      {/* Details HUD Overlay */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMatch(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-black border border-neon-cyan max-w-md w-full relative z-10 p-6 shadow-[0_0_50px_rgba(102,252,241,0.25)]"
              style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
            >
              <button 
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                <Award className="text-neon-cyan w-8 h-8" />
                <div>
                  <h3 className="font-display font-black text-xl text-white tracking-widest uppercase">MATCH SCHEDULING DETAILS</h3>
                  <p className="font-mono text-[10px] text-gray-500 tracking-wider">EVENT: {eventName.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-6 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4 border border-white/5 bg-white/2 p-3 text-[11px]">
                  <div>
                    <span className="text-gray-500 block uppercase">Match ID</span>
                    <span className="text-white font-bold">{selectedMatch.matchId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase">Round Stage</span>
                    <span className="text-neon-cyan font-bold uppercase">{selectedMatch.round}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase">Status</span>
                    <span className={`font-bold uppercase ${selectedMatch.status === "LIVE" ? "text-red-500" : selectedMatch.status === "COMPLETED" ? "text-green-500" : "text-gray-400"}`}>
                      {selectedMatch.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase">Bracket Side</span>
                    <span className="text-white uppercase">{selectedMatch.isLosersBracket ? "Losers Bracket" : "Winners Bracket"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2 text-[10px]">SCORING LOG</h4>
                  
                  {/* Team 1 Details Row */}
                  <div className="flex items-center justify-between bg-white/2 p-3 border border-white/5">
                    <span className="text-white font-bold uppercase truncate max-w-[200px]">{selectedMatch.team1?.name || "TBD"}</span>
                    <span className="text-neon-cyan text-lg font-bold">{selectedMatch.status !== "UPCOMING" ? selectedMatch.team1?.goals : "-"}</span>
                  </div>

                  {/* Team 2 Details Row */}
                  <div className="flex items-center justify-between bg-white/2 p-3 border border-white/5">
                    <span className="text-white font-bold uppercase truncate max-w-[200px]">{selectedMatch.team2?.name || "TBD"}</span>
                    <span className="text-neon-cyan text-lg font-bold">{selectedMatch.status !== "UPCOMING" ? selectedMatch.team2?.goals : "-"}</span>
                  </div>
                </div>

                {selectedMatch.penalties && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-yellow-500 uppercase tracking-widest text-[10px] mb-2">⚠️ TELEMETRY AND PENALTY NOTE</h4>
                    <p className="bg-yellow-500/10 border border-yellow-500/20 p-3 text-yellow-400 text-[11px] leading-relaxed">
                      {selectedMatch.penalties}
                    </p>
                  </div>
                )}

                {selectedMatch.winnerId && (
                  <div className="bg-green-500/10 border border-green-500/30 p-3 flex items-center justify-between text-green-400 text-[11px] tracking-wider font-bold">
                    <span>PROPAGATED WINNER:</span>
                    <span>
                      {selectedMatch.winnerId === selectedMatch.team1?.id ? selectedMatch.team1?.name : selectedMatch.team2?.name}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
