"use client";

import { useEffect, useState, Fragment } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TournamentBracket from "@/components/TournamentBracket";
import { getPusherClient } from "@/lib/pusherClient";
import GlitchText from "@/components/GlitchText";
import { Trophy, Clock, Download, AlertCircle, ShieldAlert, Cpu, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveScoringHub() {
  // Main tabs: BRACKETS | STANDINGS
  const [activeMainTab, setActiveMainTab] = useState("BRACKETS");
  
  // Sub-tabs
  const [bracketSubTab, setBracketSubTab] = useState("Robo Soccer");
  const [standingSubTab, setStandingSubTab] = useState("Robo Race");

  // Telemetry Standings data
  const [leaderboardTeams, setLeaderboardTeams] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // System Configuration (Brackets data & flags)
  const [systemBrackets, setSystemBrackets] = useState({});
  const [showRaceLeaderboard, setShowRaceLeaderboard] = useState(false);
  const [isLoadingSystem, setIsLoadingSystem] = useState(true);

  // User participant trials states (for locked leaderboard trials preview)
  const [userTeams, setUserTeams] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // General error/logs
  const [error, setError] = useState(null);

  // Fetch brackets from api/system
  const fetchSystemData = async () => {
    try {
      const res = await fetch("/api/system");
      const data = await res.json();
      if (data.success && data.config) {
        setSystemBrackets(data.config.brackets || {});
        setShowRaceLeaderboard(data.config.showRaceLeaderboard || false);
      } else {
        setError("Unable to resolve system configurations.");
      }
    } catch (err) {
      console.error("System fetch error:", err);
      setError("Failed to stream telemetry feed.");
    } finally {
      setIsLoadingSystem(false);
    }
  };

  // Fetch standings teams
  const fetchLeaderboardData = async (event) => {
    setIsLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/teams?event=${encodeURIComponent(event)}`);
      const data = await res.json();
      if (data.teams) {
        setLeaderboardTeams(data.teams);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Trigger initial loads
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSystemData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync standings on sub-tab switch
  useEffect(() => {
    if (activeMainTab === "STANDINGS") {
      const timer = setTimeout(() => {
        fetchLeaderboardData(standingSubTab);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeMainTab, standingSubTab]);

  // Fetch logged in user squads
  useEffect(() => {
    const checkUserStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const email = localStorage.getItem("userEmail");
      setIsUserLoggedIn(loggedIn && !!email);
      if (loggedIn && email) {
        setUserEmail(email);
        fetch(`/api/teams?email=${encodeURIComponent(email)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.teams) {
              setUserTeams(data.teams);
            }
          })
          .catch((err) => console.error("Error fetching user teams:", err));
      }
    };
    checkUserStatus();
  }, [standingSubTab, activeMainTab]);

  // Real-time synchronization via Pusher
  useEffect(() => {
    let pusherClient;
    let channel;

    const handleScoringUpdate = (data) => {
      console.log("Pusher scoring-update received:", data);
      // Re-fetch everything to guarantee state accuracy
      fetchSystemData();
      if (activeMainTab === "STANDINGS") {
        fetchLeaderboardData(standingSubTab);
      }
    };

    const setupPusher = async () => {
      try {
        pusherClient = await getPusherClient();
        if (!pusherClient) return;

        channel = pusherClient.subscribe("god-mode-channel");
        channel.bind("scoring-update", handleScoringUpdate);
        channel.bind("system-update", handleScoringUpdate);
      } catch (err) {
        console.error("Pusher setup error:", err);
      }
    };

    setupPusher();

    // Fallback Polling - Fetch data every 10 seconds in case websockets are blocked
    const pollInterval = setInterval(() => {
      fetchSystemData();
      if (activeMainTab === "STANDINGS") {
        fetchLeaderboardData(standingSubTab);
      }
    }, 10000);

    return () => {
      if (channel) {
        channel.unbind("scoring-update", handleScoringUpdate);
        channel.unbind("system-update", handleScoringUpdate);
      }
      clearInterval(pollInterval);
    };
  }, [activeMainTab, standingSubTab]);

  // Sorting and processing standings runs
  const getBestRunInfo = (team) => {
    const qualifiedRuns = team.runs?.filter((r) => r.status === "QUALIFIED") || [];
    if (qualifiedRuns.length === 0) {
      if (team.runs && team.runs.length > 0) {
        return { ...team.runs[0], isDsq: true };
      }
      return { totalTime: Infinity, initialTime: 0, penaltyTime: 0, driverName: "-", isNoRuns: true };
    }
    const sorted = [...qualifiedRuns].sort((a, b) => a.totalTime - b.totalTime);
    return sorted[0];
  };

  const sortedLeaderboard = [...leaderboardTeams].sort((a, b) => {
    const bestA = getBestRunInfo(a).totalTime;
    const bestB = getBestRunInfo(b).totalTime;
    if (bestA === Infinity && bestB === Infinity) return 0;
    if (bestA === Infinity) return 1;
    if (bestB === Infinity) return -1;
    return bestA - bestB;
  });

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-7xl mx-auto w-full min-h-screen relative">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(102,252,241,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

        <div className="text-center mb-12 relative z-10">
          <h1 className="font-display font-black text-4xl md:text-6xl text-white mb-3 uppercase tracking-tighter">
            LIVE <GlitchText text="STATS" className="text-neon-cyan text-glow-cyan" /> & <span className="text-electric-purple text-glow-purple">ARENA</span>
          </h1>
          <p className="font-mono text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            &gt; REAL-TIME TOURNAMENT AND TELEMETRY LOGS STREAM
          </p>
        </div>

        {/* MAIN NAVIGATION TABS */}
        <div className="flex justify-center border-b border-white/10 mb-8 relative z-10">
          <div className="flex space-x-2 md:space-x-4">
            {/* Brackets Tab Button */}
            <button
              onClick={() => setActiveMainTab("BRACKETS")}
              className={`px-6 py-3 font-display font-bold text-xs md:text-sm tracking-widest uppercase transition-all duration-300 relative ${
                activeMainTab === "BRACKETS"
                  ? "text-neon-cyan border-b-2 border-neon-cyan"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                TOURNAMENT BRACKETS
              </span>
            </button>

            {/* Standings Tab Button */}
            <button
              onClick={() => setActiveMainTab("STANDINGS")}
              className={`px-6 py-3 font-display font-bold text-xs md:text-sm tracking-widest uppercase transition-all duration-300 relative ${
                activeMainTab === "STANDINGS"
                  ? "text-neon-cyan border-b-2 border-neon-cyan"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                TELEMETRY STANDINGS
              </span>
            </button>
          </div>
        </div>

        {/* CONTENT PANELS */}
        <div className="relative z-10">
          {isLoadingSystem ? (
            <div className="flex flex-col justify-center items-center py-20 font-mono text-xs text-gray-500 gap-4">
              <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
              <span>STREAMING FROM CENTRAL MAINFRAME...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500 text-red-500 font-mono text-xs p-6 text-center max-w-md mx-auto" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 animate-bounce" />
              <p className="font-bold uppercase tracking-wider mb-1">TELEMETRY LINK BREACH</p>
              <p className="text-gray-400">{error}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeMainTab === "BRACKETS" && (
                <motion.div
                  key="brackets-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  {/* Event Sub-selectors */}
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-hide">
                    {["Robo Soccer", "Robo Sumo"].map((ev) => (
                      <button
                        key={ev}
                        onClick={() => setBracketSubTab(ev)}
                        className={`whitespace-nowrap px-5 py-2.5 font-mono text-xs tracking-widest uppercase transition-all duration-300 ${
                          bracketSubTab === ev
                            ? "bg-neon-cyan/20 border border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(102,252,241,0.2)]"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                        }`}
                        style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
                      >
                        {ev}
                      </button>
                    ))}
                  </div>

                  {/* Official PDF / Graphic Bracket Preview (if provided by admin) */}
                  {systemBrackets[bracketSubTab]?.pdfUrl && (
                    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 relative group shadow-[0_0_20px_rgba(102,252,241,0.05)]">
                      {systemBrackets[bracketSubTab].pdfUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <img
                          src={systemBrackets[bracketSubTab].pdfUrl}
                          alt={`${bracketSubTab} Official Bracket`}
                          className="w-full h-auto max-h-[85vh] object-contain mx-auto"
                        />
                      ) : (
                        <iframe
                          src={
                            systemBrackets[bracketSubTab].pdfUrl.includes("google.com")
                              ? systemBrackets[bracketSubTab].pdfUrl.replace("/view", "/preview")
                              : systemBrackets[bracketSubTab].pdfUrl
                          }
                          className="w-full h-[550px] border-none bg-white/5"
                          title={`${bracketSubTab} Official PDF Bracket`}
                        />
                      )}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a
                          href={systemBrackets[bracketSubTab].pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-black/90 border border-neon-cyan/50 text-neon-cyan font-mono text-[10px] uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-colors"
                          style={{ clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)" }}
                        >
                          <Download className="w-3.5 h-3.5" /> Full Screen
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Interactive Tournament Bracket */}
                  <div>
                    <h3 className="font-display font-black text-xl text-white tracking-widest uppercase mb-2">INTERACTIVE STAGE FLOW</h3>
                    <p className="font-mono text-xs text-gray-500 mb-6 uppercase">&gt; CLICK MATCH CARD FOR DETAILED SCORE & PENALTY TELEMETRY LOGS</p>
                    <TournamentBracket
                      matches={systemBrackets[bracketSubTab]?.matches || []}
                      eventName={bracketSubTab}
                    />
                  </div>
                </motion.div>
              )}

              {activeMainTab === "STANDINGS" && (
                <motion.div
                  key="standings-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  {/* Event Sub-selectors */}
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-hide">
                    {["Robo Race", "Line Follower"].map((ev) => (
                      <button
                        key={ev}
                        onClick={() => setStandingSubTab(ev)}
                        className={`whitespace-nowrap px-5 py-2.5 font-mono text-xs tracking-widest uppercase transition-all duration-300 ${
                          standingSubTab === ev
                            ? "bg-neon-cyan/20 border border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(102,252,241,0.2)]"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                        }`}
                        style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
                      >
                        {ev}
                      </button>
                    ))}
                  </div>

                  {/* Respect showRaceLeaderboard configuration */}
                  {!showRaceLeaderboard ? (
                    <div className="space-y-8 max-w-4xl mx-auto">
                      <div
                        className="bg-red-500/10 border border-red-500 text-red-500 font-mono text-sm p-8 text-center shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
                      >
                        <p className="font-bold animate-pulse uppercase tracking-[0.2em] mb-3 flex justify-center items-center gap-2">
                          <ShieldAlert className="w-5 h-5 shrink-0" />
                          [ HQ PROTOCOL: LIVE STANDINGS LOCK ACTIVE ]
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed uppercase">
                          The timing telemetry scoreboard calculations are currently secured by the Technical HQ. Complete calculations and team rankings are locked until review propagation.
                        </p>
                      </div>

                      {/* Display logged in user's teams details */}
                      {isUserLoggedIn ? (
                        <div className="space-y-6">
                          <div className="text-center font-mono text-xs text-gray-500 uppercase tracking-wider">
                            &gt; LOGGED IN OPERATIVE: {userEmail} {"// SQUAD RECORDS DETECTED BELOW"}
                          </div>
                          {(() => {
                            const myTeamsInEvent = userTeams.filter(
                              (t) => t.event?.toLowerCase() === standingSubTab.toLowerCase() && t.status === "VERIFIED"
                            );

                            if (myTeamsInEvent.length === 0) {
                              return (
                                <div
                                  className="bg-black/60 border border-white/10 p-12 text-center text-gray-500 font-mono"
                                  style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
                                >
                                  <p className="text-xs uppercase tracking-widest">[ NO VERIFIED SQUAD ENLISTED FOR {standingSubTab.toUpperCase()} ]</p>
                                </div>
                              );
                            }

                            return myTeamsInEvent.map((team) => (
                              <div key={team.id} className="bg-black/60 border border-white/10 p-6 space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.4)]" style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}>
                                <div className="border-b border-white/10 pb-3 flex justify-between items-center font-mono">
                                  <div>
                                    <h4 className="text-sm font-bold text-white uppercase">{team.name}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase">{team.institution || "Independent"}</p>
                                  </div>
                                  <span className="text-[10px] text-neon-cyan border border-neon-cyan/30 px-2.5 py-1 bg-neon-cyan/10 uppercase tracking-widest font-bold">Squad Trials</span>
                                </div>

                                {standingSubTab === "Line Follower" ? (
                                  team.runs && team.runs.length > 0 ? (
                                    <div className="space-y-4 font-mono">
                                      <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">[ RECORDED TRIAL ATTEMPTS ]</p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {team.runs.map((r, rIdx) => (
                                          <div key={rIdx} className="bg-black/80 border border-white/10 p-4 font-mono text-xs text-gray-400" style={{ clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)" }}>
                                            <div className="flex justify-between border-b border-white/10 pb-1.5 mb-2 font-bold text-white">
                                              <span>ATTEMPT #{r.attemptNumber}</span>
                                              <span className={r.status === "QUALIFIED" ? "text-green-400" : "text-red-500"}>{r.status}</span>
                                            </div>
                                            <p className="mb-0.5 text-[10px]">Driver: <span className="text-white uppercase">{r.driverName || "N/A"}</span></p>
                                            <p className="mb-1 text-[10px]">Initial Time: <span className="text-white">{r.initialTime}s</span></p>
                                            <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-gray-500 space-y-0.5">
                                              <p className="m-0">Off-tracks: {r.offTracks || 0} (+{(r.offTracks || 0)*10}s)</p>
                                              <p className="m-0">Hand Touches: {r.handTouches || 0} (+{(r.handTouches || 0)*30}s)</p>
                                              <p className="m-0">Skips: {r.skips || 0} (+{(r.skips || 0)*45}s)</p>
                                            </div>
                                            <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between text-white font-bold text-sm">
                                              <span>Total Time:</span>
                                              <span className="text-neon-cyan">{r.totalTime.toFixed(2)}s</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-10 text-gray-500 text-xs font-mono uppercase tracking-widest bg-white/2">
                                      [ NO TRIAL RUNS COMPLETED YET BY YOUR SQUAD ]
                                    </div>
                                  )
                                ) : (
                                  /* Robo Race Squad Standings Summary Card */
                                  <div className="bg-black/80 border border-white/10 p-4 font-mono text-xs text-gray-400 rounded" style={{ clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)" }}>
                                    <div className="flex justify-between border-b border-white/10 pb-1.5 mb-2 font-bold text-white">
                                      <span>BEST TRIAL CLOCK</span>
                                      <span className={getBestRunInfo(team).isNoRuns ? "text-gray-500" : getBestRunInfo(team).isDsq ? "text-red-500" : "text-green-400"}>
                                        {getBestRunInfo(team).isNoRuns ? "NO RECORD" : getBestRunInfo(team).isDsq ? "DISQUALIFIED" : "QUALIFIED"}
                                      </span>
                                    </div>
                                    <p className="mb-0.5 text-[10px]">Driver Name: <span className="text-white uppercase">{getBestRunInfo(team).driverName || "N/A"}</span></p>
                                    <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between text-white font-bold text-sm">
                                      <span>Recorded Timing:</span>
                                      <span className="text-neon-cyan">{getBestRunInfo(team).isNoRuns ? "N/A" : getBestRunInfo(team).isDsq ? "DSQ" : `${getBestRunInfo(team).totalTime.toFixed(2)}s`}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ));
                          })()}
                        </div>
                      ) : (
                        <div
                          className="bg-black/40 border border-white/10 p-6 text-center text-gray-500 font-mono text-xs uppercase tracking-wider"
                          style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                        >
                          {"Are you a participant?"}
                          <a href="/login" className="text-neon-cyan underline hover:text-white transition-colors font-bold">
                            {"Login here"}
                          </a>{" "}
                          {"to view your squad's live trials telemetry logs."}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="bg-black/60 border border-white/10 p-6 rounded-lg relative overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.5)]"
                      style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(184,41,234,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-0"></div>

                      <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2 z-10 relative">
                        <span className="flex items-center gap-2">
                          <Trophy className="text-neon-cyan w-4.5 h-4.5" />
                          TELEMETRY STANDINGS LEADERBOARD
                        </span>
                        <span className="text-[9px] md:text-[10px] text-neon-cyan font-mono tracking-normal uppercase">
                          SORTED BY BEST TOTAL TIME (INITIAL TIME + PENALTIES)
                        </span>
                      </h4>

                      {isLoadingLeaderboard ? (
                        <div className="text-center py-16 font-mono text-xs text-gray-500 flex flex-col items-center gap-2">
                          <Clock className="w-6 h-6 text-neon-cyan animate-spin" />
                          <span>FETCHING SCORE MATRIX TELEMETRY...</span>
                        </div>
                      ) : sortedLeaderboard.length === 0 ? (
                        <div className="text-center py-16 font-mono text-sm text-gray-500 uppercase tracking-widest bg-white/2 border border-white/5 rounded">
                          [ NO VERIFIED TEAMS ENLISTED IN {standingSubTab.toUpperCase()} ]
                        </div>
                      ) : (
                        <div className="overflow-x-auto z-10 relative scrollbar-thin">
                          <table className="w-full text-left font-mono text-xs border-collapse min-w-[700px]">
                            <thead>
                              <tr className="border-b border-white/20 text-gray-400 text-[10px] uppercase tracking-wider bg-white/5">
                                <th className="p-3">Rank</th>
                                <th className="p-3">Team ID</th>
                                <th className="p-3">Team Name</th>
                                <th className="p-3">Driver</th>
                                <th className="p-3 text-right">Initial Time</th>
                                <th className="p-3 text-right">Penalty</th>
                                <th className="p-3 text-right">Total Time</th>
                                <th className="p-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedLeaderboard.map((team, index) => {
                                const bestRun = getBestRunInfo(team);
                                const isPodium = index === 0;

                                return (
                                  <Fragment key={team._id}>
                                    <tr className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${
                                      isPodium ? "bg-neon-cyan/5 border-l-2 border-l-neon-cyan shadow-[inset_4px_0_10px_rgba(102,252,241,0.05)]" : ""
                                    }`}>
                                      <td className={`p-3 font-bold ${isPodium ? "text-neon-cyan text-glow-cyan text-sm" : "text-gray-500"}`}>
                                        #{index + 1}
                                      </td>
                                      <td className="p-3 text-gray-400 font-bold uppercase">{team.teamId}</td>
                                      <td className="p-3 uppercase">
                                        <div className="font-bold text-white tracking-wider">{team.name}</div>
                                        <div className="text-[8px] text-gray-500 normal-case">{team.institution || "Independent"}</div>
                                      </td>
                                      <td className="p-3 uppercase text-gray-300">{bestRun.driverName || "-"}</td>
                                      <td className="p-3 text-right text-gray-300">
                                        {bestRun.isNoRuns ? "-" : `${bestRun.initialTime.toFixed(2)}s`}
                                      </td>
                                      <td className="p-3 text-right text-yellow-500">
                                        {bestRun.isNoRuns ? "-" : `+${bestRun.penaltyTime}s`}
                                      </td>
                                      <td className={`p-3 text-right font-bold ${isPodium ? "text-neon-cyan" : "text-white"}`}>
                                        {bestRun.isNoRuns ? "N/A" : bestRun.isDsq ? "DSQ" : `${bestRun.totalTime.toFixed(2)}s`}
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                                          bestRun.isNoRuns
                                            ? "border border-white/20 text-gray-500"
                                            : bestRun.isDsq
                                              ? "border border-red-500 text-red-500 bg-red-500/10"
                                              : "border border-green-500 text-green-500 bg-green-500/10"
                                        }`}>
                                          {bestRun.isNoRuns ? "NO RUNS" : bestRun.isDsq ? "DISQUALIFIED" : "QUALIFIED"}
                                        </span>
                                      </td>
                                    </tr>

                                    {/* Detailed Run Logs Dropdown Row */}
                                    {standingSubTab === "Line Follower" && team.runs && team.runs.length > 0 && (
                                      <tr>
                                        <td colSpan={8} className="p-3 bg-black/40 border-b border-white/5">
                                          <div className="pl-6 border-l border-white/10 py-2.5 space-y-2">
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest">&gt;&gt; FULL RUN TELEMETRY LOGS ({team.runs.length} ATTEMPTS)</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                              {team.runs.map((r, rIdx) => (
                                                <div 
                                                  key={rIdx} 
                                                  className="bg-black/80 border border-white/10 p-3 rounded font-mono text-[9px] text-gray-400 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
                                                  style={{ clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)" }}
                                                >
                                                  <div className="flex justify-between border-b border-white/10 pb-1 mb-2 text-white font-bold">
                                                    <span>RUN #{r.attemptNumber}</span>
                                                    <span className={r.status === "QUALIFIED" ? "text-green-400" : "text-red-500"}>{r.status}</span>
                                                  </div>
                                                  <p className="mb-0.5">Driver: <span className="text-white uppercase">{r.driverName || "N/A"}</span></p>
                                                  <p className="mb-1">Initial Clock: <span className="text-white">{r.initialTime}s</span></p>
                                                  <div className="mt-1.5 pt-1.5 border-t border-white/5 text-[8px] text-gray-500 space-y-0.5">
                                                    <p className="m-0">Off-tracks: {r.offTracks || 0} (+{(r.offTracks || 0)*10}s)</p>
                                                    <p className="m-0">Hand Touches: {r.handTouches || 0} (+{(r.handTouches || 0)*30}s)</p>
                                                    <p className="m-0">Skips: {r.skips || 0} (+{(r.skips || 0)*45}s)</p>
                                                  </div>
                                                  <div className="mt-2 pt-1.5 border-t border-white/10 flex justify-between text-white font-bold text-[10px]">
                                                    <span>Total Time:</span>
                                                    <span className="text-neon-cyan">{r.totalTime.toFixed(2)}s</span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
