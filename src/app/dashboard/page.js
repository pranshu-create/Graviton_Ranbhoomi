"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QrCode, LogOut, CheckCircle2, UploadCloud, Clock, AlertTriangle, MapPin, Navigation, Download, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, Fragment } from "react";
import { QRCodeSVG } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';
import { eventsData } from "@/data/events";
import { motion, AnimatePresence } from "framer-motion";
import GlitchOverlay from "@/components/GlitchOverlay";
import AcceptanceLetter from "@/components/AcceptanceLetter";

const MAP_NODES = [
  { id: 'arena', label: 'MAIN ARENA', x: '50%', y: '40%', status: 'ONLINE', desc: 'Robo Wars & Heavy Combat Zone', color: 'neon-cyan' },
  { id: 'arena2', label: 'SECONDARY ARENA', x: '80%', y: '20%', status: 'STANDBY', desc: 'Line Follower & Maze', color: 'red-500' },
  { id: 'track', label: 'RACE TRACK', x: '25%', y: '60%', status: 'ONLINE', desc: 'High-Speed Robo Race Course', color: 'electric-purple' },
  { id: 'soccer', label: 'SOCCER FIELD', x: '75%', y: '55%', status: 'STANDBY', desc: 'Robo Soccer Tournament Grounds', color: 'blue-500' },
  { id: 'hq', label: 'REGISTRATION HQ', x: '50%', y: '80%', status: 'ACTIVE', desc: 'Check-in and Technical Support', color: 'green-500' },
  { id: 'vault', label: 'RESOURCE VAULT', x: '20%', y: '30%', status: 'RESTRICTED', desc: 'Component Store & Power Station', color: 'yellow-500' }
];

function InteractiveCampusMap({ liveNodes }) {
  const [activeNode, setActiveNode] = useState(null);
  const nodesToRender = liveNodes && liveNodes.length > 0 ? liveNodes : MAP_NODES;

  return (
    <div className="relative w-full h-[500px] bg-black/60 border border-white/10 overflow-hidden" style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}>
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(102,252,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      {/* Central Radar Sweep */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-neon-cyan/10 rounded-full pointer-events-none">
        <div className="w-full h-full border border-electric-purple/10 rounded-full scale-75"></div>
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[2px] bg-gradient-to-r from-neon-cyan/50 to-transparent origin-left animate-[spin_4s_linear_infinite]"></div>
      </div>

      {/* Connection Lines (Abstract SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <path d="M 50% 40% L 25% 60% L 20% 30% Z" fill="none" stroke="#66FCF1" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" />
        <path d="M 50% 40% L 75% 55% L 50% 80% Z" fill="none" stroke="#B829EA" strokeWidth="1" strokeDasharray="5,5" />
      </svg>

      {/* Nodes */}
      {nodesToRender.map((node) => (
        <div 
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-crosshair z-20"
          style={{ left: node.x, top: node.y }}
          onMouseEnter={() => setActiveNode(node)}
          onMouseLeave={() => setActiveNode(null)}
        >
          {/* Node Core */}
          <div className="relative flex items-center justify-center">
            <div className={`absolute w-12 h-12 rounded-full border border-${node.color}/30 animate-ping opacity-50`}></div>
            <div className={`w-4 h-4 bg-${node.color} rounded-full shadow-[0_0_15px_currentColor]`}></div>
          </div>
          
          {/* Static Label */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none transition-opacity duration-300">
            <span className="font-mono text-[10px] text-gray-400 tracking-widest bg-black/50 px-1">{node.label}</span>
          </div>
        </div>
      ))}

      {/* Info Panel */}
      <AnimatePresence>
        {activeNode && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-80 bg-black/90 border border-white/20 p-4 z-30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md"
            style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-display font-bold text-lg text-${activeNode.color}`}>{activeNode.label}</h3>
              <span className="text-[9px] font-mono border border-white/20 px-1 py-0.5 text-gray-300 tracking-wider">
                {activeNode.status}
              </span>
            </div>
            <p className="text-gray-400 font-mono text-xs leading-relaxed">{activeNode.desc}</p>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-[10px] font-mono text-gray-500">COORD: {activeNode.x} , {activeNode.y}</span>
              <Navigation className="w-3 h-3 text-neon-cyan" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Default Overlay */}
      {!activeNode && (
        <div className="absolute bottom-6 left-6 text-gray-500 font-mono text-xs pointer-events-none">
          [ AWAITING SECTOR SELECTION ]
        </div>
      )}
    </div>
  );
}

import { getPusherClient } from "@/lib/pusherClient";

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const playerCardRef = useRef(null);
  
  const [teamsData, setTeamsData] = useState([]);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [showAcceptanceLetter, setShowAcceptanceLetter] = useState(false);
  const [acceptanceTeam, setAcceptanceTeam] = useState(null);
  
  // Holographic card states
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [cardHover, setCardHover] = useState(false);
  const [cardMousePos, setCardMousePos] = useState({ x: 50, y: 50 });


  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, VAULT, MAP, COMMS, ACCOMMODATION, BRACKETS
  const [accommodations, setAccommodations] = useState({});
  const [isRequestingAccom, setIsRequestingAccom] = useState(false);  
  
  const handleCopyFromLeader = (i) => {
    const fields = ['arrival', 'departure', 'emName', 'emPhone'];
    fields.forEach(f => {
      const leaderVal = document.querySelector(`input[name="${f}_0"]`)?.value;
      if (leaderVal) {
        const target = document.querySelector(`input[name="${f}_${i}"]`);
        if (target) target.value = leaderVal;
      }
    });
  };

  const handleCardMouseEnter = () => {
    setCardHover(true);
  };
  const handleCardMouseLeave = () => {
    setCardHover(false);
    setCardRotate({ x: 0, y: 0 });
  };

  const handleCardMouseMove = (e) => {
    if (!playerCardRef.current) return;
    const card = playerCardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    setCardMousePos({ x: px, y: py });

    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -12;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 12;
    setCardRotate({ x: rx, y: ry });
  };



  // Vault state
  const [vaultPasswordInput, setVaultPasswordInput] = useState("");
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

  // WhatsApp Comms State
  const [commsAuthPhone, setCommsAuthPhone] = useState("");

  const [mapNodes, setMapNodes] = useState([]);
  const [commsMessages, setCommsMessages] = useState([]);
  const [isCommsAuthorized, setIsCommsAuthorized] = useState(false);
  const messagesEndRef = useRef(null);

  const [hasHackedMainframe, setHasHackedMainframe] = useState(false);
  const [isAttackMode, setIsAttackMode] = useState(false);

  // Auto-scroll comms terminal only when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [commsMessages.length, activeTab]);

  useEffect(() => {
    const handleCtfUnlocked = () => {
      setHasHackedMainframe(true);
      setIsAttackMode(true);
    };
    window.addEventListener("ctf-unlocked", handleCtfUnlocked);
    return () => window.removeEventListener("ctf-unlocked", handleCtfUnlocked);
  }, []);

  // Real-time Updates via Pusher
  useEffect(() => {
    let pusherClient;
    let channel;

    const handleComms = (newMessage) => {
      setCommsMessages(prev => [...prev, newMessage]);
    };

    const handleSystemUpdate = (config) => {
      if (config.globalMessage !== undefined) setGlobalMessage(config.globalMessage);
      if (config.mapNodes) setMapNodes(config.mapNodes);
      if (config.showRaceLeaderboard !== undefined) setShowRaceLeaderboard(config.showRaceLeaderboard);
    };

    const setupPusher = async () => {
      pusherClient = await getPusherClient();
      if (!pusherClient) return;

      channel = pusherClient.subscribe("god-mode-channel");
      
      channel.bind("comms-broadcast", handleComms);
      channel.bind("system-update", handleSystemUpdate);
    };

    setupPusher();

    return () => {
      if (channel) {
        channel.unbind("comms-broadcast", handleComms);
        channel.unbind("system-update", handleSystemUpdate);
      }
    };
  }, []);

  // Sync with Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          router.push("/login");
          return;
        }
        setUserEmail(email);

        // Fetch Teams
        const resTeams = await fetch(`/api/teams?email=${encodeURIComponent(email)}`);
        const dataTeams = await resTeams.json();
        const teams = dataTeams.teams && dataTeams.teams.length > 0 ? dataTeams.teams : [];
        
        teams.forEach(t => {
          if (t.status === 'VERIFIED' && !sessionStorage.getItem(`acceptanceLetterShown_${t.id}`)) {
            setAcceptanceTeam(t);
            setShowAcceptanceLetter(true);
            sessionStorage.setItem(`acceptanceLetterShown_${t.id}`, "true");
          }
        });
        
        setTeamsData(teams);
        
        // Fetch Accommodations for these teams
        const accomData = {};
        for (const t of teams) {
          try {
            const r = await fetch(`/api/accommodation?teamId=${t.id}`);
            const d = await r.json();
            if (d.success) accomData[t.id] = d.requests;
          } catch(e) {}
        }
        setAccommodations(accomData);
        
        if (teams.some(t => t.hasHackedMainframe)) {
          setHasHackedMainframe(true);
        }

        // Fetch System Config (Global Broadcast & Map Nodes)
        const resSystem = await fetch("/api/system");
        const dataSystem = await resSystem.json();
        if (dataSystem.success && dataSystem.config) {
          setGlobalMessage(dataSystem.config.globalMessage || "");
          setMapNodes(dataSystem.config.mapNodes || []);
        }

        // Fetch Comms Messages if authorized
        if (isCommsAuthorized) {
          const resComms = await fetch("/api/comms");
          const dataComms = await resComms.json();
          if (dataComms.success) {
            setCommsMessages(dataComms.messages || []);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 3000); // Polling every 3 seconds for live chat feel
    return () => clearInterval(interval);
  }, [router, isCommsAuthorized]);

  const handleDownloadPlayerCard = async () => {
    if (!playerCardRef.current) return;
    try {
      // Need a small delay to ensure rendering is complete before screenshotting
      const dataUrl = await htmlToImage.toPng(playerCardRef.current, { cacheBust: true, pixelRatio: 2, style: { background: '#02050A' } });
      const link = document.createElement('a');
      link.download = `ranbhoomi-card-${teamsData[selectedTeamIndex].id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating card', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed:", err.message);
    }
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const handleToggle2FA = async (newVal) => {
    try {
      const res = await fetch("/api/toggle-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newVal })
      });
      const data = await res.json();
      if (data.success) {
        setTeamsData(prev => prev.map(t => ({ ...t, twoFactorEnabled: newVal })));
      } else {
        alert(data.error || "Failed to update security settings.");
      }
    } catch (err) {
      alert("Error contacting security database.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const activeTeam = teamsData[selectedTeamIndex];
    if (!activeTeam) return alert("No active team selected.");

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("teamId", activeTeam.id);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        // Optimistic update
        const newTeams = [...teamsData];
        newTeams[selectedTeamIndex].status = "PENDING";
        setTeamsData(newTeams);
      } else {
        alert("Upload Failed: " + data.error);
      }
    } catch (err) {
      alert("Error uploading screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  // Aggregate unique members across all teams
  const uniqueMembersMap = {};
  const allAccoms = Object.values(accommodations).flat();

  teamsData.forEach(team => {
    team.memberDetails.forEach(m => {
      const key = (m.email || m.name).toLowerCase().trim();
      if (!uniqueMembersMap[key]) {
        const existingAccom = allAccoms.find(a => 
          a.memberEmail.toLowerCase() === key || 
          (a.memberName.toLowerCase() === m.name.toLowerCase() && !m.email)
        );
        uniqueMembersMap[key] = {
          name: m.name,
          email: m.email || `member_${Date.now()}_${Math.floor(Math.random()*1000)}@temp.com`,
          role: m.role,
          primaryTeamId: team.id,
          primaryTeamName: team.name,
          accommodation: existingAccom || null
        };
      }
    });
  });

  const uniqueMembersList = Object.values(uniqueMembersMap);
  const requestedMembers = uniqueMembersList.filter(m => m.accommodation);
  const unrequestedMembers = uniqueMembersList.filter(m => !m.accommodation);

  return (
    <>
      <Navbar />
      
      {showAcceptanceLetter && acceptanceTeam && (
        <AcceptanceLetter 
          teamName={acceptanceTeam.name} 
          eventName={acceptanceTeam.event} 
          teamId={acceptanceTeam.id}
          onClose={() => setShowAcceptanceLetter(false)} 
        />
      )}

      {teamsData[selectedTeamIndex]?.status === 'DISQUALIFIED' && (
        <GlitchOverlay />
      )}

      <main className={`flex-grow pt-32 pb-20 px-4 max-w-6xl mx-auto w-full transition-colors duration-500 ${isAttackMode ? 'cyber-attack' : ''}`}>
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-display font-black text-3xl text-white">
              COMMAND <span className={isAttackMode ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "text-neon-cyan text-glow-cyan"}>CENTER</span>
            </h1>
            <p className="text-gray-400">Welcome back, <span className="text-white">{userEmail}</span>.</p>
          </div>
          <div className="flex items-center gap-6">
            {hasHackedMainframe && (
              <button 
                onClick={() => setIsAttackMode(!isAttackMode)}
                className={`font-mono text-xs tracking-widest px-3 py-1 border transition-colors ${isAttackMode ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-transparent border-gray-600 text-gray-500 hover:text-white hover:border-gray-400'}`}
              >
                [ CYBER-ATTACK MODE: {isAttackMode ? "ON" : "OFF"} ]
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="font-display text-sm">LOGOUT</span>
            </button>
          </div>
        </div>

        {isAttackMode && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-10">
            <div className="absolute inset-0 bg-red-900"></div>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-50"></div>
            <div className="w-full h-full bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          </div>
        )}

        <div className="relative z-10">

        {globalMessage && (
          <div className="bg-electric-purple/20 border border-electric-purple text-electric-purple font-mono text-sm p-3 mb-8 flex items-center overflow-hidden whitespace-nowrap">
            <span className="font-bold mr-4 animate-pulse uppercase tracking-widest shrink-0">HQ BROADCAST //</span>
            <marquee className="tracking-wide" scrollamount="6">{globalMessage}</marquee>
          </div>
        )}

        {teamsData.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-lg">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-white font-display text-2xl mb-2">NO REGISTRATIONS FOUND</h2>
            <p className="text-gray-400 mb-6 font-mono text-sm">You haven&apos;t enlisted any squads yet.</p>
            <Link href="/register" className="px-6 py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-mono text-sm tracking-widest hover:bg-neon-cyan hover:text-black transition-colors">
              REGISTER A SQUAD
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto scrollbar-hide">
              <button onClick={() => setActiveTab('OVERVIEW')} className={`font-mono text-xs tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'text-neon-cyan' : 'text-gray-500 hover:text-white'}`}>Overview</button>
              <button onClick={() => setActiveTab('VAULT')} className={`font-mono text-xs tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'VAULT' ? 'text-neon-cyan' : 'text-gray-500 hover:text-white'}`}>Resource Vault</button>
              <button onClick={() => setActiveTab('MAP')} className={`font-mono text-xs tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'MAP' ? 'text-neon-cyan' : 'text-gray-500 hover:text-white'}`}>Campus Map</button>
              <button onClick={() => setActiveTab('COMMS')} className={`font-mono text-xs tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'COMMS' ? 'text-neon-cyan' : 'text-gray-500 hover:text-white'}`}>WhatsApp Bridge</button>
              <button onClick={() => setActiveTab('ACCOMMODATION')} className={`font-mono text-xs tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'ACCOMMODATION' ? 'text-neon-cyan' : 'text-gray-500 hover:text-white'}`}>Accommodation</button>
              <button onClick={() => setActiveTab('SECURITY')} className={`font-mono text-xs tracking-widest uppercase transition-colors whitespace-nowrap ${activeTab === 'SECURITY' ? 'text-neon-cyan' : 'text-gray-500 hover:text-white'}`}>Security</button>
            </div>

            {activeTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Event Tabs */}
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {teamsData.map((team, index) => (
                  <button 
                    key={team.id}
                    onClick={() => setSelectedTeamIndex(index)}
                    className={`whitespace-nowrap px-6 py-3 font-mono text-xs tracking-widest uppercase transition-all ${
                      selectedTeamIndex === index 
                        ? 'bg-electric-purple/20 border border-electric-purple text-electric-purple' 
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {team.event || "UNKNOWN EVENT"}
                  </button>
                ))}
              </div>

              <div className={`glass-panel p-6 rounded-lg border-l-4 ${
                teamsData[selectedTeamIndex]?.status === 'VERIFIED' ? 'border-l-neon-cyan' : 
                teamsData[selectedTeamIndex]?.status === 'PENDING' ? 'border-l-yellow-500' : 'border-l-red-500'
              }`}>
                <h2 className="font-display text-xl text-white mb-4">SQUAD_DETAILS</h2>
                
                <div className="bg-black/50 border border-white/5 rounded p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg uppercase">
                      {teamsData[selectedTeamIndex]?.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Event: <span className="text-neon-cyan">{teamsData[selectedTeamIndex]?.event}</span> | Members: {teamsData[selectedTeamIndex]?.members}
                    </p>
                  </div>
                  
                  <div className={`flex items-center ${
                    teamsData[selectedTeamIndex]?.status === 'VERIFIED' ? 'text-neon-cyan' : 
                    teamsData[selectedTeamIndex]?.status === 'PENDING' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {teamsData[selectedTeamIndex]?.status === 'VERIFIED' && <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {teamsData[selectedTeamIndex]?.status === 'PENDING' && <Clock className="w-5 h-5 mr-2" />}
                    {(teamsData[selectedTeamIndex]?.status === 'FAILED' || teamsData[selectedTeamIndex]?.status === 'UNPAID') && <AlertTriangle className="w-5 h-5 mr-2" />}
                    <span className="text-sm font-semibold uppercase tracking-wider">{teamsData[selectedTeamIndex]?.status}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-lg border-t border-t-white/10">
                <h2 className="font-display text-xl text-white mb-4">NOTIFICATIONS</h2>
                <ul className="space-y-4">
                  
                  {teamsData[selectedTeamIndex]?.status === 'VERIFIED' && (
                    <li className="flex items-start text-sm border-b border-white/5 pb-4">
                      <span className="bg-neon-cyan/20 text-neon-cyan p-1 rounded mr-3 mt-0.5">SYS</span>
                      <p className="text-gray-300">Your payment for {teamsData[selectedTeamIndex]?.event} has been VERIFIED. Registration is finalized. Good luck!</p>
                    </li>
                  )}

                  {teamsData[selectedTeamIndex]?.status === 'PENDING' && (
                    <li className="flex items-start text-sm border-b border-white/5 pb-4">
                      <span className="bg-yellow-500/20 text-yellow-500 p-1 rounded mr-3 mt-0.5">SYS</span>
                      <p className="text-gray-300">Payment screenshot uploaded. Awaiting HQ verification.</p>
                    </li>
                  )}

                  {(teamsData[selectedTeamIndex]?.status === 'FAILED' || teamsData[selectedTeamIndex]?.status === 'UNPAID') && (
                    <li className="flex items-start text-sm border-b border-white/5 pb-4">
                      <span className="bg-red-500/20 text-red-500 p-1 rounded mr-3 mt-0.5">SYS</span>
                      <p className="text-gray-300">Welcome to the RANBHOOMI portal. Complete your payment and upload a screenshot to finalize registration.</p>
                    </li>
                  )}

                </ul>
              </div>
            </div>

            {/* Payment Sidebar */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-lg border border-white/10 bg-black/40 text-center relative overflow-hidden">
                
                {teamsData[selectedTeamIndex]?.status === 'VERIFIED' ? (
                  <div className="py-6 flex flex-col items-center">
                     {/* Player Card Ref container with 3D Holographic tilt and shine */}
                     <div 
                       ref={playerCardRef} 
                       onMouseMove={handleCardMouseMove}
                       onMouseEnter={handleCardMouseEnter}
                       onMouseLeave={handleCardMouseLeave}
                       className="w-full bg-[#02050A] p-0 border border-neon-cyan/50 relative overflow-hidden mb-6 flex flex-col items-center shadow-[0_0_30px_rgba(102,252,241,0.25)] transition-shadow duration-300" 
                       style={{ 
                         transform: cardHover 
                           ? `perspective(1000px) rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) scale3d(1.02, 1.02, 1.02)` 
                           : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)', 
                         transition: cardHover ? 'none' : 'transform 0.5s ease-out', 
                         transformStyle: 'preserve-3d',
                         clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" 
                       }}
                     >
                        <style>{`
                          @keyframes card-scanline-sweep {
                            0% { transform: translateY(-50px); opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { transform: translateY(400px); opacity: 0; }
                          }
                        `}</style>

                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(102,252,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-0"></div>
                        
                        {/* Iridescent Holo Shine Overlay */}
                        {cardHover && (
                          <div 
                            className="absolute inset-0 z-30 pointer-events-none mix-blend-color-dodge opacity-70"
                            style={{
                              background: `radial-gradient(circle at ${cardMousePos.x}% ${cardMousePos.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(102, 252, 241, 0.15) 30%, rgba(184, 41, 234, 0.1) 60%, transparent 80%)`
                            }}
                          />
                        )}

                        {/* Visual Scanning Laser Line */}
                        <div 
                          className="absolute left-0 w-full h-[2px] bg-neon-cyan/60 shadow-[0_0_10px_rgba(102,252,241,0.9)] pointer-events-none z-20" 
                          style={{
                            animation: 'card-scanline-sweep 4s linear infinite',
                            top: 0
                          }}
                        />

                        {/* Tech Accents */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-neon-cyan/10 blur-3xl rounded-full"></div>
                        <div className="absolute top-10 -left-10 w-24 h-24 bg-electric-purple/10 blur-2xl rounded-full"></div>
                        
                        {/* Header Area */}
                        <div className="w-full bg-neon-cyan/10 border-b border-neon-cyan/30 p-3 flex justify-between items-center z-10">
                          <div className="flex flex-col text-left">
                            <span className="text-[8px] font-mono text-neon-cyan tracking-[0.3em] uppercase">SYSTEM.AUTH</span>
                            <span className="font-display text-white text-sm tracking-widest">RANBHOOMI &apos;26</span>
                          </div>
                          <div className="text-[10px] font-mono text-gray-400">
                            {teamsData[selectedTeamIndex]?.id}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 w-full flex flex-col items-center z-10">
                          <h2 className="font-display font-black text-3xl text-white uppercase break-words leading-tight text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                            {teamsData[selectedTeamIndex]?.name}
                          </h2>
                          <div className="inline-block mt-3 px-4 py-1.5 bg-electric-purple/20 border border-electric-purple/50">
                            <p className="text-electric-purple font-mono text-xs uppercase tracking-[0.2em]">{teamsData[selectedTeamIndex]?.event}</p>
                          </div>

                          {/* QR Code Container with Tech Border */}
                          <div className="mt-8 relative p-2">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-cyan"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-cyan"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-cyan"></div>
                            
                            <div className="bg-white p-3 shadow-[0_0_20px_rgba(102,252,241,0.4)] relative z-10">
                              <QRCodeSVG 
                                value={JSON.stringify({ teamId: teamsData[selectedTeamIndex]?.id, status: "VERIFIED" })}
                                size={140}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                                level="H"
                              />
                            </div>
                          </div>

                          {/* Runs/Attempts Telemetry (For Time-trial Events) */}
                          {teamsData[selectedTeamIndex]?.runs && teamsData[selectedTeamIndex]?.runs.length > 0 && (
                            <div className="mt-6 w-full bg-black/60 border border-white/10 p-3 text-left font-mono text-[9px] text-gray-400">
                              <p className="text-[8px] text-neon-cyan mb-1.5 uppercase tracking-widest font-bold">[ ARENA TRIAL RUNS ]</p>
                              {teamsData[selectedTeamIndex].runs.map((r, idx) => (
                                <div key={idx} className="flex justify-between border-b border-white/5 py-1">
                                  <span>Run #{r.attemptNumber} ({r.driverName || "Driver"}):</span>
                                  <span className={r.status === 'DISQUALIFIED' ? 'text-red-500 font-bold' : 'text-neon-cyan'}>
                                    {r.status === 'DISQUALIFIED' ? 'DSQ (Skips > 2)' : `${r.totalTime.toFixed(2)}s (P: +${r.penaltyTime}s)`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="w-full flex justify-between items-end mt-8">
                            <div className="flex flex-col space-y-1">
                              <div className="text-left">
                                <p className="text-[7px] text-gray-600 font-mono uppercase tracking-[0.2em]">UTR Reference</p>
                                <p className="text-gray-400 font-mono text-[9px]">{teamsData[selectedTeamIndex]?.utr || "N/A"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] text-gray-500 font-mono uppercase tracking-[0.3em]">Clearance Level</p>
                              <p className="text-neon-cyan font-bold text-sm tracking-widest">VERIFIED</p>
                            </div>
                          </div>
                        </div>
                     </div>
                     
                     <button 
                       onClick={handleDownloadPlayerCard}
                       className="w-full py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-mono text-xs tracking-widest hover:bg-neon-cyan hover:text-black transition-all mb-4"
                     >
                       DOWNLOAD PLAYER CARD
                     </button>
                  </div>
                ) : teamsData[selectedTeamIndex]?.status === 'PENDING' ? (
                  <div className="py-8">
                     <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Clock className="w-10 h-10 text-yellow-500 animate-spin" />
                     </div>
                     <h2 className="font-display text-xl text-white mb-2">VERIFICATION PENDING</h2>
                     <p className="text-sm text-gray-400">HQ is reviewing your payment screenshot. You will receive an email upon confirmation.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-lg text-white mb-2">COMPLETE PAYMENT</h2>
                    <p className="text-xs text-gray-400 mb-6">Scan the QR code below to pay your registration fee (₹500)</p>
                    
                    <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center mb-6">
                      <QrCode className="w-32 h-32 text-black" />
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      Enter your 12-digit UPI UTR and upload a screenshot of your successful transaction below.
                    </p>
                    
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const utr = e.target.utr.value;
                      const file = fileInputRef.current.files[0];

                      if (!utr || utr.length !== 12 || isNaN(utr)) {
                        return alert("Invalid UTR. Must be exactly 12 digits.");
                      }
                      if (!file) {
                        return alert("Please upload a payment screenshot.");
                      }
                      
                      setIsUploading(true);
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("teamId", teamsData[selectedTeamIndex].id);
                      formData.append("utr", utr);

                      try {
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success) {
                          const newTeams = [...teamsData];
                          newTeams[selectedTeamIndex].status = "PENDING";
                          setTeamsData(newTeams);
                        } else {
                          alert("Failed: " + data.error);
                        }
                      } catch (err) {
                        alert("Error submitting payment details");
                      } finally {
                        setIsUploading(false);
                      }
                    }} className="flex flex-col gap-4 w-full">
                      <input 
                        type="text" 
                        name="utr"
                        required 
                        maxLength={12}
                        placeholder="ENTER 12-DIGIT UTR"
                        className="bg-black border border-white/20 p-3 text-center w-full font-mono text-sm focus:border-neon-cyan focus:outline-none tracking-widest text-white"
                      />
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        required
                        accept="image/*" 
                        className="bg-black border border-white/20 p-3 w-full font-mono text-xs text-gray-400 focus:border-neon-cyan focus:outline-none"
                      />
                      <button 
                        type="submit"
                        disabled={isUploading}
                        className="w-full py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-mono text-sm tracking-widest hover:bg-neon-cyan hover:text-black transition-all flex items-center justify-center gap-2"
                      >
                        {isUploading ? <Clock className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        {isUploading ? "UPLOADING..." : "SUBMIT PAYMENT"}
                      </button>
                    </form>
                  </>
                )}

              </div>
            </div>
            </div>
            )}

            {/* NEW ALL-TOGETHER ACCOMMODATION VIEW */}
            {activeTab === 'ACCOMMODATION' && (
              <div className="max-w-4xl mx-auto space-y-8 text-white font-mono pb-12 mt-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="font-display text-2xl text-neon-cyan uppercase tracking-widest">Logistics & Accommodation</h3>
                </div>

                <div className="bg-black/40 border border-white/10 p-6">
                  <h4 className="text-red-500 font-bold mb-2 uppercase tracking-widest border-b border-red-500/20 pb-2">Hostel Rules & Directives</h4>
                  <ul className="list-disc list-inside text-xs text-gray-400 space-y-2 mt-2">
                    <li>Entry into the hostel premises is strictly prohibited after 9:00 PM.</li>
                    <li>Do NOT touch any cupboards or belongings of regular hostel students.</li>
                    <li>Any damage to hostel property will result in immediate disqualification of the entire team.</li>
                    <li>Maintain strict discipline and silence in the corridors.</li>
                    <li>Keep your QR Code handy. Hostel Authorities will scan it upon entry and exit.</li>
                  </ul>
                </div>


                 {requestedMembers.length > 0 && (
                   <div className="mb-8 bg-black/60 border border-white/10 p-6">
                     <h4 className="text-neon-cyan font-bold mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Accommodation Status Tracker</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {requestedMembers.map((m, idx) => {
                         const acc = m.accommodation;
                         return (
                           <div key={idx} className="bg-black border border-white/20 p-4 relative overflow-hidden group">
                             <div className="flex justify-between items-start mb-2">
                               <div>
                                 <p className="font-bold text-white uppercase text-sm">{acc.memberName}</p>
                                 <p className="text-[10px] text-gray-500 uppercase">{acc.gender}</p>
                               </div>
                               <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 border ${
                                 acc.status === "APPROVED" ? "border-green-500 text-green-500 bg-green-500/10" :
                                 acc.status === "DOCS_SUBMITTED" ? "border-blue-500 text-blue-500 bg-blue-500/10" :
                                 acc.status === "FORM_SENT" ? "border-purple-500 text-purple-500 bg-purple-500/10" :
                                 acc.status === "REJECTED" ? "border-red-500 text-red-500 bg-red-500/10" :
                                 "border-yellow-500 text-yellow-500 bg-yellow-500/10"
                               }`}>
                                 {acc.status}
                               </span>
                             </div>
                             
                             {acc.status === "FORM_SENT" && (
                               <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                 <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">ACTION REQUIRED</p>
                                 <p className="text-xs text-gray-400">Check the registered email to complete the documentation form.</p>
                               </div>
                             )}

                             {acc.status === "APPROVED" && (
                               <div className="mt-4 pt-4 border-t border-white/10 flex flex-col items-center">
                                 <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest">Room Allocation</p>
                                 <p className="text-2xl font-bold text-neon-cyan mb-4">{acc.roomNumber || "TBD"}</p>
                                 
                                 <div className="bg-white p-2">
                                   <QRCodeSVG 
                                     value={acc.qrCodeId}
                                     size={80}
                                     bgColor={"#ffffff"}
                                     fgColor={"#000000"}
                                     level="L"
                                   />
                                 </div>
                                 
                                 <div className="mt-4 w-full flex justify-between items-center text-[10px]">
                                   <span className="text-gray-500">Status:</span>
                                   <span className={acc.isCheckedIn ? "text-neon-cyan font-bold" : "text-yellow-500"}>
                                     {acc.isCheckedIn ? "IN HOSTEL" : "OUTSIDE"}
                                   </span>
                                 </div>
                               </div>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}

                 {unrequestedMembers.length > 0 ? (
                   <div className="bg-black/60 border border-white/10 p-6">
                     <h4 className="text-white font-bold mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Request Accommodation</h4>
                     <p className="text-xs text-gray-400 mb-6 font-mono">Select gender to request accommodation for your remaining squad members. (Duplicate members across squads are merged automatically).</p>
                     <form onSubmit={async (e) => {
                       e.preventDefault();
                       setIsRequestingAccom(true);
                       
                       const membersByTeam = {};
                       for (let i = 0; i < unrequestedMembers.length; i++) {
                         const m = unrequestedMembers[i];
                         const file = e.target[`idProof_${i}`].files[0];
                         
                         if (!file) {
                           alert(`Please upload an ID proof for ${m.name}`);
                           setIsRequestingAccom(false);
                           return;
                         }

                         const formData = new FormData();
                         formData.append("file", file);
                         formData.append("teamId", m.primaryTeamId);
                         const uploadRes = await fetch("/api/upload-id", { method: "POST", body: formData });
                         const uploadData = await uploadRes.json();
                         
                         if (!uploadData.success) {
                           alert(`Failed to upload ID proof for ${m.name}`);
                           setIsRequestingAccom(false);
                           return;
                         }

                         if (!membersByTeam[m.primaryTeamId]) {
                           membersByTeam[m.primaryTeamId] = { teamName: m.primaryTeamName, members: [] };
                         }
                         
                         membersByTeam[m.primaryTeamId].members.push({
                           memberName: m.name,
                           memberEmail: m.email,
                           gender: e.target[`gender_${i}`].value,
                           age: Number(e.target[`age_${i}`].value),
                           arrivalDateTime: e.target[`arrival_${i}`].value,
                           departureDateTime: e.target[`departure_${i}`].value,
                           emergencyContactName: e.target[`emName_${i}`].value,
                           emergencyContactPhone: e.target[`emPhone_${i}`].value,
                           idProofUrl: uploadData.filePath
                         });
                       }

                       let allSuccess = true;
                       for (const [teamId, data] of Object.entries(membersByTeam)) {
                         const res = await fetch("/api/accommodation", {
                           method: "POST",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ teamId, teamName: data.teamName, members: data.members })
                         });
                         if (!res.ok) allSuccess = false;
                       }
                       
                       if (allSuccess) {
                         alert("Accommodation Requested successfully for all members.");
                         window.location.reload();
                       } else {
                         alert("Some requests failed. Please check the status and try again.");
                       }
                       setIsRequestingAccom(false);
                     }}>
                       <div className="space-y-8 mb-6">
                         {unrequestedMembers.map((m, i) => (
                           <div key={i} className="bg-black/50 p-4 border border-white/10 space-y-4 relative">
                             <div className="absolute top-0 right-0 bg-neon-cyan/20 text-neon-cyan px-2 py-1 text-[10px] font-bold uppercase tracking-widest border-b border-l border-neon-cyan/30">
                               {m.primaryTeamName}
                             </div>
                             <div className="border-b border-white/10 pb-2 flex justify-between items-start">
                                {i > 0 && (
                                  <button type="button" onClick={() => handleCopyFromLeader(i)} className="text-[9px] uppercase tracking-widest text-neon-cyan border border-neon-cyan/30 px-2 py-1 hover:bg-neon-cyan hover:text-black transition-colors order-last">COPY FROM LEADER</button>
                                )}
                               <p className="font-bold text-lg text-white uppercase tracking-widest">{m.name}</p>
                               <p className="text-[10px] text-gray-500 uppercase">{m.role}</p>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div>
                                 <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Gender</label>
                                 <select name={`gender_${i}`} className="w-full bg-black border border-white/20 p-2 text-xs text-white outline-none">
                                   <option value="BOYS">BOYS HOSTEL</option>
                                   <option value="GIRLS">GIRLS HOSTEL</option>
                                 </select>
                               </div>
                               <div>
                                 <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Age</label>
                                 <input required type="number" name={`age_${i}`} className="w-full bg-black border border-white/20 p-2 text-xs text-white outline-none" placeholder="Age" />
                               </div>
                               <div>
                                 <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">ID Proof (Aadhar/College ID)</label>
                                 <input required type="file" name={`idProof_${i}`} accept="image/*,.pdf" className="w-full bg-black border border-white/20 p-1.5 text-xs text-gray-400 outline-none file:bg-white/10 file:text-white file:border-0 file:mr-2" />
                               </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Arrival Date & Time</label>
                                 <input required type="datetime-local" name={`arrival_${i}`} className="w-full bg-black border border-white/20 p-2 text-xs text-white outline-none" />
                               </div>
                               <div>
                                 <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Departure Date & Time</label>
                                 <input required type="datetime-local" name={`departure_${i}`} className="w-full bg-black border border-white/20 p-2 text-xs text-white outline-none" />
                               </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Emergency Contact Name</label>
                                 <input required type="text" name={`emName_${i}`} className="w-full bg-black border border-white/20 p-2 text-xs text-white outline-none" placeholder="Guardian Name" />
                               </div>
                               <div>
                                 <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Emergency Contact Phone</label>
                                 <input required type="tel" name={`emPhone_${i}`} className="w-full bg-black border border-white/20 p-2 text-xs text-white outline-none" placeholder="+91 XXXXX XXXXX" />
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                       <button disabled={isRequestingAccom} type="submit" className="w-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan py-3 hover:bg-neon-cyan hover:text-black font-bold uppercase tracking-widest text-xs">
                         {isRequestingAccom ? "REQUESTING..." : "SUBMIT REQUESTS"}
                       </button>
                     </form>
                   </div>
                 ) : (
                   <div className="bg-white/5 border border-white/10 p-6 text-center">
                     <p className="text-neon-cyan font-mono text-sm tracking-widest uppercase">All squad members have active accommodation requests.</p>
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'VAULT' && (
              <div className="bg-black/60 border border-white/10 p-10 max-w-2xl mx-auto text-center" style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}>
                <h2 className={`font-display font-black text-3xl ${isAttackMode ? 'text-red-500' : 'text-electric-purple'} mb-4`}>RESOURCE VAULT</h2>
                
                {isAttackMode ? (
                  <div className="space-y-6">
                    <p className="text-red-500 font-mono font-bold animate-pulse tracking-widest text-lg border-b border-red-500/30 pb-4">
                      WARNING: SECURITY FIREWALL COMPROMISED.
                    </p>
                    <div className="bg-red-900/20 border border-red-500/50 p-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay"></div>
                      <h3 className="font-display text-2xl text-white mb-2 relative z-10">PROJECT ZERO SCHEMATICS</h3>
                      <p className="font-mono text-xs text-red-400 mb-6 relative z-10">CLASSIFIED TOP SECRET DOCUMENT EXPOSED.</p>
                      
                      <div className="relative border-2 border-red-500/30 mb-6 group-hover:border-red-500 transition-colors">
                        <img src="/mech_blueprint.png" alt="Classified Mech Blueprint" className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-red-500 text-red-500 font-black text-3xl md:text-5xl rotate-[-15deg] px-6 py-2 opacity-70 pointer-events-none drop-shadow-md">
                          TOP SECRET
                        </div>
                      </div>
                      
                      <a href="/mech_blueprint.png" download="PROJECT_ZERO_CLASSIFIED.png" className="inline-block w-full bg-red-500/20 border border-red-500 text-red-500 py-3 font-bold hover:bg-red-500 hover:text-white transition-colors tracking-widest relative z-10">
                        DOWNLOAD ENCRYPTED ASSET
                      </a>
                    </div>
                  </div>
                ) : isVaultUnlocked ? (
                  <div className="space-y-4">
                    <p className="text-neon-cyan font-mono mb-6">Access Granted. Vault contents decrypted.</p>
                    {/* Mock files */}
                    <div className="bg-white/5 p-4 flex justify-between items-center border border-white/10">
                      <span className="font-mono text-sm text-white">RoboSoccer_Rules_v2.pdf</span>
                      <button className="text-electric-purple hover:text-white transition-colors text-xs font-bold">DOWNLOAD</button>
                    </div>
                    <div className="bg-white/5 p-4 flex justify-between items-center border border-white/10">
                      <span className="font-mono text-sm text-white">LineFollower_Track_Specs.pdf</span>
                      <button className="text-electric-purple hover:text-white transition-colors text-xs font-bold">DOWNLOAD</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 font-mono text-sm mb-6">Vault is sealed. Awaiting HQ decryption key.</p>
                    <input 
                      type="password" 
                      value={vaultPasswordInput} 
                      onChange={(e) => setVaultPasswordInput(e.target.value)}
                      placeholder="ENTER DECRYPTION KEY"
                      className="bg-black border border-white/20 p-3 text-center w-full font-mono text-sm focus:border-electric-purple focus:outline-none mb-4 tracking-widest text-white"
                    />
                    <button 
                      onClick={() => {
                        if(vaultPasswordInput === "GRAVITON2026") setIsVaultUnlocked(true);
                        else alert("ACCESS DENIED");
                      }}
                      className="w-full bg-electric-purple/20 text-electric-purple border border-electric-purple py-3 font-bold hover:bg-electric-purple hover:text-white transition-colors"
                    >
                      UNLOCK
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'MAP' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-display text-xl text-white">TACTICAL CAMPUS MAP</h3>
                  <span className="text-xs font-mono text-neon-cyan border border-neon-cyan/30 px-2 py-1 bg-neon-cyan/10">LIVE FEED</span>
                </div>
                <InteractiveCampusMap liveNodes={mapNodes} />
              </div>
            )}

            {activeTab === 'COMMS' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-[#0b141a] border border-[#25D366]/30 rounded-lg overflow-hidden flex flex-col h-[500px]">
                  <div className="bg-[#202c33] p-4 border-b border-[#25D366]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#25D366] rounded-full animate-pulse"></div>
                      <h3 className="font-display text-white tracking-widest text-sm">WHATSAPP BRIDGE TERMINAL</h3>
                    </div>
                    {isCommsAuthorized && (
                      <span className="text-[#25D366] text-xs font-mono border border-[#25D366]/30 px-2 py-1 rounded bg-[#25D366]/10">
                        LINK ACTIVE
                      </span>
                    )}
                  </div>

                  {!isCommsAuthorized ? (
                    <div className="flex-grow flex flex-col items-center justify-center p-6 bg-[url('/noise.png')] mix-blend-screen opacity-90">
                      <div className="bg-[#202c33] p-8 border border-[#25D366]/20 rounded-lg text-center max-w-sm w-full">
                        <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#25D366]/30">
                          <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
                        </div>
                        <h4 className="text-white font-bold mb-2">Initialize Receiver</h4>
                        <p className="text-gray-400 text-xs font-mono mb-6">Enable the secure bridge to receive live broadcast messages from Overwatch HQ.</p>
                        
                        <button 
                          onClick={() => setIsCommsAuthorized(true)}
                          className="w-full bg-[#25D366] text-black font-bold py-3 hover:bg-[#20b954] transition-colors text-xs tracking-widest"
                        >
                          ENABLE SECURE COMMS
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow p-6 font-mono text-sm flex flex-col overflow-y-auto space-y-4 bg-[#0b141a] bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r20-T-D-nS4.png')] bg-repeat bg-opacity-5">
                      <div className="bg-[#202c33] text-gray-300 p-3 self-start max-w-[80%] rounded-r-lg rounded-bl-lg border border-white/5 shadow-md">
                        <p className="text-[#25D366] mb-1 font-bold text-xs">HQ_BOT</p>
                        <p>Secure link established. Awaiting broadcast messages from Overwatch HQ.</p>
                        <p className="text-[10px] text-gray-500 mt-2 text-right">SYSTEM MSG</p>
                      </div>

                      {commsMessages.map((msg, idx) => (
                        <div key={idx} className="bg-[#202c33] text-gray-100 p-3 self-start max-w-[80%] rounded-r-lg rounded-bl-lg border border-[#25D366]/20 shadow-md">
                          <p className="text-[#25D366] mb-1 font-bold text-xs">{msg.sender}</p>
                          <p>{msg.text}</p>
                          <p className="text-[10px] text-gray-500 mt-2 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                  
                  {isCommsAuthorized && (
                    <div className="p-4 border-t border-[#202c33] bg-[#202c33] flex items-center justify-center">
                       <p className="text-gray-500 text-[10px] font-mono tracking-widest uppercase">Broadcasts are read-only. Standard data charges may apply.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'SECURITY' && (
              <div className="max-w-md mx-auto mt-8 font-mono" style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}>
                <div className="bg-black/80 backdrop-blur-md p-8 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>
                  
                  <div className="text-center mb-6">
                    <h3 className="font-display font-black text-2xl text-white uppercase mb-2">MAINFRAME SECURITY</h3>
                    <p className="text-gray-500 text-[10px] tracking-widest uppercase">&gt; CONFIGURE ACCOUNT CREDENTIAL PROTECTION</p>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Status Badge */}
                    <div className="bg-white/5 border border-white/10 p-4 flex justify-between items-center">
                      <span className="text-xs text-gray-400">SHIELD STATUS:</span>
                      {teamsData.some(t => t.twoFactorEnabled) ? (
                        <span className="text-xs text-neon-cyan font-bold tracking-widest animate-pulse select-none">
                          [ SECURED_2FA ]
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 font-bold tracking-widest select-none animate-[pulse_2s_infinite]">
                          [ SHIELD_DEGRADED ]
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-400 leading-relaxed">
                      Two-Factor Authentication adds an extra layer of protection to your squad control room. When enabled, logging in will require entering a 6-digit OTP code sent to your leader email address <span className="text-neon-cyan">{userEmail}</span>.
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggle2FA(!teamsData.some(t => t.twoFactorEnabled))}
                      className={`w-full py-4 border font-bold tracking-[0.2em] transition-all duration-300 text-xs flex items-center justify-center uppercase ${
                        teamsData.some(t => t.twoFactorEnabled)
                          ? "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          : "bg-neon-cyan/10 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                      }`}
                      style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                    >
                      {teamsData.some(t => t.twoFactorEnabled) ? "DISABLE TWO-FACTOR" : "ENABLE TWO-FACTOR"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </>
        )}
        </div>
      </main>
      <Footer />
    </>
  );
}
