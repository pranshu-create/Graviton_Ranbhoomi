"use client";

import { useState, Fragment, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShieldAlert, Users, Database, Terminal, CheckCircle, CheckCircle2, XCircle, Trash2, Send, Download, Power, Cpu, ChevronDown, ChevronUp, Eye, X, ScanLine, Activity, UserCog, Skull, LogOut, Zap, Trophy, Wrench } from "lucide-react";
import GlitchText from "@/components/GlitchText";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import QRScanner from "@/components/QRScanner";
import StoryGenerator from "@/components/StoryGenerator";
import CoreIdGenerator from "@/components/CoreIdGenerator";
import { eventsData } from "@/data/events";
import { getPusherClient } from '@/lib/pusherClient';
import dynamic from 'next/dynamic';
import JarvisOverlay from '@/components/JarvisOverlay';

const AnalyticsReport = dynamic(() => import('@/components/AnalyticsReport'), { ssr: false });

// MOCK DATA FALLBACK
const initialTeams = [
  {
    id: "T-001", name: "Alpha Squad", event: "ROBO RACE", institution: "IIT Bombay", members: 4, status: "VERIFIED", date: "2026-10-12",
    screenshot: null,
    memberDetails: [
      { role: "Leader", name: "Aarav Sharma", email: "aarav@iitb.ac.in", phone: "+91 9876543210" },
      { role: "Member", name: "Riya Patel", email: "riya@iitb.ac.in" },
      { role: "Member", name: "Rohan Gupta", email: "rohan@iitb.ac.in" },
      { role: "Member", name: "Neha Singh", email: "neha@iitb.ac.in" }
    ]
  },
  {
    id: "T-002", name: "Mech Warriors", event: "ROBO SOCCER", institution: "NMIMS Indore", members: 4, status: "PENDING", date: "2026-10-13",
    screenshot: "mock-screenshot-1.png",
    memberDetails: [
      { role: "Leader", name: "Vikram Rathore", email: "vikram@nmims.edu", phone: "+91 9123456789" },
      { role: "Member", name: "Aditi Desai", email: "aditi@nmims.edu" },
      { role: "Member", name: "Karan Mehta", email: "karan@nmims.edu" },
      { role: "Member", name: "Sneha Kapoor", email: "sneha@nmims.edu" }
    ]
  },
  {
    id: "T-003", name: "Cybernetics", event: "LINE FOLLOWER", institution: "BITS Pilani", members: 3, status: "VERIFIED", date: "2026-10-14",
    screenshot: null,
    memberDetails: [
      { role: "Leader", name: "Ishaan Verma", email: "ishaan@bits.edu", phone: "+91 9988776655" },
      { role: "Member", name: "Kavya Iyer", email: "kavya@bits.edu" },
      { role: "Member", name: "Arjun Nair", email: "arjun@bits.edu" }
    ]
  },
  {
    id: "T-004", name: "Null Pointers", event: "HACKATHON", institution: "VIT Vellore", members: 4, status: "FAILED", date: "2026-10-14",
    screenshot: "mock-screenshot-2.png",
    memberDetails: [
      { role: "Leader", name: "Rahul Das", email: "rahul@vit.ac.in", phone: "+91 9871234560" },
      { role: "Member", name: "Pooja Reddy", email: "pooja@vit.ac.in" },
      { role: "Member", name: "Amit Kumar", email: "amit@vit.ac.in" },
      { role: "Member", name: "Sonal Jain", email: "sonal@vit.ac.in" }
    ]
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-electric-purple/50 p-4 font-mono text-xs shadow-[0_0_15px_rgba(184,41,234,0.3)]">
        <p className="text-white font-bold mb-2 text-sm uppercase tracking-widest">{label}</p>
        <p className="text-neon-cyan text-sm">Collection: ₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function SuperAdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [viewingScreenshot, setViewingScreenshot] = useState(null);
  const scannerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("DATABASE");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSummary, setAiSummary] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState({});

  // Boot Sequence
  const [filterEvent, setFilterEvent] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // System Config State
  const [isLockdown, setIsLockdown] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [frozenEvents, setFrozenEvents] = useState([]);
  const [globalMessage, setGlobalMessage] = useState("");
  const [commsMessage, setCommsMessage] = useState("");
  const [adminSchedule, setAdminSchedule] = useState({ day1: [], day2: [] });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  const [blastSubject, setBlastSubject] = useState("");
  const [blastMessage, setBlastMessage] = useState("");
  const [blastTarget, setBlastTarget] = useState("ALL_VERIFIED");
  const [blastEvent, setBlastEvent] = useState("");
  const [isSendingBlast, setIsSendingBlast] = useState(false);
  const [blastResult, setBlastResult] = useState("");
  
  const [isSendingNoShow, setIsSendingNoShow] = useState(false);

  // Diagnostics State
  const [isBooting, setIsBooting] = useState(true);
  const [bootLog, setBootLog] = useState([]);
  const [metrics, setMetrics] = useState({ latency: 24, mem: 42, cpu: 12 });
  const [logs, setLogs] = useState([
    "[SYSTEM] Core initialized.",
    "[SYNC] Database connection stable."
  ]);

  const [scanResult, setScanResult] = useState(null);

  const hostelScannerRef = useRef(null);
  const [hostelScanResult, setHostelScanResult] = useState(null);
  const [hostelScannedLogs, setHostelScannedLogs] = useState([]);

  // Map nodes state
  const [mapNodes, setMapNodes] = useState([]);

  // JARVIS State
  const [isJarvisOpen, setIsJarvisOpen] = useState(false);

  const cutCorners = { clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" };
  const extremeCut = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  const [adminUser, setAdminUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Admin specific states
  const [adminsList, setAdminsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [sponsorsList, setSponsorsList] = useState([]);
  const [logsList, setLogsList] = useState([]);
  const [accommodationsList, setAccommodationsList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [filterHostelGender, setFilterHostelGender] = useState("ALL");
  const [arenaList, setArenaList] = useState([]);
  const [newUserRole, setNewUserRole] = useState("ADMIN");

  // Arena Scoring States
  const [selectedScoringEvent, setSelectedScoringEvent] = useState("Robo Race");
  const [systemBrackets, setSystemBrackets] = useState({});
  const [showRaceLeaderboard, setShowRaceLeaderboard] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [scoringTeamId, setScoringTeamId] = useState("");
  const [scoringDriverName, setScoringDriverName] = useState("");
  const [scoringAttemptNumber, setScoringAttemptNumber] = useState(1);
  const [scoringInitialTime, setScoringInitialTime] = useState("");
  const [scoringOffTracks, setScoringOffTracks] = useState(0);
  const [scoringHandTouches, setScoringHandTouches] = useState(0);
  const [scoringSkips, setScoringSkips] = useState(0);
  const [isSubmittingRun, setIsSubmittingRun] = useState(false);

  // Robo Soccer / Sumo Match Scoring States
  const [matchIdInput, setMatchIdInput] = useState("");
  const [roundInput, setRoundInput] = useState("Round 1");
  const [matchTeam1Id, setMatchTeam1Id] = useState("");
  const [matchTeam2Id, setMatchTeam2Id] = useState("");
  const [matchTeam1Goals, setMatchTeam1Goals] = useState(0);
  const [matchTeam2Goals, setMatchTeam2Goals] = useState(0);
  const [matchTeam1Status, setMatchTeam1Status] = useState("QUALIFIED");
  const [matchTeam2Status, setMatchTeam2Status] = useState("QUALIFIED");
  const [matchPenalties, setMatchPenalties] = useState("");
  const [matchWinnerId, setMatchWinnerId] = useState("");
  const [matchStatus, setMatchStatus] = useState("UPCOMING");
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);

  // AI Screener States
  const [selectedScreenerTeamId, setSelectedScreenerTeamId] = useState("");



  // Fetch admin profile
  useEffect(() => {
    fetch("/api/admin/me").then(r => r.json()).then(data => {
      if (data.success && data.user) {
        setAdminUser(data.user);
        setIsLoadingAuth(false);
        const isHostelStaff = ["BOYS_HOSTEL_SECURITY", "GIRLS_HOSTEL_SECURITY", "HOSTEL_AUTHORITY", "HOSTEL_STAFF"].includes(data.user.role);

        if (isHostelStaff) {
          setActiveTab("HOSTEL_SCANNER");
        }

        if (data.user.role === 'SUPER_ADMIN') {
          fetch('/api/admin/users').then(r => r.json()).then(d => setAdminsList(d.users || []));
        }
        if (data.user.role !== 'VOLUNTEER' && !isHostelStaff) {
          fetch('/api/admin/logs').then(r => r.json()).then(d => setLogsList(d.logs || []));
          fetch('/api/admin/expenses').then(r => r.json()).then(d => setExpensesList(d.expenses || []));
        }
        if (data.user.role !== 'VOLUNTEER') {
          fetch('/api/accommodation').then(r => r.json()).then(d => {
            setAccommodationsList(d.requests || []);
            const checkedIn = (d.requests || []).filter(a => a.isCheckedIn).sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
            setHostelScannedLogs(checkedIn);
          });
        }
        fetch('/api/admin/events').then(r => r.json()).then(d => {
          const list = d.events || [];
          setEventsList(list);
          if (data.user?.role === "VOLUNTEER" && data.user?.assignedEvent) {
            const eventObj = list.find(e => e.id === data.user.assignedEvent);
            if (eventObj) {
              setSelectedScoringEvent(eventObj.name);
            }
          }
        });
        fetch('/api/admin/sponsors').then(r => r.json()).then(d => setSponsorsList(d.sponsors || []));
        fetch('/api/admin/arena').then(r => r.json()).then(d => setArenaList(d.arenas || []));
      } else {
        window.location.href = "/admin-login";
      }
    }).catch(() => {
      window.location.href = "/admin-login";
    });
  }, []);

  // Real-time Logs & Updates via Pusher
  useEffect(() => {
    let pusherClient;
    let channel;

    const handleHostel = (newAllocation) => {
      setHostelScannedLogs(prev => {
        if (prev.find(log => log.qrCodeId === newAllocation.qrCodeId)) return prev;
        return [newAllocation, ...prev];
      });
    };

    const handleEventScan = (updatedTeam) => {
      setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] Live Scan: ${updatedTeam.name} marked Present.`, ...prev.slice(0, 4)]);
    };

    const handleSystemUpdate = (config) => {
      if (config.isLockdown !== undefined) setIsLockdown(config.isLockdown);
      if (config.isMaintenanceMode !== undefined) setIsMaintenanceMode(config.isMaintenanceMode);
      if (config.frozenEvents) setFrozenEvents(config.frozenEvents);
      if (config.globalMessage !== undefined) setGlobalMessage(config.globalMessage);
      if (config.mapNodes) setMapNodes(config.mapNodes);
      if (config.brackets !== undefined) setSystemBrackets(config.brackets);
      if (config.showRaceLeaderboard !== undefined) setShowRaceLeaderboard(config.showRaceLeaderboard);
      if (config.schedule !== undefined) setAdminSchedule(config.schedule);
    };

    const handleArenaUpdate = (data) => {
      setArenaList(prev => prev.map(arena => arena.eventId === data.eventId ? { ...arena, status: data.status, checklist: data.checklist } : arena));
    };

    const handleScoringUpdate = (data) => {
      fetch("/api/system").then(res => res.json()).then(d => {
        if (d.success && d.config) {
          setSystemBrackets(d.config.brackets || {});
          setShowRaceLeaderboard(d.config.showRaceLeaderboard || false);
        }
      });
      fetch("/api/teams").then(res => res.json()).then(d => {
        if (d.teams) setTeams(d.teams);
      });
    };

    const setupPusher = async () => {
      pusherClient = await getPusherClient();
      if (!pusherClient) return;

      channel = pusherClient.subscribe("god-mode-channel");
      
      channel.bind("hostel-allocation", handleHostel);
      channel.bind("event-scan", handleEventScan);
      channel.bind("system-update", handleSystemUpdate);
      channel.bind("arena-update", handleArenaUpdate);
      channel.bind("scoring-update", handleScoringUpdate);
    };

    setupPusher();

    return () => {
      if (channel) {
        channel.unbind("hostel-allocation", handleHostel);
        channel.unbind("event-scan", handleEventScan);
        channel.unbind("system-update", handleSystemUpdate);
        channel.unbind("arena-update", handleArenaUpdate);
        channel.unbind("scoring-update", handleScoringUpdate);
      }
    };
  }, []);

  // Force default tab for volunteers or hostel staff
  useEffect(() => {
    if (adminUser) {
      setTimeout(() => {
        if (adminUser.role === 'VOLUNTEER') setActiveTab('SCANNER');
        else if (adminUser.role === 'HOSTEL_STAFF') setActiveTab('HOSTEL');
        else if (['BOYS_HOSTEL_SECURITY', 'GIRLS_HOSTEL_SECURITY', 'HOSTEL_AUTHORITY'].includes(adminUser.role)) setActiveTab('HOSTEL_SCANNER');
      }, 0);
    }
  }, [adminUser]);

  // Initial load
  useEffect(() => {
    if (!adminUser) return;
    fetch("/api/system").then(res => res.json()).then(data => {
      if (data.success && data.config) {
        setGlobalMessage(data.config.globalMessage || "");
      }
    }).catch(console.error);
  }, [adminUser]);

  // Fetch teams and system config from backend
  useEffect(() => {
    if (!adminUser) return;
    const fetchData = async () => {
      try {
        const resTeams = await fetch("/api/teams");
        const dataTeams = await resTeams.json();
        if (dataTeams.teams) {
          setTeams(dataTeams.teams);
        }

        const resSystem = await fetch("/api/system");
        const dataSystem = await resSystem.json();
        if (dataSystem.success && dataSystem.config) {
          setIsLockdown(dataSystem.config.isLockdown);
          setIsMaintenanceMode(dataSystem.config.isMaintenanceMode || false);
          setFrozenEvents(dataSystem.config.frozenEvents || []);
          setMapNodes(dataSystem.config.mapNodes || []);
          setSystemBrackets(dataSystem.config.brackets || {});
          setShowRaceLeaderboard(dataSystem.config.showRaceLeaderboard || false);
          if (dataSystem.config.schedule) {
            setAdminSchedule(dataSystem.config.schedule);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [adminUser]);

  const toggleLockdown = async () => {
    const newLockdownState = !isLockdown;
    // Optimistic update
    setIsLockdown(newLockdownState);

    try {
      await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLockdown: newLockdownState })
      });
    } catch (err) {
      console.error("Failed to toggle lockdown", err);
      // Revert on error
      setIsLockdown(!newLockdownState);
    }
  };
 
  const toggleLeaderboard = async () => {
    const newVal = !showRaceLeaderboard;
    setShowRaceLeaderboard(newVal);
    try {
      await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showRaceLeaderboard: newVal })
      });
      alert(`[SYSTEM ACTION]: Leaderboard standings ${newVal ? 'RELEASED (VISIBLE)' : 'LOCKED (HIDDEN)'} successfully.`);
    } catch (e) {
      console.error(e);
      setShowRaceLeaderboard(!newVal);
    }
  };

  const toggleMaintenanceMode = async () => {
    const newMaintenanceState = !isMaintenanceMode;
    setIsMaintenanceMode(newMaintenanceState);

    try {
      await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMaintenanceMode: newMaintenanceState })
      });
      if (newMaintenanceState) {
        await fetch("/api/admin/god-mode", { method: 'POST', body: JSON.stringify({ type: 'MAINTENANCE', payload: {} }) });
      }
    } catch (err) {
      console.error("Failed to toggle maintenance mode", err);
      setIsMaintenanceMode(!newMaintenanceState);
    }
  };

  // System Diagnostics & Logs Simulator
  useEffect(() => {
    const simInterval = setInterval(() => {
      setMetrics({
        latency: Math.floor(Math.random() * 30) + 12,
        mem: Math.floor(Math.random() * 15) + 40,
        cpu: Math.floor(Math.random() * 30) + 10,
      });

      if (Math.random() > 0.6) {
        const fakeLogs = [
          "[ALERT] Unauthorized ping from 192.168.x.x dropped.",
          "[SYNC] Optimizing registry data...",
          "[SYS] Node 4 re-calibrated.",
          "[NET] Minor packet loss detected, re-routing.",
          "[AUTH] Super admin session re-validated.",
          "[DEF] Firewall rules updated."
        ];
        const newLog = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
        setLogs(prev => {
          const updated = [...prev, newLog];
          return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
        });
      }
    }, 2500);
    return () => clearInterval(simInterval);
  }, []);

  // Boot Sequence Logic
  useEffect(() => {
    if (!isBooting) return;

    const bootSequence = [
      "INITIATING OVERWATCH PROTOCOL...",
      "BYPASSING MAINFRAME FIREWALLS...",
      "DECRYPTING SECURE CHANNELS...",
      "ESTABLISHING DATABASE UPLINK...",
      "SYNCING REGISTRY DATA...",
      "ACCESS GRANTED."
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setBootLog(prev => [...prev, bootSequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsBooting(false), 500);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isBooting]);

  const handleVerify = useCallback(async (team) => {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.teamId || team.id, action: "VERIFY" })
      });
      const data = await res.json();
      if (data.success) {
        setTeams(teams.map(t => (t.teamId === team.teamId || t.id === team.id) ? { ...t, status: "VERIFIED" } : t));
        alert(`[SYSTEM ACTION]: Payment Verified.\n\nAutomated Confirmation Email successfully dispatched.`);
      } else {
        alert("Verification failed");
      }
    } catch (err) {
      alert("Error connecting to backend");
    }
  }, [teams]);

  const handleResendReceipt = async (team) => {
    if (!confirm(`Are you sure you want to resend the GST Receipt to ${team.name}?`)) return;
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.teamId || team.id, action: "RESEND_RECEIPT" })
      });
      const data = await res.json();
      if (data.success) {
        alert(`[SYSTEM ACTION]: Receipt Resent.\n\nAutomated Confirmation Email successfully dispatched to leader.`);
      } else {
        alert("Failed to resend receipt: " + data.error);
      }
    } catch (err) {
      alert("Error connecting to backend");
    }
  };

  const handleReject = useCallback(async (team) => {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.teamId || team.id, action: "REJECT" })
      });
      const data = await res.json();
      if (data.success) {
        setTeams(teams.map(t => (t.teamId === team.teamId || t.id === team.id) ? { ...t, status: "FAILED" } : t));
        alert(`[SYSTEM ACTION]: Payment Rejected.\n\nRejection Email successfully dispatched to leader.`);
      }
    } catch (err) {
      console.error(err);
    }
  }, [teams]);

  const handleDisqualify = async (team) => {
    if (!confirm(`Are you absolutely sure you want to DISQUALIFY ${team.name}? This is a destructive action.`)) return;
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.teamId || team.id, action: "DISQUALIFY" })
      });
      const data = await res.json();
      if (data.success) {
        setTeams(teams.map(t => (t.teamId === team.teamId || t.id === team.id) ? { ...t, status: "DISQUALIFIED" } : t));
        alert(`[SYSTEM ACTION]: ${team.name} has been DISQUALIFIED.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFreeze = async (eventName) => {
    const isFrozen = frozenEvents.includes(eventName);
    const newFrozenEvents = isFrozen
      ? frozenEvents.filter(e => e !== eventName)
      : [...frozenEvents, eventName];

    setFrozenEvents(newFrozenEvents);
    try {
      await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frozenEvents: newFrozenEvents })
      });
    } catch (err) {
      console.error(err);
      setFrozenEvents(frozenEvents); // Revert
    }
  };

  const handleUpdateGlobalMessage = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalMessage })
      });
      alert("Global broadcast updated.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    try {
      const res = await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: adminSchedule })
      });
      const data = await res.json();
      if (data.success) {
        alert("[SYSTEM ACTION]: Event schedule protocols successfully updated and broadcasted.");
      } else {
        alert("Failed to save schedule: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred while saving schedule.");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleUpdateMapNode = async (id, field, value) => {
    const updatedNodes = mapNodes.map(node =>
      node.id === id ? { ...node, [field]: value } : node
    );
    setMapNodes(updatedNodes); // optimistic update

    try {
      await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapNodes: updatedNodes })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendCommsMessage = async (e) => {
    e.preventDefault();
    if (!commsMessage.trim()) return;

    try {
      const res = await fetch("/api/comms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commsMessage, sender: "OVERWATCH_HQ" }),
      });
      if (res.ok) {
        setCommsMessage("");
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] COMMS Broadcast Sent.`, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBlast = async (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to launch this blast?")) return;
    
    setIsSendingBlast(true);
    setBlastResult("");
    try {
      const res = await fetch("/api/admin/blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: blastSubject,
          message: blastMessage,
          target: blastTarget,
          event: blastEvent
        })
      });
      const data = await res.json();
      if (data.success) {
        setBlastResult(`✅ Blast delivered to ${data.sent} operatives.`);
        setBlastSubject("");
        setBlastMessage("");
      } else {
        setBlastResult(`❌ Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setBlastResult("❌ Connection Error");
    } finally {
      setIsSendingBlast(false);
    }
  };

  const handleNoShowAlerts = async () => {
    if (!confirm("Are you sure? This will send 'Missing In Action' emails to ALL verified teams that have not checked in.")) return;
    setIsSendingNoShow(true);
    try {
      const res = await fetch("/api/admin/no-show", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully sent ${data.sent} No-Show alerts.`);
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Connection error while sending alerts.");
    } finally {
      setIsSendingNoShow(false);
    }
  };

  const handleGhostLogin = (team) => {
    const leaderEmail = team.memberDetails.find(m => m.role === "Leader")?.email;
    if (leaderEmail) {
      localStorage.setItem("userEmail", leaderEmail);
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("auth-change"));
      window.open("/dashboard", "_blank");
    } else {
      alert("No leader email found to impersonate.");
    }
  };

  const handleQRScan = async (decodedText) => {
    let teamId = decodedText;
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.teamId) teamId = parsed.teamId;
    } catch (e) {
      // If it's not JSON, assume the text itself is the ID
    }

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId })
      });
      const data = await res.json();
      if (data.success) {
        setScanResult({ success: true, message: `Access Granted to ${data.team.name}!`, team: data.team });
        setTeams(teams.map(t => t.id === teamId ? { ...t, isPresent: true } : t));
      } else {
        setScanResult({ success: false, message: data.error });
      }
    } catch (err) {
      setScanResult({ success: false, message: "Scanner API Error" });
    }
  };

  const handleHostelQRScan = async (decodedText) => {
    let qrCodeId = decodedText;
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.qrCodeId) qrCodeId = parsed.qrCodeId;
      // Fallback if needed
      else if (parsed.teamId && parsed.memberName) qrCodeId = `${parsed.teamId}-${parsed.memberName}`;
    } catch (e) {
      // Not JSON
    }

    try {
      const res = await fetch("/api/accommodation/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId,
          scannedByEmail: adminUser?.email || "admin",
          actionType: "IN"
        })
      });
      const data = await res.json();

      if (data.success) {
        setHostelScanResult({
          success: true,
          message: data.message,
          acc: data.data,
          rules: data.rules
        });

        if (data.message !== "ALREADY EQUIPPED") {
          setHostelScannedLogs(prev => [data.data, ...prev]);
        }
      } else {
        setHostelScanResult({ success: false, message: data.error });
      }
    } catch (err) {
      console.error(err);
      setHostelScanResult({ success: false, message: "Network Error" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("CRITICAL WARNING: This will permanently eradicate the operative's data. Proceed?")) return;
    try {
      const res = await fetch("/api/admin/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: id })
      });
      const data = await res.json();
      if (data.success) {
        setTeams(teams.filter(t => t.id !== id));
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ALERT: Operative data purged.`, ...prev.slice(0, 4)]);
      } else {
        alert("Eradication Failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Connection error during eradication.");
    }
  };

  const handleExportCSV = () => {
    if (teams.length === 0) return alert("No data to export");

    const headers = ["Team ID", "Team Name", "Event", "Institution", "Status", "Date", "Leader Name", "Leader Email", "Leader Phone", "Member 2", "Member 3", "Member 4"];

    const csvRows = teams.map(team => {
      const leader = team.memberDetails.find(m => m.role === "Leader") || {};
      const members = team.memberDetails.filter(m => m.role !== "Leader");

      return [
        team.id,
        `"${team.name}"`,
        `"${team.event || "UNKNOWN"}"`,
        `"${team.institution}"`,
        team.status,
        new Date(team.date).toLocaleDateString(),
        `"${leader.name || ""}"`,
        `"${leader.email || ""}"`,
        `"${leader.phone || ""}"`,
        `"${members[0]?.name || ""}"`,
        `"${members[1]?.name || ""}"`,
        `"${members[2]?.name || ""}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ranbhoomi_teams_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin-login';
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const handleAnalyze = useCallback(async (team) => {
    setIsAnalyzing(prev => ({ ...prev, [team.id]: true }));
    try {
      const res = await fetch("/api/admin/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team })
      });
      const data = await res.json();
      if (data.success) {
        setAiSummary(prev => ({ ...prev, [team.id]: data.summary }));
      } else {
        setAiSummary(prev => ({ ...prev, [team.id]: "ERR: AI UPLINK FAILED" }));
      }
    } catch (err) {
      setAiSummary(prev => ({ ...prev, [team.id]: "ERR: CONNECTION LOST" }));
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [team.id]: false }));
    }
  }, []);

  // Keyboard hotkeys for AI Screener tab
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab === "AI_SCREENER" && selectedScreenerTeamId) {
        const teamObj = teams.find(t => t.id === selectedScreenerTeamId || t._id === selectedScreenerTeamId);
        if (!teamObj) return;

        if (e.key === "F1") {
          e.preventDefault();
          const pendingTeams = teams.filter(t => t.status === "PENDING");
          const currentIndex = pendingTeams.findIndex(t => t.id === teamObj.id);
          handleVerify(teamObj).then(() => {
            if (pendingTeams.length > 1) {
              const nextIndex = (currentIndex + 1) % pendingTeams.length;
              const nextTeam = pendingTeams[nextIndex];
              setSelectedScreenerTeamId(nextTeam.id);
              if (!aiSummary[nextTeam.id] && !isAnalyzing[nextTeam.id]) {
                handleAnalyze(nextTeam);
              }
            } else {
              setSelectedScreenerTeamId("");
            }
          });
        } else if (e.key === "F2") {
          e.preventDefault();
          const pendingTeams = teams.filter(t => t.status === "PENDING");
          const currentIndex = pendingTeams.findIndex(t => t.id === teamObj.id);
          handleReject(teamObj).then(() => {
            if (pendingTeams.length > 1) {
              const nextIndex = (currentIndex + 1) % pendingTeams.length;
              const nextTeam = pendingTeams[nextIndex];
              setSelectedScreenerTeamId(nextTeam.id);
              if (!aiSummary[nextTeam.id] && !isAnalyzing[nextTeam.id]) {
                handleAnalyze(nextTeam);
              }
            } else {
              setSelectedScreenerTeamId("");
            }
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, selectedScreenerTeamId, teams, handleVerify, handleReject, aiSummary, isAnalyzing, handleAnalyze]);

  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  // Filter Logic
  const filteredTeams = teams.filter(team => {
    const matchEvent = filterEvent === "ALL" ||
      (team.event && team.event.trim().toUpperCase() === filterEvent.trim().toUpperCase());

    const matchStatus = filterStatus === "ALL" ||
      (team.status && team.status.trim().toUpperCase() === filterStatus.trim().toUpperCase());

    const matchSearch = searchQuery === "" || 
      (team.name && team.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.institution && team.institution.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.id && team.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.memberDetails?.[0]?.email && team.memberDetails[0].email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchEvent && matchStatus && matchSearch;
  });

  // Duplicate Fraud Detection Logic
  const hashCounts = {};
  teams.forEach(t => {
    if (t.screenshotHash) {
      hashCounts[t.screenshotHash] = (hashCounts[t.screenshotHash] || 0) + 1;
    }
  });

  // Ledger Calculations
  const ledgerData = eventsList.map((event, index) => {
    const feeMatch = event.fees ? event.fees.match(/\d+/) : null;
    const feeAmount = feeMatch ? parseInt(feeMatch[0], 10) : 0;
    const fill = index % 2 === 0 ? '#66FCF1' : '#B829EA';

    // Calculate total revenue for this event by summing the amountPaid
    // Fallback to feeAmount if amountPaid is undefined or 0 (for legacy/mock teams)
    const verifiedTeams = teams.filter(t =>
      (t.event || "ROBO RACE").trim().toUpperCase() === event.name.toUpperCase() &&
      t.status === 'VERIFIED'
    );

    const eventRevenue = verifiedTeams.reduce((sum, t) => sum + (t.amountPaid || feeAmount), 0);

    return {
      name: event.name.substring(0, 8),
      revenue: eventRevenue,
      fill: fill
    };
  });
  const totalRevenue = ledgerData.reduce((acc, curr) => acc + curr.revenue, 0);

  const totalSponsorIncome = sponsorsList.reduce((acc, curr) => acc + (curr.amountInvested || 0), 0);
  const totalExpenses = expensesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netProfit = totalRevenue + totalSponsorIncome - totalExpenses;

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#02050A] text-neon-cyan flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <ShieldAlert className="w-12 h-12 text-electric-purple animate-pulse" />
          <p className="tracking-widest uppercase text-xs">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#02050A] text-neon-cyan font-mono flex flex-col justify-center items-center p-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(102,252,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
        <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>

        <div className="w-full max-w-2xl relative z-20">
          <div className="flex items-center gap-4 mb-8 justify-center">
            <ShieldAlert className="w-12 h-12 text-electric-purple animate-pulse" />
            <h1 className="font-display font-black text-5xl tracking-widest uppercase text-white">OVERWATCH</h1>
          </div>

          <div className="bg-black/80 border border-white/10 p-6 h-64 overflow-hidden flex flex-col justify-end" style={cutCorners}>
            <div className="space-y-2">
              {bootLog.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs tracking-widest uppercase font-bold text-neon-cyan"
                >
                  &gt; {log}
                </motion.div>
              ))}
              <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-3 h-4 bg-neon-cyan inline-block ml-2 align-middle"></motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLockdown ? 'bg-[#1a0505] selection:bg-red-500' : 'bg-[#02050A] selection:bg-neon-cyan'} text-white font-mono flex flex-col md:flex-row overflow-hidden selection:text-black transition-colors duration-700`}>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {viewingScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <div className="bg-white/5 border border-white/10 max-w-3xl w-full p-2 relative" style={cutCorners}>
              <button
                onClick={() => setViewingScreenshot(null)}
                className="absolute top-4 right-4 text-white hover:text-neon-cyan z-10 bg-black/50 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-full aspect-video bg-black/80 flex items-center justify-center flex-col relative border border-white/5 overflow-hidden">
                <img
                  src={viewingScreenshot}
                  alt="Payment Screenshot"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JARVIS OVERLAY - Only for Super Admin */}
      {adminUser?.role === 'SUPER_ADMIN' && (
        <JarvisOverlay 
          isOpen={isJarvisOpen}
          setIsOpen={setIsJarvisOpen}
          systemContext={{
            teams,
            isLockdown,
            activeTab
          }}
          handlers={{
            handleVerify,
            handleReject,
            handleDisqualify,
            toggleLockdown,
            toggleMaintenanceMode,
            handleToggleFreeze,
            setActiveTab,
            handleExportCSV,
            toggleLeaderboard
          }}
        />
      )}

      {/* SIDEBAR: CONTROL PANEL */}
      <aside className={`w-full md:w-80 border-r ${isLockdown ? 'border-red-500/50 bg-black/90' : 'border-white/10 bg-black/80'} backdrop-blur-md flex flex-col h-screen overflow-y-auto z-20 transition-colors duration-700`}>

        {/* Header */}
        <div className={`p-6 border-b ${isLockdown ? 'border-red-500/50' : 'border-white/10'} flex items-center gap-4`}>
          <div className={`w-10 h-10 ${isLockdown ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-electric-purple/20 border-electric-purple shadow-[0_0_15px_rgba(184,41,234,0.4)]'} border flex items-center justify-center transition-all duration-700`} style={cutCorners}>
            <ShieldAlert className={`w-5 h-5 ${isLockdown ? 'text-red-500 animate-pulse' : 'text-electric-purple'}`} />
          </div>
          <div>
            <h1 className="font-display font-black text-xl tracking-wider uppercase text-white"><GlitchText text="OVERWATCH" /></h1>
            <p className={`text-[9px] uppercase tracking-[0.3em] ${isLockdown ? 'text-red-500 animate-pulse' : 'text-electric-purple'}`}>&gt; SUPER_ADMIN_ACCESS</p>
          </div>
        </div>

        {/* Lockdown Control */}
        {adminUser?.role === 'SUPER_ADMIN' && (
          <div className={`p-6 border-b ${isLockdown ? 'border-red-500/50' : 'border-white/10'}`}>
            <button
              onClick={toggleLockdown}
              className={`w-full py-4 text-xs tracking-[0.2em] uppercase font-bold transition-all flex justify-center gap-2 items-center border ${isLockdown ? "border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10" : "border-red-500/50 text-red-500 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"}`}
              style={cutCorners}
            >
              <Power className={`w-4 h-4 ${isLockdown ? '' : 'animate-pulse'}`} />
              {isLockdown ? "RESTORE NORMAL OPS" : "INITIATE LOCKDOWN"}
            </button>
            <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-widest font-mono">
              <span className="text-gray-500">MAINTENANCE_MODE:</span>
              <span className={isMaintenanceMode ? "text-orange-500 font-bold animate-pulse" : "text-gray-500"}>
                {isMaintenanceMode ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>
          </div>
        )}

        {/* Authoritative Overrides */}
        {adminUser?.role === 'SUPER_ADMIN' && (
          <div className={`p-6 border-b ${isLockdown ? 'border-red-500/50' : 'border-white/10'}`}>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" /> DIRECTIVES
            </h3>

            {/* Global Broadcast */}
            <form onSubmit={handleUpdateGlobalMessage} className="mb-4">
              <label className="text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Global Broadcast:</label>
              <div className="flex gap-2">
                <input type="text" value={globalMessage} onChange={(e) => setGlobalMessage(e.target.value)} className="w-full bg-black/50 border border-white/20 p-2 text-xs focus:border-electric-purple focus:outline-none text-white" placeholder="Enter banner message..." />
                <button type="submit" className="bg-electric-purple/20 text-electric-purple border border-electric-purple p-2 hover:bg-electric-purple hover:text-white transition-colors" title="Broadcast Banner"><Send className="w-3 h-3" /></button>
              </div>
            </form>

            {/* WhatsApp Comms Terminal */}
            <form onSubmit={handleSendCommsMessage} className="mb-4">
              <label className="text-[9px] text-[#25D366] uppercase tracking-widest block mb-1">WhatsApp Comms Bridge:</label>
              <div className="flex gap-2">
                <input type="text" value={commsMessage} onChange={(e) => setCommsMessage(e.target.value)} className="w-full bg-black/50 border border-[#25D366]/30 p-2 text-xs focus:border-[#25D366] focus:outline-none text-white" placeholder="Send to WhatsApp Bridge..." />
                <button type="submit" className="bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/50 p-2 hover:bg-[#25D366] hover:text-black transition-colors" title="Send Comms"><Send className="w-3 h-3" /></button>
              </div>
            </form>

            {/* Event Freeze Toggles */}
            <div className="space-y-2 mb-4">
              <label className="text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Event Freeze Status:</label>
              {['Robo Soccer', 'Robo Race', 'Line Follower', 'Robo Sumo', 'Hackathon'].map(evt => (
                <label key={evt} className="flex items-center gap-2 text-[10px] uppercase tracking-wider cursor-pointer group">
                  <input type="checkbox" checked={frozenEvents.includes(evt)} onChange={() => handleToggleFreeze(evt)} className="appearance-none w-3 h-3 border border-white/20 checked:bg-blue-500 checked:border-blue-500 transition-colors" />
                  <span className={`transition-colors ${frozenEvents.includes(evt) ? 'text-blue-400 font-bold' : 'text-gray-400 group-hover:text-white'}`}>{evt}</span>
                </label>
              ))}
            </div>
 
            {/* Leaderboard Standings Release Toggle */}
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <label className="text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Standings Gatekeeper:</label>
              <button
                type="button"
                onClick={toggleLeaderboard}
                className={`w-full py-2.5 text-[10px] tracking-widest uppercase font-bold transition-all flex justify-center gap-2 items-center border ${
                  showRaceLeaderboard
                    ? "border-green-500/50 text-green-500 hover:bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                }`}
                style={cutCorners}
              >
                <Zap className="w-3.5 h-3.5" />
                {showRaceLeaderboard ? "STANDINGS RELEASED" : "STANDINGS HIDDEN"}
              </button>
            </div>

          </div>
        )}

        {/* Live Diagnostics */}
        {adminUser?.role === 'SUPER_ADMIN' && (
          <div className={`p-6 border-b ${isLockdown ? 'border-red-500/50' : 'border-white/10'}`}>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Cpu className="w-3 h-3" /> SYSTEM_DIAGNOSTICS
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">DB_LATENCY</span>
                <span className={isLockdown ? 'text-red-500' : 'text-neon-cyan'}>{metrics.latency}ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">MEM_ALLOC</span>
                <span className={isLockdown ? 'text-red-500' : 'text-neon-cyan'}>{metrics.mem}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">CPU_LOAD</span>
                <span className={isLockdown ? 'text-red-500' : 'text-neon-cyan'}>{metrics.cpu}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 mt-2 overflow-hidden">
                <motion.div
                  className={`h-full ${isLockdown ? 'bg-red-500' : 'bg-neon-cyan'}`}
                  animate={{ width: `${metrics.cpu}%` }}
                  transition={{ ease: "linear", duration: 2.5 }}
                />
              </div>
            </div>

            {/* Threat Level */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-1">THREAT LEVEL</span>
              <div className={`flex items-center gap-2 ${isLockdown ? 'text-red-500' : 'text-neon-cyan'}`}>
                <ShieldAlert className={`w-4 h-4 ${isLockdown ? 'animate-ping' : ''}`} />
                <span className="text-xs font-bold tracking-widest uppercase">
                  {isLockdown ? <GlitchText text="DEFCON 1 - CRITICAL" /> : 'DEFCON 5 - NORMAL'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Tasks */}
        <div className="p-6">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Terminal className="w-3 h-3" /> GLOBAL_TASKS
          </h3>

          {['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'].includes(adminUser?.role) && (
            <button onClick={() => setActiveTab("DATABASE")} className={`w-full py-3 ${activeTab === "DATABASE" ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(102,252,241,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <Database className="w-3 h-3" /> {activeTab === "DATABASE" ? <GlitchText text="REGISTRY" /> : "REGISTRY"}
            </button>
          )}

          {['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'].includes(adminUser?.role) && (
            <button onClick={() => setActiveTab("ARENA_SCORING")} className={`w-full py-3 ${activeTab === "ARENA_SCORING" ? 'bg-orange-500/20 border border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <Trophy className="w-3 h-3" /> {activeTab === "ARENA_SCORING" ? <GlitchText text="ARENA SCORING" /> : "ARENA SCORING"}
            </button>
          )}

          {['SUPER_ADMIN', 'ADMIN'].includes(adminUser?.role) && (
            <button onClick={() => {
              setActiveTab("AI_SCREENER");
              const pendingTeams = teams.filter(t => t.status === "PENDING");
              if (pendingTeams.length > 0 && !selectedScreenerTeamId) {
                const firstTeam = pendingTeams[0];
                setSelectedScreenerTeamId(firstTeam.id);
                if (!aiSummary[firstTeam.id] && !isAnalyzing[firstTeam.id]) {
                  handleAnalyze(firstTeam);
                }
              }
            }} className={`w-full py-3 ${activeTab === "AI_SCREENER" ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(102,252,241,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <ScanLine className="w-3 h-3" /> {activeTab === "AI_SCREENER" ? <GlitchText text="AI SCREENER" /> : "AI SCREENER"}
            </button>
          )}

          {['SUPER_ADMIN', 'ADMIN'].includes(adminUser?.role) && (
            <button onClick={() => setActiveTab("LEDGER")} className={`w-full py-3 ${activeTab === "LEDGER" ? 'bg-electric-purple/20 border border-electric-purple text-electric-purple shadow-[0_0_15px_rgba(184,41,234,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <Activity className="w-3 h-3" /> {activeTab === "LEDGER" ? <GlitchText text="LEDGER" /> : "LEDGER"}
            </button>
          )}

          {['SUPER_ADMIN', 'ADMIN'].includes(adminUser?.role) && (
            <button onClick={() => setActiveTab("MISSION_CONTROL")} className={`w-full py-3 ${activeTab === "MISSION_CONTROL" ? 'bg-red-500/20 border border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <ShieldAlert className="w-3 h-3" /> {activeTab === "MISSION_CONTROL" ? <GlitchText text="MISSION CONTROL" /> : "MISSION CONTROL"}
            </button>
          )}

          {adminUser?.role === 'VOLUNTEER' && adminUser?.assignedEvent && (
            <button onClick={() => setActiveTab("ARENA_SETUP")} className={`w-full py-3 ${activeTab === "ARENA_SETUP" ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <Wrench className="w-3 h-3" /> {activeTab === "ARENA_SETUP" ? <GlitchText text="ARENA SETUP" /> : "ARENA SETUP"}
            </button>
          )}

          {['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER'].includes(adminUser?.role) && (
            <button onClick={() => setActiveTab("SCANNER")} className={`w-full py-3 ${activeTab === "SCANNER" ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <ScanLine className="w-3 h-3" /> {activeTab === "SCANNER" ? <GlitchText text="SCANNER" /> : "SCANNER"}
            </button>
          )}

          {['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER', 'HOSTEL_STAFF', 'BOYS_HOSTEL_SECURITY', 'GIRLS_HOSTEL_SECURITY', 'HOSTEL_AUTHORITY'].includes(adminUser?.role) && (
            <button onClick={() => setActiveTab("HOSTEL_SCANNER")} className={`w-full py-3 ${activeTab === "HOSTEL_SCANNER" ? 'bg-orange-500/20 border border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <ScanLine className="w-3 h-3" /> {activeTab === "HOSTEL_SCANNER" ? <GlitchText text="HOSTEL SCANNER" /> : "HOSTEL SCANNER"}
            </button>
          )}

          {['SUPER_ADMIN', 'ADMIN', 'HOSTEL_STAFF', 'HOSTEL_AUTHORITY'].includes(adminUser?.role) && (
            <button onClick={() => setActiveTab("HOSTEL")} className={`w-full py-3 ${activeTab === "HOSTEL" ? 'bg-blue-500/20 border border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <Users className="w-3 h-3" /> {activeTab === "HOSTEL" ? <GlitchText text="HOSTEL OPS" /> : "HOSTEL OPS"}
            </button>
          )}

          {adminUser?.role === 'SUPER_ADMIN' && (
            <button onClick={() => setActiveTab("ADMINS")} className={`w-full py-3 ${activeTab === "ADMINS" ? 'bg-green-500/20 border border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
              <Users className="w-3 h-3" /> {activeTab === "ADMINS" ? <GlitchText text="ADMINS" /> : "ADMINS"}
            </button>
          )}

          {['SUPER_ADMIN', 'ADMIN'].includes(adminUser?.role) && (
            <>
              <button onClick={() => setActiveTab("SPONSORS")} className={`w-full py-3 ${activeTab === "SPONSORS" ? 'bg-pink-500/20 border border-pink-500 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
                <Activity className="w-3 h-3" /> {activeTab === "SPONSORS" ? <GlitchText text="SPONSORS" /> : "SPONSORS"}
              </button>

              <button onClick={() => setActiveTab("MAP")} className={`w-full py-3 ${activeTab === "MAP" ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
                <Activity className="w-3 h-3" /> {activeTab === "MAP" ? <GlitchText text="TACTICAL MAP" /> : "TACTICAL MAP"}
              </button>

              <button onClick={() => setActiveTab("SCHEDULE")} className={`w-full py-3 ${activeTab === "SCHEDULE" ? 'bg-orange-500/20 border border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-2`} style={cutCorners}>
                <Activity className="w-3 h-3" /> {activeTab === "SCHEDULE" ? <GlitchText text="SCHEDULE MANAGER" /> : "SCHEDULE MANAGER"}
              </button>
            </>
          )}

          {adminUser?.role === 'SUPER_ADMIN' && (
            <>
              <button onClick={() => setActiveTab("LOGS")} className={`w-full py-3 ${activeTab === "LOGS" ? 'bg-orange-500/20 border border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-4`} style={cutCorners}>
                <Terminal className="w-3 h-3" /> {activeTab === "LOGS" ? <GlitchText text="AUDIT LOGS" /> : "AUDIT LOGS"}
              </button>

              <button onClick={() => setActiveTab("CORE_ID")} className={`w-full py-3 ${activeTab === "CORE_ID" ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(102,252,241,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-4`} style={cutCorners}>
                <ShieldAlert className="w-3 h-3" /> {activeTab === "CORE_ID" ? <GlitchText text="CORE ID GEN" /> : "CORE ID GEN"}
              </button>

              <button onClick={() => setActiveTab("GOD_MODE")} className={`w-full py-3 ${activeTab === "GOD_MODE" ? 'bg-red-500/20 border border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/5 border border-white/10 text-red-400/50 hover:bg-red-500/10 hover:border-red-500/30'} text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-4 animate-pulse`} style={cutCorners}>
                <ShieldAlert className="w-3 h-3" /> {activeTab === "GOD_MODE" ? <GlitchText text="GOD MODE" /> : "GOD MODE"}
              </button>

            </>
          )}

          {['SUPER_ADMIN', 'ADMIN'].includes(adminUser?.role) && (
            <button onClick={handleExportCSV} className="w-full py-3 bg-transparent text-gray-500 text-[10px] uppercase tracking-widest border border-dashed border-gray-600 hover:text-white hover:border-gray-400 transition-colors flex items-center justify-center gap-2 mb-3" style={cutCorners}>
              <Download className="w-3 h-3" /> EXPORT_CSV
            </button>
          )}

          <button onClick={handleLogout} className="w-full py-3 bg-transparent text-red-500 text-[10px] uppercase tracking-widest border border-dashed border-red-500/50 hover:bg-red-500 hover:text-black transition-colors flex items-center justify-center gap-2 mb-3" style={cutCorners}>
            <LogOut className="w-3 h-3" /> TERMINATE_SESSION
          </button>

          <Link href="/" className="w-full py-3 bg-transparent text-gray-600 text-[10px] uppercase tracking-widest hover:text-gray-400 transition-colors flex items-center justify-center gap-2" >
            &lt;- RETURN_TO_BASE
          </Link>
        </div>

        {/* Security Log */}
        {adminUser?.role === 'SUPER_ADMIN' && (
          <div className="mt-auto p-4 bg-black/60 border-t border-white/10 min-h-[120px] relative overflow-hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-0"></div>
            <div className="relative z-10 space-y-1">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div
                    key={i + log}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`text-[9px] font-mono tracking-wider ${log.includes('[ALERT]') || isLockdown ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN DATA GRID */}
      <main className="flex-grow flex flex-col h-screen relative overflow-hidden">

        {/* Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

        {/* Lockdown Overlay Overlay */}
        <AnimatePresence>
          {isLockdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-0 border-[10px] border-red-500/20"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] opacity-10">
                <h2 className="font-display font-black text-[15rem] text-red-500 tracking-tighter whitespace-nowrap">RESTRICTED</h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Bar */}
        <header className={`h-20 border-b flex items-center justify-between px-8 relative z-10 bg-black/50 backdrop-blur-md transition-colors duration-700 ${isLockdown ? 'border-red-500/50' : 'border-white/10'}`}>
          {adminUser?.role !== 'VOLUNTEER' ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm tracking-widest text-gray-300">REGISTRY_DATABASE</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <div className="text-xs text-gray-500 tracking-widest">
                TOTAL_ENTITIES: <span className="text-white font-bold">{filteredTeams.length}</span>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 ml-4">
                <input
                  type="text"
                  placeholder="SEARCH ENTITIES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLockdown}
                  className={`bg-black/80 border text-xs text-white p-2 w-48 focus:outline-none transition-colors ${isLockdown ? 'border-red-500/50 text-red-500 cursor-not-allowed opacity-50' : 'border-white/20 focus:border-neon-cyan'}`}
                />
                <select
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  disabled={isLockdown}
                  className={`bg-black/80 border text-xs text-white p-2 focus:outline-none transition-colors ${isLockdown ? 'border-red-500/50 text-red-500 cursor-not-allowed opacity-50' : 'border-white/20 focus:border-neon-cyan'}`}
                >
                  <option value="ALL">ALL EVENTS</option>
                  <option value="Robo Soccer">ROBO SOCCER</option>
                  <option value="Robo Race">ROBO RACE</option>
                  <option value="Line Follower">LINE FOLLOWER</option>
                  <option value="Robo Sumo">ROBO SUMO</option>
                  <option value="Hackathon">HACKATHON</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  disabled={isLockdown}
                  className={`bg-black/80 border text-xs text-white p-2 focus:outline-none transition-colors ${isLockdown ? 'border-red-500/50 text-red-500 cursor-not-allowed opacity-50' : 'border-white/20 focus:border-neon-cyan'}`}
                >
                  <option value="ALL">ALL STATUSES</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">REJECTED</option>
                  <option value="UNPAID">UNPAID</option>
                </select>

                <button 
                  onClick={handleNoShowAlerts}
                  disabled={isSendingNoShow || isLockdown}
                  className={`ml-2 bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500 hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${isSendingNoShow ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isSendingNoShow ? 'SENDING...' : '🚨 NO-SHOW ALERTS'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <ScanLine className="w-4 h-4 text-yellow-500" />
                <span className="text-sm tracking-widest text-gray-300">SCANNER_MODULE</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="text-[10px] text-right font-mono tracking-widest uppercase">
              <span className="text-gray-500 block">Logged in as</span>
              <span className="text-neon-cyan font-bold">{adminUser?.name} ({adminUser?.role})</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Cpu className={`w-4 h-4 ${isLockdown ? 'text-red-500' : 'text-gray-500'}`} />
              <span className={`text-[10px] tracking-widest uppercase ${isLockdown ? 'text-red-500 font-bold' : 'text-gray-500'}`}>SERVER_SYNC: {isLockdown ? 'FROZEN' : 'ACTIVE'}</span>
            </div>
          </div>
        </header>

        {/* Table Area */}
        <div className="p-8 flex-grow overflow-y-auto overflow-x-hidden relative z-10">

          {activeTab === "ARENA_SCORING" && (
            <div className="max-w-6xl mx-auto space-y-8 mt-4 font-mono pb-20 text-white">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-3xl font-black text-orange-500 tracking-widest uppercase">
                    <GlitchText text="ARENA SCORING HUD" />
                  </h2>
                  <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">NMIMS SVKM Official Score Keeper</p>
                </div>
                {["SUPER_ADMIN", "ADMIN"].includes(adminUser?.role) ? (
                  <select
                    value={selectedScoringEvent}
                    onChange={(e) => {
                      setSelectedScoringEvent(e.target.value);
                      setScoringTeamId("");
                      setScoringDriverName("");
                      setScoringInitialTime("");
                      setScoringOffTracks(0);
                      setScoringHandTouches(0);
                      setScoringSkips(0);
                      setMatchTeam1Id("");
                      setMatchTeam2Id("");
                    }}
                    className="bg-black border border-orange-500/50 text-orange-500 p-2 text-xs uppercase outline-none focus:border-orange-500 tracking-widest"
                  >
                    <option value="Robo Race">Robo Race</option>
                    <option value="Line Follower">Line Follower</option>
                    <option value="Robo Soccer">Robo Soccer</option>
                    <option value="Robo Sumo">Robo Sumo</option>
                  </select>
                ) : (
                  <span className="text-xs border border-orange-500/30 text-orange-500 px-3 py-1 bg-orange-500/10 tracking-widest">
                    LOCKED EVENT: {selectedScoringEvent.toUpperCase()}
                  </span>
                )}
              </div>

              {["Robo Race", "Line Follower"].includes(selectedScoringEvent) ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!scoringTeamId || !scoringInitialTime) return alert("Select a Team and enter Initial Time.");
                      setIsSubmittingRun(true);
                      try {
                        const res = await fetch("/api/admin/scoring", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "LOG_RUN",
                            teamId: scoringTeamId,
                            driverName: scoringDriverName,
                            attemptNumber: scoringAttemptNumber,
                            initialTime: parseFloat(scoringInitialTime),
                            offTracks: scoringOffTracks,
                            handTouches: scoringHandTouches,
                            skips: scoringSkips,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(`[SYSTEM ACTION]: Attempt #${scoringAttemptNumber} successfully logged for team ${scoringTeamId}!`);
                          setScoringInitialTime("");
                          setScoringOffTracks(0);
                          setScoringHandTouches(0);
                          setScoringSkips(0);
                          const resTeams = await fetch("/api/teams");
                          const dataTeams = await resTeams.json();
                          if (dataTeams.teams) {
                            setTeams(dataTeams.teams);
                            const selectedTeamObj = dataTeams.teams.find(t => t.id === scoringTeamId || t._id === scoringTeamId);
                            if (selectedTeamObj && selectedTeamObj.runs) {
                              setScoringAttemptNumber(selectedTeamObj.runs.length + 1);
                            } else {
                              setScoringAttemptNumber(1);
                            }
                          }
                        } else {
                          alert(`Error: ${data.error}`);
                        }
                      } catch (err) {
                        alert("Network error logging run");
                      } finally {
                        setIsSubmittingRun(false);
                      }
                    }}
                    className="bg-black/60 border border-white/10 p-6 space-y-4"
                    style={extremeCut}
                  >
                    <h3 className="text-sm font-bold tracking-widest text-orange-500 uppercase border-b border-white/10 pb-2">Record Trial Run</h3>
                    
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Select Operative Team</label>
                      <select
                        required
                        value={scoringTeamId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setScoringTeamId(selectedId);
                          const selectedTeamObj = teams.find(t => t.id === selectedId || t._id === selectedId);
                          if (selectedTeamObj && selectedTeamObj.runs) {
                            setScoringAttemptNumber(selectedTeamObj.runs.length + 1);
                          } else {
                            setScoringAttemptNumber(1);
                          }
                        }}
                        className="w-full bg-black border border-white/20 p-2 text-xs text-white focus:border-orange-500 outline-none uppercase"
                      >
                        <option value="">-- CHOOSE TEAM --</option>
                        {teams
                          .filter(t => t.event?.toLowerCase() === selectedScoringEvent.toLowerCase())
                          .map(t => (
                            <option key={t.id} value={t.id}>{t.id} - {t.name.toUpperCase()} ({t.status})</option>
                          ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Driver / Pilot Name</label>
                        <input
                          type="text"
                          value={scoringDriverName}
                          onChange={(e) => setScoringDriverName(e.target.value)}
                          placeholder="Pilot Call Sign"
                          className="w-full bg-transparent border border-white/20 p-2 focus:border-orange-500 outline-none text-white text-xs uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Attempt / Run #</label>
                        <input
                          required
                          type="number"
                          value={scoringAttemptNumber}
                          onChange={(e) => setScoringAttemptNumber(parseInt(e.target.value))}
                          className="w-full bg-transparent border border-white/20 p-2 focus:border-orange-500 outline-none text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Initial Time Taken (Seconds)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={scoringInitialTime}
                        onChange={(e) => setScoringInitialTime(e.target.value)}
                        placeholder="Seconds (e.g. 45.24)"
                        className="w-full bg-transparent border border-white/20 p-2 focus:border-orange-500 outline-none text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/40 border border-white/10 p-2 text-center">
                        <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Off-Tracks (+10s)</label>
                        <div className="flex items-center justify-center gap-3">
                          <button type="button" onClick={() => setScoringOffTracks(Math.max(0, scoringOffTracks - 1))} className="text-gray-400 font-bold hover:text-white">-</button>
                          <span className="font-bold text-white text-sm">{scoringOffTracks}</span>
                          <button type="button" onClick={() => setScoringOffTracks(scoringOffTracks + 1)} className="text-gray-400 font-bold hover:text-white">+</button>
                        </div>
                      </div>
                      <div className="bg-black/40 border border-white/10 p-2 text-center">
                        <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Handslaps (+30s)</label>
                        <div className="flex items-center justify-center gap-3">
                          <button type="button" onClick={() => setScoringHandTouches(Math.max(0, scoringHandTouches - 1))} className="text-gray-400 font-bold hover:text-white">-</button>
                          <span className="font-bold text-white text-sm">{scoringHandTouches}</span>
                          <button type="button" onClick={() => setScoringHandTouches(scoringHandTouches + 1)} className="text-gray-400 font-bold hover:text-white">+</button>
                        </div>
                      </div>
                      <div className="bg-black/40 border border-white/10 p-2 text-center">
                        <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Skips (+45s)</label>
                        <div className="flex items-center justify-center gap-3">
                          <button type="button" onClick={() => setScoringSkips(Math.max(0, scoringSkips - 1))} className="text-gray-400 font-bold hover:text-white">-</button>
                          <span className={`font-bold text-sm ${scoringSkips > 2 ? 'text-red-500' : 'text-white'}`}>{scoringSkips}</span>
                          <button type="button" onClick={() => setScoringSkips(scoringSkips + 1)} className="text-gray-400 font-bold hover:text-white">+</button>
                        </div>
                      </div>
                    </div>

                    {scoringSkips > 2 && (
                      <div className="bg-red-500/10 border border-red-500/30 p-2 text-red-500 text-[10px] font-bold tracking-widest uppercase text-center animate-pulse">
                        ⚠️ WARNING: RUN IS AUTOMATICALLY DISQUALIFIED (MAX 2 SKIPS ALLOWED).
                      </div>
                    )}

                    <div className="bg-[#0b141a] border border-orange-500/20 p-4 font-mono text-xs rounded space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Initial Time:</span>
                        <span className="text-white font-bold">{parseFloat(scoringInitialTime || 0).toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between text-yellow-500">
                        <span>Penalties Added:</span>
                        <span>+{(scoringOffTracks * 10 + scoringHandTouches * 30 + scoringSkips * 45)}s</span>
                      </div>
                      <div className="h-px bg-white/10 my-1"></div>
                      <div className="flex justify-between text-orange-500 font-bold text-sm">
                        <span>Projected Total Time:</span>
                        <span>{(parseFloat(scoringInitialTime || 0) + scoringOffTracks * 10 + scoringHandTouches * 30 + scoringSkips * 45).toFixed(2)}s</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRun || isLockdown}
                      className={`w-full ${isSubmittingRun ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black'} border border-orange-500 py-3 font-bold uppercase tracking-widest text-xs transition-colors`}
                    >
                      {isSubmittingRun ? "TRANSMITTING DATA..." : "SUBMIT ATTEMPT RUN"}
                    </button>
                  </form>

                  <div className="bg-black/60 border border-white/10 p-6 flex flex-col" style={extremeCut}>
                    <h3 className="text-sm font-bold tracking-widest text-white uppercase border-b border-white/10 pb-2 mb-4">Trial Attempt History</h3>
                    <div className="flex-grow overflow-y-auto space-y-4">
                      {scoringTeamId ? (
                        (() => {
                          const teamObj = teams.find(t => t.id === scoringTeamId || t._id === scoringTeamId);
                          if (!teamObj || !teamObj.runs || teamObj.runs.length === 0) {
                            return <p className="text-center text-xs text-gray-500 uppercase my-10">[ NO RUNS LOGGED FOR THIS UNIT ]</p>;
                          }
                          return (
                            <div className="space-y-3">
                              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">OPERATIVE UNIT: {teamObj.name}</p>
                              {teamObj.runs.map((run) => (
                                <div key={run._id} className="bg-white/5 border border-white/10 p-3.5 flex justify-between items-center transition-all hover:bg-white/10">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-bold text-white uppercase">Run #{run.attemptNumber}</span>
                                      <span className={`px-1.5 py-0.5 text-[8px] border font-bold ${run.status === 'QUALIFIED' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>{run.status}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400">Pilot: {run.driverName || "N/A"}</p>
                                    <p className="text-[9px] text-gray-500">Initial: {run.initialTime}s • Penalty: +{run.penaltyTime}s</p>
                                    <p className="text-xs font-bold text-neon-cyan mt-1">Total: {run.totalTime.toFixed(2)}s</p>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      if (!confirm("Are you sure you want to eradicate this trial record?")) return;
                                      try {
                                        const res = await fetch("/api/admin/scoring", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            action: "DELETE_RUN",
                                            teamId: teamObj.teamId,
                                            runId: run._id,
                                          }),
                                        });
                                        const d = await res.json();
                                        if (d.success) {
                                          alert("Run deleted successfully.");
                                          const resTeams = await fetch("/api/teams");
                                          const dataTeams = await resTeams.json();
                                          if (dataTeams.teams) {
                                            setTeams(dataTeams.teams);
                                            const selectedTeamObj = dataTeams.teams.find(t => t.id === scoringTeamId || t._id === scoringTeamId);
                                            if (selectedTeamObj && selectedTeamObj.runs) {
                                              setScoringAttemptNumber(selectedTeamObj.runs.length + 1);
                                            } else {
                                              setScoringAttemptNumber(1);
                                            }
                                          }
                                        } else {
                                          alert("Failed to delete run: " + d.error);
                                        }
                                      } catch (err) {
                                        alert("Network error deleting run");
                                      }
                                    }}
                                    className="p-1 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })()
                      ) : (
                        <p className="text-center text-xs text-gray-500 uppercase my-10">[ SELECT A TEAM TO VIEW RUN TRIALS ]</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-5 bg-black/60 border border-white/10 p-8" style={extremeCut}>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!matchIdInput || !matchTeam1Id || !matchTeam2Id) {
                          return alert("Missing match fields.");
                        }
                        setIsSubmittingMatch(true);

                      const team1Obj = teams.find(t => t.id === matchTeam1Id);
                      const team2Obj = teams.find(t => t.id === matchTeam2Id);

                      try {
                        const res = await fetch("/api/admin/scoring", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "LOG_MATCH",
                            event: selectedScoringEvent,
                            matchId: matchIdInput,
                            round: roundInput,
                            team1: {
                              id: matchTeam1Id,
                              name: team1Obj?.name || matchTeam1Id,
                              goals: matchTeam1Goals,
                              status: matchTeam1Status,
                            },
                            team2: {
                              id: matchTeam2Id,
                              name: team2Obj?.name || matchTeam2Id,
                              goals: matchTeam2Goals,
                              status: matchTeam2Status,
                            },
                            penalties: matchPenalties,
                            winnerId: matchWinnerId,
                            status: matchStatus,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(`[SYSTEM ACTION]: Match ${matchIdInput} successfully logged/updated!`);
                          setEditingMatchId(null);
                          setMatchIdInput("");
                          setRoundInput("Round 1");
                          setMatchTeam1Id("");
                          setMatchTeam2Id("");
                          setMatchTeam1Goals(0);
                          setMatchTeam2Goals(0);
                          setMatchTeam1Status("QUALIFIED");
                          setMatchTeam2Status("QUALIFIED");
                          setMatchPenalties("");
                          setMatchWinnerId("");
                          setMatchStatus("UPCOMING");
                        } else {
                          alert(`Error: ${data.error}`);
                        }
                      } catch (err) {
                        alert("Network error logging match");
                      } finally {
                        setIsSubmittingMatch(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-bold tracking-widest text-orange-500 uppercase border-b border-white/10 pb-2">Record Match Scorecard</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Match ID / Identifier</label>
                        <input
                          required
                          type="text"
                          value={matchIdInput}
                          onChange={(e) => setMatchIdInput(e.target.value)}
                          placeholder="e.g. M-101"
                          className="w-full bg-transparent border border-white/20 p-2 focus:border-orange-500 outline-none text-white text-xs font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Round / Stage</label>
                        <select
                          value={roundInput}
                          onChange={(e) => setRoundInput(e.target.value)}
                          className="w-full bg-black border border-white/20 p-2 text-xs text-white focus:border-orange-500 outline-none uppercase"
                        >
                          <option value="Round 1">Round 1</option>
                          <option value="Round 2">Round 2</option>
                          <option value="Quarter Finals">Quarter Finals</option>
                          <option value="Semi Finals">Semi Finals</option>
                          <option value="Finals">Finals</option>
                          <option value="Grand Finals">Grand Finals</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-4 border border-white/5">
                      <div className="space-y-3">
                        <label className="text-[10px] text-neon-cyan uppercase font-bold tracking-widest block mb-1">Team 1 (Blue Corner)</label>
                        <select
                          required
                          value={matchTeam1Id}
                          onChange={(e) => setMatchTeam1Id(e.target.value)}
                          className="w-full bg-black border border-white/20 p-2 text-xs text-white outline-none uppercase"
                        >
                          <option value="">-- SELECT TEAM 1 --</option>
                          {teams
                            .filter(t => t.event?.toLowerCase() === selectedScoringEvent.toLowerCase() && t.status === "VERIFIED")
                            .map(t => (
                              <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase block mb-1">Goals/Points</label>
                            <input
                              type="number"
                              value={matchTeam1Goals}
                              onChange={(e) => setMatchTeam1Goals(parseInt(e.target.value))}
                              className="w-full bg-transparent border border-white/20 p-1.5 focus:border-orange-500 outline-none text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase block mb-1">Status</label>
                            <select
                              value={matchTeam1Status}
                              onChange={(e) => setMatchTeam1Status(e.target.value)}
                              className="w-full bg-black border border-white/20 p-1.5 text-xs text-white outline-none uppercase"
                            >
                              <option value="QUALIFIED">Qualified</option>
                              <option value="DISQUALIFIED">Disqualified</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] text-electric-purple uppercase font-bold tracking-widest block mb-1">Team 2 (Red Corner)</label>
                        <select
                          required
                          value={matchTeam2Id}
                          onChange={(e) => setMatchTeam2Id(e.target.value)}
                          className="w-full bg-black border border-white/20 p-2 text-xs text-white outline-none uppercase"
                        >
                          <option value="">-- SELECT TEAM 2 --</option>
                          {teams
                            .filter(t => t.event?.toLowerCase() === selectedScoringEvent.toLowerCase() && t.status === "VERIFIED")
                            .map(t => (
                              <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase block mb-1">Goals/Points</label>
                            <input
                              type="number"
                              value={matchTeam2Goals}
                              onChange={(e) => setMatchTeam2Goals(parseInt(e.target.value))}
                              className="w-full bg-transparent border border-white/20 p-1.5 focus:border-orange-500 outline-none text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-gray-500 uppercase block mb-1">Status</label>
                            <select
                              value={matchTeam2Status}
                              onChange={(e) => setMatchTeam2Status(e.target.value)}
                              className="w-full bg-black border border-white/20 p-1.5 text-xs text-white outline-none uppercase"
                            >
                              <option value="QUALIFIED">Qualified</option>
                              <option value="DISQUALIFIED">Disqualified</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Penalties / Infractions / Technical Fouls</label>
                      <textarea
                        value={matchPenalties}
                        onChange={(e) => setMatchPenalties(e.target.value)}
                        placeholder="Detail any warnings, restarts or yellow cards..."
                        rows="2"
                        className="w-full bg-transparent border border-white/20 p-2 focus:border-orange-500 outline-none text-white text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Official Winner</label>
                        <select
                          value={matchWinnerId}
                          onChange={(e) => setMatchWinnerId(e.target.value)}
                          className="w-full bg-black border border-white/20 p-2 text-xs text-white focus:border-orange-500 outline-none uppercase"
                        >
                          <option value="">-- AWAITING / DRAW --</option>
                          {matchTeam1Id && <option value={matchTeam1Id}>Team 1 ({teams.find(t => t.id === matchTeam1Id)?.name})</option>}
                          {matchTeam2Id && <option value={matchTeam2Id}>Team 2 ({teams.find(t => t.id === matchTeam2Id)?.name})</option>}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Match State</label>
                        <select
                          value={matchStatus}
                          onChange={(e) => setMatchStatus(e.target.value)}
                          className="w-full bg-black border border-white/20 p-2 text-xs text-white focus:border-orange-500 outline-none uppercase"
                        >
                          <option value="UPCOMING">Upcoming</option>
                          <option value="LIVE">Live</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingMatch || isLockdown}
                      className={`w-full ${isSubmittingMatch ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black'} border border-orange-500 py-3 font-bold uppercase tracking-widest text-xs transition-colors`}
                    >
                      {isSubmittingMatch ? "TRANSMITTING DATA..." : (editingMatchId ? "UPDATE MATCH RECORD" : "COMMIT MATCH RECORD")}
                    </button>
                    {editingMatchId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMatchId(null);
                          setMatchIdInput("");
                          setRoundInput("Round 1");
                          setMatchTeam1Id("");
                          setMatchTeam2Id("");
                          setMatchTeam1Goals(0);
                          setMatchTeam2Goals(0);
                          setMatchTeam1Status("QUALIFIED");
                          setMatchTeam2Status("QUALIFIED");
                          setMatchPenalties("");
                          setMatchWinnerId("");
                          setMatchStatus("UPCOMING");
                        }}
                        className="w-full mt-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black border border-red-500 py-2 font-bold uppercase tracking-widest text-xs transition-colors"
                      >
                        CANCEL EDIT
                      </button>
                    )}
                  </form>
                </div>

                <div className="xl:col-span-7 bg-black/60 border border-white/10 p-6 flex flex-col" style={extremeCut}>
                  <h3 className="text-sm font-bold tracking-widest text-white uppercase border-b border-white/10 pb-2 mb-4">Live Scheduled Fixtures</h3>
                  <div className="flex-grow overflow-y-auto space-y-6 scrollbar-hide">
                    {(() => {
                      const matches = systemBrackets[selectedScoringEvent]?.matches || [];
                      if (matches.length === 0) return <p className="text-center text-xs text-gray-500 uppercase my-10">[ NO FIXTURES SCHEDULED ]</p>;
                      
                      const rounds = {};
                      matches.forEach(m => {
                        if (!rounds[m.round]) rounds[m.round] = [];
                        rounds[m.round].push(m);
                      });
                      
                      return Object.keys(rounds).map(roundName => (
                        <div key={roundName} className="space-y-3">
                          <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest bg-orange-500/10 border-l-2 border-orange-500 px-2 py-1">{roundName}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rounds[roundName].map(match => (
                              <div key={match.matchId} className="bg-white/5 border border-white/10 p-3 flex flex-col justify-between transition-all hover:bg-white/10 group">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                                  <span className="text-xs font-bold text-white uppercase">ID: {match.matchId}</span>
                                  <span className={`px-1.5 py-0.5 text-[8px] border font-bold ${match.status === 'COMPLETED' ? 'border-green-500 text-green-500 bg-green-500/10' : match.status === 'LIVE' ? 'border-red-500 text-red-500 bg-red-500/10 animate-pulse' : 'border-gray-500 text-gray-400 bg-gray-500/10'}`}>{match.status}</span>
                                </div>
                                <div className="space-y-1 mb-3 flex-grow">
                                  <div className="flex justify-between items-center">
                                    <span className={`text-[10px] truncate max-w-[100px] ${match.winnerId === match.team1.id ? 'text-green-400 font-bold' : 'text-gray-400'}`}>[BLUE] {match.team1.name}</span>
                                    <span className="text-xs font-mono font-bold text-white">{match.team1.goals}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className={`text-[10px] truncate max-w-[100px] ${match.winnerId === match.team2.id ? 'text-green-400 font-bold' : 'text-gray-400'}`}>[RED] {match.team2.name}</span>
                                    <span className="text-xs font-mono font-bold text-white">{match.team2.goals}</span>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 border-t border-white/10 pt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMatchId(match.matchId);
                                      setMatchIdInput(match.matchId);
                                      setRoundInput(match.round);
                                      setMatchTeam1Id(match.team1.id);
                                      setMatchTeam2Id(match.team2.id);
                                      setMatchTeam1Goals(match.team1.goals);
                                      setMatchTeam2Goals(match.team2.goals);
                                      setMatchTeam1Status(match.team1.status);
                                      setMatchTeam2Status(match.team2.status);
                                      setMatchPenalties(match.penalties);
                                      setMatchWinnerId(match.winnerId);
                                      setMatchStatus(match.status);
                                      const topContainer = document.querySelector('.max-w-6xl.mx-auto');
                                      if(topContainer) topContainer.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="p-1 border border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-black transition-colors"
                                    title="Edit Match"
                                  >
                                    <Wrench className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!confirm(`Eradicate match ${match.matchId}?`)) return;
                                      try {
                                        const res = await fetch("/api/admin/scoring", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ action: "DELETE_MATCH", event: selectedScoringEvent, matchId: match.matchId }),
                                        });
                                        const d = await res.json();
                                        if (d.success) {
                                          alert("Match deleted.");
                                        } else {
                                          alert("Failed to delete match.");
                                        }
                                      } catch(e) {
                                        alert("Network error.");
                                      }
                                    }}
                                    className="p-1 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-colors"
                                    title="Delete Match"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {activeTab === "AI_SCREENER" && (
            <div className="max-w-7xl mx-auto space-y-8 mt-4 font-mono pb-20 text-white">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-3xl font-black text-neon-cyan tracking-widest uppercase">
                    <GlitchText text="AUTOMATED AI SCREENER" />
                  </h2>
                  <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Neural Vetting & Fraud Integrity Terminal</p>
                </div>
                <div className="flex gap-2 items-center text-xs text-gray-400 border border-white/10 px-3 py-1 bg-white/5">
                  <span className="inline-block w-2.5 h-2.5 bg-neon-cyan rounded-full animate-ping mr-1"></span>
                  KEYBOARD HOTKEYS ACTIVE: <span className="text-white font-bold bg-white/10 px-1 py-0.5 ml-1">F1 = VERIFY</span> <span className="text-white font-bold bg-white/10 px-1 py-0.5 ml-1">F2 = REJECT</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 bg-black/60 border border-white/10 p-4 flex flex-col h-[600px]" style={extremeCut}>
                  <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase border-b border-white/10 pb-2 mb-3">PENDING QUEUE ({teams.filter(t => t.status === "PENDING").length})</h3>
                  <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                    {teams.filter(t => t.status === "PENDING").length === 0 ? (
                      <p className="text-center text-[10px] text-gray-500 uppercase my-10">Queue Clear. No pending units.</p>
                    ) : (
                      teams
                        .filter(t => t.status === "PENDING")
                        .map((team) => (
                          <div
                            key={team.id}
                            onClick={() => {
                              setSelectedScreenerTeamId(team.id);
                              if (!aiSummary[team.id] && !isAnalyzing[team.id]) {
                                handleAnalyze(team);
                              }
                            }}
                            className={`p-3 border transition-all cursor-pointer ${
                              selectedScreenerTeamId === team.id
                                ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(102,252,241,0.2)]"
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300"
                            }`}
                          >
                            <p className="font-bold text-xs uppercase truncate">{team.name}</p>
                            <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                              <span>{team.id}</span>
                              <span className="uppercase">{team.event}</span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-black/60 border border-white/10 p-4 flex flex-col items-center justify-center relative min-h-[400px]" style={extremeCut}>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(102,252,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0"></div>
                  
                  {selectedScreenerTeamId && teams.find(t => t.id === selectedScreenerTeamId)?.screenshot ? (
                    (() => {
                      const team = teams.find(t => t.id === selectedScreenerTeamId);
                      return (
                        <div className="w-full h-full flex flex-col justify-between relative z-10">
                          <div className="relative w-full h-[450px] border border-white/10 bg-black flex items-center justify-center overflow-hidden">
                            <img
                              src={team.screenshot}
                              alt="Transaction Screenshot"
                              className="max-w-full max-h-full object-contain relative z-0"
                            />
                            <motion.div
                              animate={{ y: ["0%", "440px", "0%"] }}
                              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                              className="absolute left-0 w-full h-0.5 bg-neon-cyan/80 shadow-[0_0_12px_rgba(102,252,241,1)] pointer-events-none z-10"
                              style={{ top: 0 }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-gray-500 mt-2 font-mono">
                            <span>FILE_PATH: {team.screenshot}</span>
                            <span className="text-neon-cyan font-bold tracking-wider">LASER SCAN ACTIVE</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center font-mono text-xs text-gray-600 space-y-2 uppercase relative z-10">
                      <ScanLine className="w-12 h-12 mx-auto text-gray-700 animate-pulse mb-2" />
                      <span>Awaiting Operative Selection</span>
                      <p className="text-[9px] text-gray-700">Select a team in the pending queue to scan registration payload</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  {selectedScreenerTeamId ? (
                    (() => {
                      const team = teams.find(t => t.id === selectedScreenerTeamId);
                      if (!team) return null;
                      
                      const isUtrFormatValid = team.utr && /^\d{12}$/.test(team.utr);
                      const isDuplicateUtr = team.utr && teams.some(t => t.id !== team.id && t.utr === team.utr);
                      const isDuplicateHash = team.screenshotHash && teams.some(t => t.id !== team.id && t.screenshotHash === team.screenshotHash);
                      const teamLeader = team.memberDetails?.find(m => m.role === "Leader") || {};

                      return (
                        <>
                          <div className="bg-black/90 border border-green-500/30 p-5 rounded font-mono text-[10px] text-green-400 min-h-[280px] space-y-2 shadow-[0_0_20px_rgba(34,197,94,0.05)] relative overflow-hidden" style={cutCorners}>
                            <div className="absolute top-0 right-0 bg-green-500/10 border-b border-l border-green-500/20 text-green-400 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">INTEGRITY_CHECK</div>
                            <p className="text-white font-bold border-b border-green-500/20 pb-1 mb-2 uppercase">[ LOG REPORT: T-{team.id} ]</p>
                            <p><span className="text-gray-500">TEAM NAME:</span> <span className="text-white font-bold uppercase">{team.name}</span></p>
                            <p><span className="text-gray-500">EVENT:</span> <span className="text-white font-bold uppercase">{team.event}</span></p>
                            <p><span className="text-gray-500">INSTITUTION:</span> <span className="text-white uppercase">{team.institution}</span></p>
                            <p><span className="text-gray-500">LEADER:</span> <span className="text-white uppercase">{teamLeader.name} ({teamLeader.email})</span></p>
                            <p><span className="text-gray-500">SUBMITTED UTR:</span> <span className={`font-bold ${isUtrFormatValid ? 'text-green-400' : 'text-yellow-500'}`}>{team.utr || "N/A"}</span></p>
                            
                            <div className="mt-4 pt-3 border-t border-green-500/20 space-y-1.5">
                              <p className="flex items-center justify-between">
                                <span>[CHECK 01] UTR_FORMAT:</span>
                                <span className={isUtrFormatValid ? 'text-green-400 font-bold' : 'text-yellow-500 font-bold animate-pulse'}>
                                  {isUtrFormatValid ? '✓ PASS' : '✗ INVALID_FORMAT'}
                                </span>
                              </p>
                              <p className="flex items-center justify-between">
                                <span>[CHECK 02] UTR_DUPLICATE:</span>
                                <span className={isDuplicateUtr ? 'text-red-500 font-bold animate-pulse' : 'text-green-400 font-bold'}>
                                  {isDuplicateUtr ? '⚠ FRAUD WARNING!' : '✓ UNIQUE'}
                                </span>
                              </p>
                              <p className="flex items-center justify-between">
                                <span>[CHECK 03] screenshot_HASH:</span>
                                <span className={isDuplicateHash ? 'text-red-500 font-bold animate-pulse' : 'text-green-400 font-bold'}>
                                  {isDuplicateHash ? '⚠ FRAUD WARNING!' : '✓ UNIQUE'}
                                </span>
                              </p>
                            </div>

                            {(isDuplicateUtr || isDuplicateHash) && (
                              <div className="bg-red-950/40 border border-red-500/50 p-2 text-[9px] text-red-400 mt-3 font-bold tracking-wider uppercase animate-pulse">
                                [CRITICAL INTEGRITY FAILURE]: DUPLICATE PAYMENT ARTIFACTS DETECTED. POTENTIAL DUPLICATE TRANSACTION COUNTERFEIT WARNING.
                              </div>
                            )}
                          </div>

                          <div className="bg-[#02050A] border border-neon-cyan/30 p-5 rounded font-mono text-[10px] text-neon-cyan min-h-[160px] flex flex-col justify-between shadow-[0_0_20px_rgba(102,252,241,0.05)] relative overflow-hidden" style={cutCorners}>
                            <div className="absolute top-0 right-0 bg-neon-cyan/10 border-b border-l border-neon-cyan/20 text-neon-cyan px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">OVERWATCH_AI_DECISION</div>
                            <div className="space-y-2">
                              <p className="text-white font-bold border-b border-neon-cyan/20 pb-1 mb-2 uppercase">[ COGNITIVE MATRIX REPORT ]</p>
                              {isAnalyzing[team.id] ? (
                                <div className="space-y-1.5">
                                  <p className="animate-pulse">STABLIZING NEURAL UPLINK TO GEMINI-1.5-FLASH...</p>
                                  <div className="w-full bg-white/5 h-1 relative overflow-hidden">
                                    <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute left-0 top-0 h-full w-[30%] bg-neon-cyan" />
                                  </div>
                                </div>
                              ) : aiSummary[team.id] ? (
                                <p className="text-gray-300 leading-relaxed italic">&quot;{aiSummary[team.id]}&quot;</p>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-gray-500">AI analysis matrix is un-triggered.</p>
                                  <button
                                    type="button"
                                    onClick={() => handleAnalyze(team)}
                                    className="bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan px-3 py-1 hover:bg-neon-cyan hover:text-black transition-colors uppercase tracking-widest text-[8px]"
                                  >
                                    FORCE AI GENERATION
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="text-[7px] text-gray-600 mt-2 text-right tracking-widest uppercase">POWERED BY GOOGLE DEEPIND / GEMINI SYSTEM</div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const pendingTeams = teams.filter(t => t.status === "PENDING");
                                const currentIndex = pendingTeams.findIndex(t => t.id === team.id);
                                handleVerify(team).then(() => {
                                  if (pendingTeams.length > 1) {
                                    const nextIndex = (currentIndex + 1) % pendingTeams.length;
                                    const nextTeam = pendingTeams[nextIndex];
                                    setSelectedScreenerTeamId(nextTeam.id);
                                    if (!aiSummary[nextTeam.id] && !isAnalyzing[nextTeam.id]) {
                                      handleAnalyze(nextTeam);
                                    }
                                  } else {
                                    setSelectedScreenerTeamId("");
                                  }
                                });
                              }}
                              className="bg-green-500/10 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-black uppercase text-xs tracking-wider py-4 transition-all shadow-[0_0_20px_rgba(34,197,94,0.15)] flex flex-col items-center justify-center gap-1 hover:scale-105"
                            >
                              <span>VERIFY PAYMENT</span>
                              <span className="text-[8px] font-mono tracking-widest opacity-60">HOTKEY: F1</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const pendingTeams = teams.filter(t => t.status === "PENDING");
                                const currentIndex = pendingTeams.findIndex(t => t.id === team.id);
                                handleReject(team).then(() => {
                                  if (pendingTeams.length > 1) {
                                    const nextIndex = (currentIndex + 1) % pendingTeams.length;
                                    const nextTeam = pendingTeams[nextIndex];
                                    setSelectedScreenerTeamId(nextTeam.id);
                                    if (!aiSummary[nextTeam.id] && !isAnalyzing[nextTeam.id]) {
                                      handleAnalyze(nextTeam);
                                    }
                                  } else {
                                    setSelectedScreenerTeamId("");
                                  }
                                });
                              }}
                              className="bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-black uppercase text-xs tracking-wider py-4 transition-all shadow-[0_0_20px_rgba(239,68,68,0.15)] flex flex-col items-center justify-center gap-1 hover:scale-105"
                            >
                              <span>REJECT PAYMENT</span>
                              <span className="text-[8px] font-mono tracking-widest opacity-60">HOTKEY: F2</span>
                            </button>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="bg-black/90 border border-white/10 p-8 text-center text-gray-500 text-xs font-mono uppercase rounded min-h-[300px] flex items-center justify-center">
                      Select pending registration to trigger verification sequence.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "DATABASE" && (
            <div className="w-full border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden" style={extremeCut}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="whitespace-nowrap">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 w-10"></th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 w-10">No.</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Team_ID</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Designation</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Event</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Institution</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Units</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">Overrides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 relative">
                    <AnimatePresence>
                      {filteredTeams.map((team, index) => (
                        <Fragment key={team.id}>
                          {/* Main Team Row */}
                          <motion.tr
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`hover:bg-white/5 transition-colors group cursor-pointer ${expandedRow === team.id ? 'bg-white/5' : ''}`}
                            onClick={() => toggleRow(team.id)}
                          >
                            <td className="px-6 py-4 text-electric-purple">
                              {expandedRow === team.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{index + 1}</td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-400">{team.id}</td>
                            <td className="px-6 py-4 font-display tracking-wide text-white">
                              <div className="flex items-center gap-2">
                                <span className="opacity-0 group-hover:opacity-100 text-neon-cyan transition-opacity font-bold mr-1">[</span>
                                <span className="group-hover:text-neon-cyan transition-colors">{team.name}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-neon-cyan transition-opacity font-bold ml-1">]</span>
                                {team.screenshotHash && hashCounts[team.screenshotHash] > 1 && (
                                  <span className="bg-red-500/20 text-red-500 border border-red-500 px-1.5 py-0.5 text-[8px] uppercase tracking-widest flex items-center gap-1" title="Duplicate Screenshot Detected!" style={cutCorners}>
                                    <Skull className="w-3 h-3" /> FRAUD
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-neon-cyan text-xs font-mono">{team.event || "UNKNOWN"}</td>
                            <td className="px-6 py-4 text-gray-400 text-xs">{team.institution}</td>
                            <td className="px-6 py-4 text-gray-400 text-xs">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {team.members}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 text-[9px] uppercase tracking-widest border ${team.status === 'VERIFIED' ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' :
                                team.status === 'PENDING' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                                  'border-red-500 text-red-500 bg-red-500/10'
                                }`} style={cutCorners}>
                                {team.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>

                              {team.screenshot && (
                                <button onClick={() => setViewingScreenshot(team.screenshot)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="View Screenshot">
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}

                              {adminUser?.role !== 'VOLUNTEER' && (
                                <>
                                  <button onClick={() => !isLockdown && handleGhostLogin(team)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Ghost Login (Impersonate)">
                                    <UserCog className="w-4 h-4" />
                                  </button>

                                  {team.status !== 'VERIFIED' && team.status !== 'UNPAID' && (
                                    <button onClick={() => !isLockdown && handleVerify(team)} className={`p-2 text-gray-400 transition-colors ${isLockdown ? 'cursor-not-allowed opacity-50' : 'hover:text-neon-cyan hover:bg-neon-cyan/10'}`} title={isLockdown ? 'Action Restricted' : 'Verify Payment'}>
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}

                                  {team.status === 'VERIFIED' && (
                                    <button onClick={() => !isLockdown && handleResendReceipt(team)} className={`p-2 text-gray-400 transition-colors ${isLockdown ? 'cursor-not-allowed opacity-50' : 'hover:text-blue-500 hover:bg-blue-500/10'}`} title={isLockdown ? 'Action Restricted' : 'Resend Receipt'}>
                                      <Send className="w-4 h-4" />
                                    </button>
                                  )}

                                  {team.status !== 'FAILED' && team.status !== 'UNPAID' && (
                                    <button onClick={() => !isLockdown && handleReject(team)} className={`p-2 text-gray-400 transition-colors ${isLockdown ? 'cursor-not-allowed opacity-50' : 'hover:text-yellow-500 hover:bg-yellow-500/10'}`} title={isLockdown ? 'Action Restricted' : 'Mark Failed'}>
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  )}

                                  {team.status !== 'DISQUALIFIED' && (
                                    <button onClick={() => !isLockdown && handleDisqualify(team)} className={`p-2 text-gray-400 transition-colors ${isLockdown ? 'cursor-not-allowed opacity-50' : 'hover:text-orange-500 hover:bg-orange-500/10'}`} title={isLockdown ? 'Action Restricted' : 'DISQUALIFY TEAM'}>
                                      <Skull className="w-4 h-4" />
                                    </button>
                                  )}

                                  <button onClick={() => !isLockdown && handleDelete(team.id)} className={`p-2 text-gray-400 transition-colors ${isLockdown ? 'cursor-not-allowed opacity-50' : 'hover:text-red-500 hover:bg-red-500/10'}`} title={isLockdown ? 'Action Restricted' : 'Eradicate'}>
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </td>
                          </motion.tr>

                          {/* Expanded Member Details Row */}
                          <AnimatePresence>
                            {expandedRow === team.id && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-black/80 border-b border-electric-purple/20"
                              >
                                <td colSpan={9} className="p-0">
                                  <div className="p-10 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-neon-cyan/50 shadow-[0_0_15px_rgba(102,252,241,0.3)]"></div>

                                    {/* LEFT COLUMN: TEAM INTEL & PERSONNEL */}
                                    <div className="space-y-10">
                                      <div className="border-b border-white/10 pb-6">
                                        <div className="flex items-center gap-4 mb-6">
                                          <div className="p-2 bg-neon-cyan/10 border border-neon-cyan/30">
                                            <Users className="w-6 h-6 text-neon-cyan" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                                              <h4 className="text-lg font-bold uppercase tracking-[0.5em] text-white">OPERATIVE_DATABASE</h4>
                                              <button 
                                                onClick={() => handleAnalyze(team)}
                                                disabled={isAnalyzing[team.id]}
                                                className="bg-white/5 hover:bg-neon-cyan/20 border border-white/20 hover:border-neon-cyan text-xs text-neon-cyan px-3 py-1 font-mono uppercase tracking-widest transition-colors flex items-center gap-2 w-fit"
                                              >
                                                {isAnalyzing[team.id] ? "ANALYZING..." : "🤖 ANALYZE"}
                                              </button>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">Personnel clearance: LEVEL_4</p>
                                            {aiSummary[team.id] && (
                                              <div className="mt-3 bg-neon-cyan/10 border-l-2 border-neon-cyan p-2 text-[10px] font-mono text-neon-cyan uppercase tracking-widest">
                                                &gt; {aiSummary[team.id]}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 bg-white/5 border border-white/10 p-6" style={cutCorners}>
                                          <div className="space-y-1">
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Uplink Token (UTR)</p>
                                            <p className="text-sm font-mono text-neon-cyan font-bold">{team.utr || "ERR_NO_TOKEN"}</p>
                                          </div>
                                          <div className="text-right space-y-1">
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Payload Value</p>
                                            <p className="text-lg font-display font-black text-white">₹{team.amountPaid || "0"}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {team.memberDetails.map((member, i) => (
                                          <div key={i} className="bg-black/40 border border-white/10 p-5 group hover:border-neon-cyan/40 transition-all relative overflow-hidden" style={cutCorners}>
                                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                              {member.role === 'Leader' ? <ShieldAlert className="w-4 h-4 text-neon-cyan" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>}
                                            </div>
                                            <div className="mb-4">
                                              <span className={`text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 border ${member.role === 'Leader' ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/50' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                                {member.role}
                                              </span>
                                            </div>
                                            <p className="font-display font-bold text-white text-xl tracking-tight mb-2 truncate">{member.name}</p>
                                            <div className="space-y-1 pt-3 border-t border-white/5">
                                              <p className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                                                <span className="text-gray-600 uppercase text-[8px]">EML:</span> {member.email}
                                              </p>
                                              <p className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                                                <span className="text-gray-600 uppercase text-[8px]">TEL:</span> {member.phone}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* RIGHT COLUMN: MARKETING ENGINE & STORY GENERATOR */}
                                    <div className="bg-white/5 border border-white/10 p-10 flex flex-col items-center justify-start space-y-8">
                                      <div className="w-full border-b border-white/10 pb-6 mb-4">
                                        <div className="flex items-center gap-4 mb-4">
                                          <div className="p-2 bg-orange-500/10 border border-orange-500/30">
                                            <Zap className="w-6 h-6 text-orange-500" />
                                          </div>
                                          <div>
                                            <h4 className="text-lg font-bold uppercase tracking-[0.5em] text-white">MARKETING_UPLINK</h4>
                                            <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">Asset Status: 9:16_OPTIMIZED</p>
                                          </div>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                          Deploying high-fidelity tactical assets for Instagram Stories. Assets are dynamically generated using current team telemetry.
                                        </p>
                                      </div>

                                      {team.status === 'VERIFIED' ? (
                                        <div className="w-full flex flex-col items-center">
                                          <StoryGenerator team={team} />
                                          <div className="mt-8 flex flex-wrap justify-center gap-3">
                                            <span className="text-[9px] bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 px-3 py-1 uppercase tracking-[0.2em] font-bold">1080x1920_PORTRAIT</span>
                                            <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 uppercase tracking-[0.2em] font-bold">INSTA_STORY_COMPLIANT</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="py-20 flex flex-col items-center justify-center text-center">
                                          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                            <ShieldAlert className="w-10 h-10 text-red-500" />
                                          </div>
                                          <h5 className="text-white font-bold uppercase tracking-widest mb-2">Uplink Encryption Active</h5>
                                          <p className="text-[10px] text-gray-500 max-w-xs font-mono uppercase tracking-widest leading-loose">
                                            Payment verification required to unlock marketing asset generation.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>


                              </motion.tr>
                            )}
                          </AnimatePresence>

                        </Fragment>
                      ))}
                    </AnimatePresence>

                    {teams.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-xs uppercase tracking-widest">
                          NO_ENTITIES_FOUND_IN_DATABASE
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "LEDGER" && (
            <div className="max-w-6xl mx-auto space-y-8 mt-10">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-display font-bold text-3xl text-electric-purple uppercase">The Overwatch Budget & Ledger</h2>
                <div className="h-px bg-electric-purple/30 flex-grow"></div>
                <AnalyticsReport 
                  teams={teams}
                  expenses={expensesList}
                  sponsorsList={sponsorsList}
                  eventsList={eventsList}
                  totalRevenue={totalRevenue}
                  totalSponsorIncome={totalSponsorIncome}
                  totalExpenses={totalExpenses}
                  netProfit={netProfit}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-black/60 border border-neon-cyan/30 p-6" style={cutCorners}>
                  <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-2">Team Registrations</p>
                  <p className="font-display font-black text-2xl text-neon-cyan">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-black/60 border border-pink-500/30 p-6" style={cutCorners}>
                  <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-2">Sponsor Income</p>
                  <p className="font-display font-black text-2xl text-pink-500">₹{totalSponsorIncome.toLocaleString()}</p>
                </div>
                <div className="bg-black/60 border border-orange-500/30 p-6" style={cutCorners}>
                  <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-2">Total Expenses</p>
                  <p className="font-display font-black text-2xl text-orange-500">₹{totalExpenses.toLocaleString()}</p>
                </div>
                <div className={`bg-black/60 border ${netProfit >= 0 ? 'border-green-500/30' : 'border-red-500/30'} p-6`} style={cutCorners}>
                  <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-2">Net Profit/Loss</p>
                  <p className={`font-display font-black text-3xl ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {netProfit >= 0 ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Expense Form & List */}
                <div className="space-y-6">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fm = new FormData(e.target);
                    const res = await fetch("/api/admin/expenses", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: fm.get("title"),
                        amount: fm.get("amount"),
                        category: fm.get("category"),
                        addedBy: adminUser.email
                      })
                    });
                    if (res.ok) {
                      fetch('/api/admin/expenses').then(r => r.json()).then(d => setExpensesList(d.expenses || []));
                      e.target.reset();
                    }
                  }} className="bg-black/60 p-6 border border-white/10 flex flex-col gap-4">
                    <h3 className="text-xs text-orange-500 font-bold uppercase tracking-widest border-b border-orange-500/30 pb-2">Log New Expense</h3>
                    <input required name="title" placeholder="Expense Description" className="bg-transparent border border-white/20 p-2 focus:border-orange-500 outline-none text-white text-xs font-mono uppercase" />
                    <div className="flex gap-4">
                      <input required type="number" name="amount" placeholder="Amount (₹)" className="bg-transparent border border-white/20 p-2 focus:border-orange-500 outline-none text-white text-xs font-mono w-1/2" />
                      <select required name="category" className="bg-black border border-white/20 p-2 text-gray-400 focus:border-orange-500 outline-none uppercase text-xs tracking-widest w-1/2">
                        <option value="HARDWARE">Hardware / Equipment</option>
                        <option value="MARKETING">Marketing & PR</option>
                        <option value="PRIZES">Prizes / Trophies</option>
                        <option value="LOGISTICS">Logistics / Food</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-orange-500/20 text-orange-500 border border-orange-500 p-2 hover:bg-orange-500 hover:text-black font-bold uppercase tracking-widest text-xs">ADD EXPENSE</button>
                  </form>

                  <div className="bg-black/60 border border-white/10 p-4 h-64 overflow-y-auto space-y-2">
                    <h3 className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-4 sticky top-0 bg-black/80 py-2">Expense History</h3>
                    {expensesList.map(exp => (
                      <div key={exp._id} className="flex justify-between items-center bg-white/5 p-3 border border-white/10">
                        <div>
                          <p className="font-bold text-white text-xs uppercase">{exp.title}</p>
                          <p className="text-[9px] text-gray-500">{exp.category} • {new Date(exp.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="text-orange-500 font-bold text-sm">₹{exp.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {expensesList.length === 0 && <p className="text-[10px] text-gray-500 text-center py-8">No expenses logged.</p>}
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-black/60 border border-white/10 p-8 h-[450px]" style={extremeCut}>
                  <h3 className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">Revenue By Event</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ledgerData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12, fontFamily: 'monospace' }} />
                      <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12, fontFamily: 'monospace' }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "SCANNER" && (
            <div className="max-w-6xl mx-auto space-y-8 mt-10">
              <div className="text-center mb-8">
                <h2 className="font-display font-bold text-3xl text-yellow-500 uppercase">On-Site Scanner & Attendance</h2>
                <p className="font-mono text-xs text-gray-400 mt-2 tracking-widest">Scan Participant QR Tickets for Access</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Scanner Module */}
                <div className="space-y-6 relative group">
                  {scanResult && (
                    <div className={`p-4 border text-center font-mono font-bold uppercase tracking-wider ${scanResult.success ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-red-500/20 border-red-500 text-red-500'}`} style={cutCorners}>
                      <p className="mb-4 text-lg">{scanResult.message}</p>

                      {scanResult.success && scanResult.team && (
                        <div className="mt-4 mb-4 border-t border-neon-cyan/30 pt-4">
                          <StoryGenerator team={scanResult.team} autoSend={true} />
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setScanResult(null);
                          if (scannerRef.current) scannerRef.current.resume();
                        }}
                        className="mt-4 w-full bg-white/10 hover:bg-white/20 p-3 text-xs transition-colors font-bold uppercase tracking-widest border border-white/20 text-white"
                        style={cutCorners}
                      >
                        SCAN NEXT TEAM
                      </button>
                    </div>
                  )}

                  <div className="bg-black/60 border border-white/10 p-4 relative overflow-hidden" style={extremeCut}>
                    {/* Radar Effect Background */}
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-40">
                      <div className="absolute w-[90%] aspect-square border-2 border-yellow-500/20 rounded-full"></div>
                      <div className="absolute w-[60%] aspect-square border border-yellow-500/10 rounded-full"></div>
                      <div className="absolute w-[30%] aspect-square border border-yellow-500/10 rounded-full bg-yellow-500/5"></div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute w-[90%] aspect-square rounded-full origin-center"
                        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(234,179,8,0.2) 90deg, transparent 90deg)' }}
                      ></motion.div>
                      {/* Crosshairs */}
                      <div className="absolute w-[90%] h-px bg-yellow-500/20"></div>
                      <div className="absolute h-[90%] w-px bg-yellow-500/20"></div>
                    </div>

                    <div className="relative z-10 bg-black/60 p-2 backdrop-blur-[2px] rounded-lg border border-yellow-500/20">
                      <QRScanner
                        ref={scannerRef}
                        onScanSuccess={handleQRScan}
                        onScanFailure={() => { }}
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance Log */}
                <div className="bg-black/60 border border-white/10 p-6 flex flex-col h-[500px]" style={extremeCut}>
                  <h3 className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-4 border-b border-white/10 pb-4">Live Attendance Log</h3>
                  <div className="flex-grow overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                    {teams.filter(t => t.isPresent).length === 0 ? (
                      <div className="text-center text-gray-600 font-mono text-xs mt-10 uppercase">No teams scanned in yet.</div>
                    ) : (
                      teams.filter(t => t.isPresent).map(team => (
                        <div key={team.id} className="bg-white/5 border border-white/10 p-3 flex justify-between items-center transition-all hover:bg-white/10">
                          <div>
                            <p className="font-bold text-white text-sm uppercase">{team.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">{team.event} • ID: {team.id}</p>
                          </div>
                          <div className="bg-neon-cyan/20 text-neon-cyan text-[10px] font-bold px-2 py-1 uppercase tracking-widest border border-neon-cyan/50 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> GRANTED
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400 uppercase tracking-widest">Total Present:</span>
                    <span className="text-neon-cyan font-bold text-lg">{teams.filter(t => t.isPresent).length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "HOSTEL_SCANNER" && (
            <div className="max-w-6xl mx-auto space-y-8 mt-10">
              <div className="text-center mb-8">
                <h2 className="font-display font-bold text-3xl text-orange-500 uppercase">Hostel Allocation Scanner</h2>
                <p className="font-mono text-xs text-gray-400 mt-2 tracking-widest">Scan Participant QR to Confirm Arrival & Equip Room</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Scanner Module */}
                <div className="space-y-6 relative group">
                  {hostelScanResult && (
                    <div className={`p-4 border font-mono tracking-wider ${hostelScanResult.success ? 'bg-orange-500/20 border-orange-500' : 'bg-red-500/20 border-red-500 text-red-500'}`} style={cutCorners}>
                      <div className="text-center font-bold uppercase mb-2">
                        {hostelScanResult.message}
                      </div>

                      {hostelScanResult.success && hostelScanResult.acc && (
                        <div className="text-xs text-orange-300 space-y-1 mb-4 mt-4 bg-black/40 p-3">
                          <p><span className="text-gray-500">MEMBER:</span> {hostelScanResult.acc.memberName}</p>
                          <p><span className="text-gray-500">TEAM:</span> {hostelScanResult.acc.teamName}</p>
                          <p><span className="text-gray-500">GENDER:</span> {hostelScanResult.acc.gender}</p>
                          <p><span className="text-gray-500">ROOM:</span> <span className="text-white text-base font-bold">{hostelScanResult.acc.roomNumber || "UNASSIGNED"}</span></p>
                        </div>
                      )}

                      {hostelScanResult.success && hostelScanResult.rules && hostelScanResult.rules.length > 0 && (
                        <div className="bg-red-900/40 border border-red-500/30 p-3 mt-4 text-xs text-red-200">
                          <p className="font-bold text-red-400 mb-2 uppercase tracking-widest">⚠️ HOSTEL RULES ENFORCEMENT</p>
                          <ul className="space-y-1">
                            {hostelScanResult.rules.map((rule, idx) => (
                              <li key={idx}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setHostelScanResult(null);
                          if (hostelScannerRef.current) hostelScannerRef.current.resume();
                        }}
                        className="mt-4 w-full bg-white/10 hover:bg-white/20 p-2 text-xs transition-colors text-white"
                      >
                        SCAN NEXT
                      </button>
                    </div>
                  )}

                  <div className="bg-black/60 border border-white/10 p-4 relative overflow-hidden" style={extremeCut}>
                    {/* Radar Effect Background */}
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-40">
                      <div className="absolute w-[90%] aspect-square border-2 border-orange-500/20 rounded-full"></div>
                      <div className="absolute w-[60%] aspect-square border border-orange-500/10 rounded-full"></div>
                      <div className="absolute w-[30%] aspect-square border border-orange-500/10 rounded-full bg-orange-500/5"></div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute w-[90%] aspect-square rounded-full origin-center"
                        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(249,115,22,0.2) 90deg, transparent 90deg)' }}
                      ></motion.div>
                      {/* Crosshairs */}
                      <div className="absolute w-[90%] h-px bg-orange-500/20"></div>
                      <div className="absolute h-[90%] w-px bg-orange-500/20"></div>
                    </div>

                    <div className="relative z-10 bg-black/60 p-2 backdrop-blur-[2px] rounded-lg border border-orange-500/20">
                      <QRScanner
                        ref={hostelScannerRef}
                        onScanSuccess={handleHostelQRScan}
                        onScanFailure={() => { }}
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance Log */}
                <div className="bg-black/60 border border-white/10 p-6 flex flex-col h-[500px]" style={extremeCut}>
                  <h3 className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-4 border-b border-white/10 pb-4">Live Allocation Logs</h3>
                  <div className="flex-grow overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                    {hostelScannedLogs.length === 0 ? (
                      <div className="text-center text-gray-600 font-mono text-xs mt-10 uppercase">No recent scans.</div>
                    ) : (
                      hostelScannedLogs.map((log, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-3 flex justify-between items-center transition-all hover:bg-white/10">
                          <div>
                            <p className="font-bold text-white text-sm uppercase">{log.memberName}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">{log.teamName} • Room: <span className="text-orange-400">{log.roomNumber || "N/A"}</span></p>
                          </div>
                          <div className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px] font-bold px-2 py-1 uppercase tracking-widest border flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> ALLOCATED
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "GOD_MODE" && (
            <div className="max-w-6xl mx-auto space-y-8 mt-10">
              <div className="text-center mb-8">
                <h2 className="font-display font-bold text-4xl text-red-500 uppercase flex items-center justify-center gap-4">
                  <ShieldAlert className="w-10 h-10 animate-pulse" />
                  <GlitchText text="GOD MODE : OMEGA" />
                </h2>
                <p className="font-mono text-sm text-red-400 mt-2 tracking-widest border border-red-500/30 bg-red-900/20 inline-block px-4 py-1">WARNING: EXTREME DANGER. ACTIONS HERE AFFECT EVERY CONNECTED USER GLOBALLY IN REAL-TIME.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Global Events */}
                <div className="bg-black/60 border border-red-500/30 p-6 space-y-6" style={extremeCut}>
                  <h3 className="text-red-500 font-bold tracking-widest uppercase border-b border-red-500/20 pb-2">Global Live Events</h3>

                  <button onClick={async () => {
                    await fetch('/api/admin/god-mode', { method: 'POST', body: JSON.stringify({ type: 'FLASH', payload: { color: 'red' } }) });
                    alert("Flash Triggered");
                  }} className="w-full bg-red-900/20 hover:bg-red-500/20 border border-red-500/50 p-4 text-left group transition-all">
                    <p className="text-white font-bold tracking-widest flex items-center gap-2"><Zap className="w-4 h-4 text-red-500 group-hover:animate-pulse" /> INITIATE GLOBAL RED FLASH</p>
                    <p className="text-[10px] text-gray-400 mt-1">Flashes every user&apos;s screen blood red instantly.</p>
                  </button>

                  <button onClick={async () => {
                    await fetch('/api/admin/god-mode', { method: 'POST', body: JSON.stringify({ type: 'COUNTDOWN', payload: { minutes: 10, title: 'HACKATHON ENDING' } }) });
                    alert("Countdown Triggered");
                  }} className="w-full bg-orange-900/20 hover:bg-orange-500/20 border border-orange-500/50 p-4 text-left group transition-all">
                    <p className="text-white font-bold tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500 group-hover:animate-pulse" /> INITIATE 10 MINUTE COUNTDOWN</p>
                    <p className="text-[10px] text-gray-400 mt-1">Spawns an un-closeable global countdown overlay on all active screens.</p>
                  </button>

                  <button onClick={async () => {
                    await fetch('/api/admin/god-mode', { method: 'POST', body: JSON.stringify({ type: 'CUSTOM_ALERT', payload: { message: 'GRAVITON SERVERS COMPROMISED' } }) });
                    alert("Alert Triggered");
                  }} className="w-full bg-purple-900/20 hover:bg-purple-500/20 border border-purple-500/50 p-4 text-left group transition-all">
                    <p className="text-white font-bold tracking-widest flex items-center gap-2"><Terminal className="w-4 h-4 text-purple-500 group-hover:animate-pulse" /> SEND OVERRIDE ALERT</p>
                    <p className="text-[10px] text-gray-400 mt-1">Forces a massive neon alert modal on every connected device.</p>
                  </button>

                  <button onClick={toggleMaintenanceMode} className={`w-full ${isMaintenanceMode ? 'bg-orange-500/20 hover:bg-orange-500/40 border-orange-500' : 'bg-blue-900/20 hover:bg-blue-500/20 border-blue-500/50'} border p-4 text-left group transition-all`}>
                    <p className="text-white font-bold tracking-widest flex items-center gap-2"><Wrench className={`w-4 h-4 ${isMaintenanceMode ? 'text-orange-500 animate-pulse' : 'text-blue-500 group-hover:animate-pulse'}`} /> {isMaintenanceMode ? "RESTORE NORMAL OPS" : "INITIATE MAINTENANCE"}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Toggles persistent maintenance overlay across the entire platform.</p>
                  </button>

                  <button onClick={async () => {
                    const team = prompt("Enter winning team name:", "ALPHA SQUAD");
                    const event = prompt("Enter event name:", "ROBO WARS");
                    if (team && event) {
                      await fetch('/api/admin/god-mode', { method: 'POST', body: JSON.stringify({ type: 'WINNER_REVEAL', payload: { team, event } }) });
                      alert("Winner Reveal Triggered");
                    }
                  }} className="w-full bg-yellow-900/20 hover:bg-yellow-500/20 border border-yellow-500/50 p-4 text-left group transition-all">
                    <p className="text-white font-bold tracking-widest flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500 group-hover:animate-pulse" /> GLOBAL WINNER REVEAL</p>
                    <p className="text-[10px] text-gray-400 mt-1">Flashes a massive celebration screen across all active clients.</p>
                  </button>
                </div>

                {/* Purge Module */}
                <div className="bg-red-950/30 border border-red-500 p-6 flex flex-col justify-center items-center text-center space-y-4 relative overflow-hidden" style={extremeCut}>
                  <div className="absolute inset-0 bg-[url('/noise.png')] mix-blend-overlay opacity-30 pointer-events-none"></div>
                  <ShieldAlert className="w-20 h-20 text-red-500 animate-pulse" />
                  <h3 className="text-red-500 font-black text-2xl tracking-widest">INITIATE PURGE</h3>
                  <p className="text-xs text-red-300">Simulates a fatal server wipe across all clients.</p>
                  <button onClick={async () => {
                    if (confirm("ARE YOU ABSOLUTELY SURE? THIS WILL TRIGGER THE PURGE ANIMATION FOR EVERYONE.")) {
                      await fetch('/api/admin/god-mode', { method: 'POST', body: JSON.stringify({ type: 'PURGE', payload: {} }) });
                    }
                  }} className="mt-4 bg-red-600 text-white font-black px-10 py-4 uppercase tracking-widest hover:bg-red-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                    EXECUTE_PROTOCOL_0
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "CORE_ID" && adminUser?.role === 'SUPER_ADMIN' && (
            <div className="max-w-6xl mx-auto space-y-8 mt-10 text-white font-mono pb-20">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-display font-bold text-3xl text-neon-cyan uppercase">Core ID Generator</h2>
                <div className="h-px bg-neon-cyan/30 flex-grow"></div>
              </div>
              <CoreIdGenerator />
            </div>
          )}



          {activeTab === "ADMINS" &&
            <div className="max-w-4xl mx-auto space-y-8 mt-10 text-white font-mono">
              <h2 className="text-2xl text-green-500 font-bold uppercase tracking-widest border-b border-green-500/30 pb-4">User Management</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fm = new FormData(e.target);
                const res = await fetch("/api/admin/users", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(Object.fromEntries(fm))
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  fetch('/api/admin/users').then(r => r.json()).then(d => setAdminsList(d.users || []));
                  e.target.reset();
                } else {
                  alert(data.error || "Failed to create user.");
                }
              }} className="bg-black/60 p-6 border border-white/10 flex flex-col gap-4">
                <input required name="name" placeholder="Name" className="bg-transparent border border-white/20 p-2 focus:border-neon-cyan outline-none" />
                <select required name="newRole" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="bg-black border border-white/20 p-2 text-gray-400 focus:border-neon-cyan outline-none uppercase tracking-widest">
                  <option value="ADMIN">Admin</option>
                  <option value="VOLUNTEER">Volunteer</option>
                </select>
                {newUserRole === 'VOLUNTEER' && (
                  <select name="assignedEvent" className="bg-black border border-white/20 p-2 text-gray-400 focus:border-neon-cyan outline-none uppercase tracking-widest">
                    <option value="">No Event Assigned</option>
                    {eventsData.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                )}
                <button type="submit" className="bg-green-500/20 text-green-500 border border-green-500 p-2 hover:bg-green-500 hover:text-black">CREATE USER</button>
              </form>
              <div className="space-y-2 mt-4">
                {adminsList.map(a => {
                  return (
                  <div key={a._id} className="flex justify-between items-center bg-white/5 p-4 border border-white/10 group">
                    <div><p className="font-bold">{a.name}</p><p className="text-xs text-gray-400">{a.email}</p></div>
                    <div className="flex items-center gap-4">
                      {['ADMIN', 'VOLUNTEER'].includes(a.role) ? (
                        <div className="flex gap-2">
                          <select
                            value={a.role}
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              if (confirm(`Change ${a.name}'s role to ${newRole}?`)) {
                                const res = await fetch("/api/admin/users", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: a._id, newRole })
                                });
                                const data = await res.json();
                                if (res.ok && data.success) {
                                  fetch('/api/admin/users').then(r => r.json()).then(d => setAdminsList(d.users || []));
                                } else {
                                  alert(data.error || "Failed to update role.");
                                }
                              }
                            }}
                            className="bg-transparent text-xs tracking-widest uppercase outline-none cursor-pointer border-b border-transparent hover:border-white/30 transition-colors text-green-400"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="VOLUNTEER">Volunteer</option>
                          </select>
                          {a.role === 'VOLUNTEER' ? (
                            <select
                              value={a.assignedEvent || "none"}
                              onChange={async (e) => {
                                const assignedEvent = e.target.value;
                                const res = await fetch("/api/admin/users", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: a._id, assignedEvent })
                                });
                                if (res.ok) {
                                  fetch('/api/admin/users').then(r => r.json()).then(d => setAdminsList(d.users || []));
                                }
                              }}
                              className="bg-transparent text-xs tracking-widest uppercase outline-none cursor-pointer border-b border-transparent hover:border-white/30 transition-colors text-blue-400"
                            >
                              <option value="none">UNASSIGNED</option>
                              {eventsData.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                            </select>
                          ) : (
                            <span className="text-xs text-blue-400 font-bold uppercase tracking-widest ml-2">GLOBAL ACCESS</span>
                          )}
                        </div>
                      ) : (
                        <span className={`text-xs tracking-widest uppercase ${a.role === 'SUPER_ADMIN' ? 'text-red-500 font-bold' : 'text-blue-400'}`}>
                          {a.role}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          }

          {activeTab === "ARENA_SETUP" && adminUser?.assignedEvent &&
            <div className="max-w-4xl mx-auto space-y-8 mt-10 font-mono pb-20">
              <h2 className="text-2xl text-yellow-500 font-bold uppercase tracking-widest border-b border-yellow-500/30 pb-4">
                Arena Setup: {eventsList.find(e => e.id === adminUser.assignedEvent)?.name || adminUser.assignedEvent}
              </h2>
              
              <div className="bg-black/60 p-6 border border-white/10">
                {arenaList.find(a => a.eventId === adminUser.assignedEvent)?.checklist.map(item => (
                  <div key={item._id} className="flex justify-between items-center bg-white/5 p-4 border border-white/10 group mb-2 hover:bg-white/10 transition-colors">
                    <span className={`font-bold ${item.isReady ? 'text-green-500 line-through opacity-50' : 'text-white'}`}>{item.item}</span>
                    <button 
                      onClick={async () => {
                        const res = await fetch("/api/admin/arena", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ eventId: adminUser.assignedEvent, itemId: item._id, isReady: !item.isReady })
                        });
                        if (!res.ok) alert("Failed to update status");
                      }}
                      className={`p-2 border ${item.isReady ? 'border-green-500 text-green-500 bg-green-500/20' : 'border-gray-500 text-gray-500 bg-transparent hover:bg-gray-800'}`}
                    >
                      {item.isReady ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-gray-500 rounded-sm"></div>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          }

          {activeTab === "MISSION_CONTROL" &&
            <div className="max-w-7xl mx-auto space-y-8 mt-10 font-mono pb-20">
              <div className="flex items-center justify-between border-b border-red-500/30 pb-4">
                <div>
                  <h2 className="text-3xl font-black text-red-500 tracking-widest"><GlitchText text="MISSION CONTROL" /></h2>
                  <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Global Arena Readiness Overview</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 animate-pulse"></div> <span className="text-xs text-white">RED (HALTED)</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500"></div> <span className="text-xs text-white">AMBER (PREPPING)</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500"></div> <span className="text-xs text-white">GREEN (READY)</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {arenaList.map(arena => {
                  const event = eventsList.find(e => e.id === arena.eventId);
                  const statusColors = {
                    'RED': 'border-red-500 bg-red-500/10 text-red-500',
                    'AMBER': 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
                    'GREEN': 'border-green-500 bg-green-500/10 text-green-500'
                  };
                  return (
                    <div key={arena.eventId} className={`border ${statusColors[arena.status]} p-6 relative overflow-hidden`} style={extremeCut}>
                      {arena.status === 'RED' && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>}
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-xl tracking-widest uppercase text-white">{event?.name || arena.eventId}</h3>
                        <div className={`px-2 py-1 text-xs font-black tracking-widest ${arena.status === 'GREEN' ? 'bg-green-500 text-black' : arena.status === 'AMBER' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-black animate-pulse'}`}>
                          {arena.status}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {arena.checklist.map(item => (
                          <div key={item._id} className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className={`text-xs uppercase tracking-widest ${item.isReady ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{item.item}</span>
                            {item.isReady ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-gray-400">Assigned: {adminsList.filter(a => a.assignedEvent === arena.eventId).length} Volunteers</span>
                        <button 
                          disabled={arena.status !== 'GREEN'}
                          className={`text-xs px-4 py-2 font-bold tracking-widest ${arena.status === 'GREEN' ? 'bg-green-500 text-black hover:scale-105' : 'bg-gray-800 text-gray-500 cursor-not-allowed'} transition-all`}
                        >
                          {arena.status === 'GREEN' ? 'START EVENT' : 'LOCKED'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* COMMS BLAST SECTION */}
              <div className="mt-12 border-t border-red-500/30 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-red-500 tracking-widest"><GlitchText text="COMMS BLAST" /></h2>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Mass Broadcast System</p>
                  </div>
                  <Send className="w-8 h-8 text-red-500" />
                </div>
                <form onSubmit={handleSendBlast} className="bg-black/60 border border-red-500/30 p-6 space-y-4" style={cutCorners}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Target Audience</label>
                      <select name="target" value={blastTarget} onChange={(e) => setBlastTarget(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-red-500 outline-none uppercase text-xs tracking-widest">
                        <option value="ALL_VERIFIED">All Verified Teams</option>
                        <option value="ALL_REGISTERED">All Registered (Inc. Pending)</option>
                        <option value="SPECIFIC_EVENT">Specific Event</option>
                      </select>
                    </div>
                    {blastTarget === "SPECIFIC_EVENT" && (
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Select Event</label>
                        <select name="event" value={blastEvent} onChange={(e) => setBlastEvent(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-red-500 outline-none uppercase text-xs tracking-widest">
                          <option value="">-- SELECT EVENT --</option>
                          {eventsData.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Subject</label>
                    <input name="subject" value={blastSubject} onChange={(e) => setBlastSubject(e.target.value)} required placeholder="TRANSMISSION SUBJECT" className="w-full bg-transparent border border-white/20 p-2 focus:border-red-500 outline-none text-white text-xs font-mono uppercase" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Message Body</label>
                    <textarea name="message" value={blastMessage} onChange={(e) => setBlastMessage(e.target.value)} required rows="5" placeholder="Enter transmission details..." className="w-full bg-transparent border border-white/20 p-2 focus:border-red-500 outline-none text-white text-xs font-mono" />
                  </div>
                  <button type="submit" disabled={isSendingBlast} className={`w-full ${isSendingBlast ? 'bg-red-500/10 text-red-500' : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black'} border border-red-500 p-4 font-bold uppercase tracking-widest text-sm transition-colors flex justify-center items-center gap-2`}>
                    {isSendingBlast ? <span className="animate-pulse">TRANSMITTING...</span> : <><Send className="w-4 h-4" /> LAUNCH BLAST 🚀</>}
                  </button>
                  {blastResult && <p className="text-center text-xs text-neon-cyan mt-2">{blastResult}</p>}
                </form>
              </div>

              {/* ADMIN SECURITY HARDENING */}
              <div className="mt-12 border-t border-red-500/30 pt-8 max-w-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-red-500 tracking-widest"><GlitchText text="ADMIN SECURITY" /></h2>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Hardened credential protection</p>
                  </div>
                  <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                
                <div className="bg-black/60 border border-red-500/30 p-6 space-y-4" style={cutCorners}>
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">2FA Status:</span>
                    {adminUser?.twoFactorEnabled ? (
                      <span className="text-xs text-red-500 font-bold tracking-widest animate-pulse">
                        [ SECURED_2FA ]
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-500 font-bold tracking-widest">
                        [ UNSECURED ]
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
                    Enable Two-Factor Authentication to protect your root-level access. When active, logging in requires entering a 6-digit OTP code sent to your email.
                  </p>
                  <button 
                    type="button"
                    onClick={async () => {
                      const newVal = !adminUser?.twoFactorEnabled;
                      try {
                        const res = await fetch("/api/admin/toggle-2fa", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ enabled: newVal })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setAdminUser(prev => ({ ...prev, twoFactorEnabled: newVal }));
                          alert(data.message);
                        } else {
                          alert(data.error || "Failed to update admin security settings.");
                        }
                      } catch (err) {
                        alert("Error contacting security database.");
                      }
                    }}
                    className={`w-full py-4 border font-bold uppercase tracking-widest text-xs transition-colors flex justify-center items-center ${
                      adminUser?.twoFactorEnabled 
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black' 
                        : 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500 hover:text-black'
                    }`}
                    style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                  >
                    {adminUser?.twoFactorEnabled ? "DISABLE 2FA PROTOCOL" : "ACTIVATE 2FA PROTOCOL"}
                  </button>
                </div>
              </div>

            </div>
          }

          {activeTab === "HOSTEL" && (
            <div className="max-w-6xl mx-auto space-y-8 mt-10 text-white font-mono pb-20">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-display font-bold text-3xl text-blue-500 uppercase">Hostel Operations Command</h2>
                <div className="h-px bg-blue-500/30 flex-grow"></div>
              </div>

              <div className="flex gap-4 mb-6">
                <button onClick={() => setFilterHostelGender("ALL")} className={`px-6 py-2 text-xs uppercase tracking-widest border ${filterHostelGender === "ALL" ? "bg-blue-500/20 border-blue-500 text-blue-500" : "bg-transparent border-white/20 text-gray-400 hover:border-blue-500/50"}`}>ALL REQUESTS</button>
                <button onClick={() => setFilterHostelGender("BOYS")} className={`px-6 py-2 text-xs uppercase tracking-widest border ${filterHostelGender === "BOYS" ? "bg-blue-500/20 border-blue-500 text-blue-500" : "bg-transparent border-white/20 text-gray-400 hover:border-blue-500/50"}`}>BOYS HOSTEL</button>
                <button onClick={() => setFilterHostelGender("GIRLS")} className={`px-6 py-2 text-xs uppercase tracking-widest border ${filterHostelGender === "GIRLS" ? "bg-blue-500/20 border-blue-500 text-blue-500" : "bg-transparent border-white/20 text-gray-400 hover:border-blue-500/50"}`}>GIRLS HOSTEL</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accommodationsList
                  .filter(a => filterHostelGender === "ALL" || a.gender === filterHostelGender)
                  .map(acc => (
                    <div key={acc._id} className="bg-black/60 border border-white/10 p-6 flex flex-col gap-4 relative group" style={cutCorners}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">SQUAD: {acc.teamName}</span>
                          <h3 className="text-lg font-bold text-white uppercase">{acc.memberName}</h3>
                        </div>
                        <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 border ${acc.status === "APPROVED" ? "border-green-500 text-green-500 bg-green-500/10" :
                          acc.status === "DOCS_SUBMITTED" ? "border-blue-500 text-blue-500 bg-blue-500/10" :
                            acc.status === "FORM_SENT" ? "border-purple-500 text-purple-500 bg-purple-500/10" :
                              acc.status === "REJECTED" ? "border-red-500 text-red-500 bg-red-500/10" :
                                "border-yellow-500 text-yellow-500 bg-yellow-500/10"
                          }`}>
                          {acc.status}
                        </span>
                      </div>

                      {acc.status === "PENDING" && (
                        <div className="space-y-4 border-t border-white/10 pt-4 mt-2">
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                            <p>Age: <span className="text-white">{acc.age}</span></p>
                            <p>Gender: <span className="text-white">{acc.gender}</span></p>
                            <p className="col-span-2">Arrival: <span className="text-white">{new Date(acc.arrivalDateTime).toLocaleString()}</span></p>
                            <p className="col-span-2">Departure: <span className="text-white">{new Date(acc.departureDateTime).toLocaleString()}</span></p>
                            <p className="col-span-2">Emergency: <span className="text-white">{acc.emergencyContactName} ({acc.emergencyContactPhone})</span></p>
                          </div>

                          <a href={acc.idProofUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full bg-blue-500/20 text-blue-500 border border-blue-500 py-2 text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-black transition-colors">
                            VIEW ID PROOF
                          </a>

                          <div className="flex flex-col gap-2 mt-4">
                            <label className="text-[9px] text-green-400 uppercase">Finalize Room Allocation</label>
                            <div className="flex gap-2">
                              <input
                                id={`room_${acc._id}`}
                                type="text"
                                placeholder="Assign Room (e.g., A-102)"
                                className="w-full bg-transparent border-b border-white/20 text-white font-bold text-sm focus:outline-none focus:border-green-500 uppercase"
                              />
                              <button
                                onClick={async () => {
                                  const val = document.getElementById(`room_${acc._id}`).value;
                                  if (!val) return alert("Please assign a room number.");
                                  await fetch("/api/accommodation", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: acc._id, roomNumber: val, status: "APPROVED" })
                                  });
                                  fetch('/api/accommodation').then(r => r.json()).then(d => setAccommodationsList(d.requests || []));
                                }}
                                className="bg-green-500/20 text-green-500 border border-green-500 px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-green-500 hover:text-black transition-colors whitespace-nowrap"
                              >
                                ASSIGN & SEND QR
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {acc.status === "APPROVED" && (
                        <div className="space-y-4 border-t border-white/10 pt-4 mt-2">
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 mb-4">
                            <p className="col-span-2">Contact: <span className="text-white">{acc.emergencyContactName} ({acc.emergencyContactPhone})</span></p>
                          </div>
                          <a href={acc.idProofUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full bg-transparent text-gray-500 border border-white/10 py-1 text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                            VIEW ID PROOF
                          </a>
                          <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-gray-400 flex justify-between items-center">
                            <span>Room: <span className="text-green-500 font-bold text-sm">{acc.roomNumber}</span></span>
                            <span>Status: <span className={acc.isCheckedIn ? "text-neon-cyan font-bold" : "text-yellow-500"}>{acc.isCheckedIn ? "IN HOSTEL" : "OUTSIDE"}</span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {accommodationsList.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500 font-mono text-xs uppercase tracking-widest border border-dashed border-white/10">
                    No accommodation requests found.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "SPONSORS" && (
            <div className="max-w-4xl mx-auto space-y-8 mt-10 text-white font-mono">
              <h2 className="text-2xl text-pink-500 font-bold uppercase tracking-widest border-b border-pink-500/30 pb-4">Sponsors Database</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const file = form.logo.files[0];
                if (!file) return alert("Logo required");
                const fm = new FormData();
                fm.append("file", file);
                const upRes = await fetch("/api/admin/upload", { method: "POST", body: fm });
                const upData = await upRes.json();
                if (upData.success) {
                  await fetch("/api/admin/sponsors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: form.sponsorName.value,
                      tier: form.tier.value,
                      websiteUrl: form.websiteUrl.value,
                      logoUrl: upData.logoUrl,
                      amountInvested: Number(form.amountInvested.value) || 0
                    })
                  });
                  fetch('/api/admin/sponsors').then(r => r.json()).then(d => setSponsorsList(d.sponsors || []));
                  form.reset();
                }
              }} className="bg-black/60 p-6 border border-white/10 flex flex-col gap-4">
                <input required name="sponsorName" placeholder="Sponsor Name" className="bg-transparent border border-white/20 p-2 focus:border-neon-cyan outline-none" />
                <input name="websiteUrl" placeholder="Website URL" className="bg-transparent border border-white/20 p-2 focus:border-neon-cyan outline-none" />
                <div className="flex gap-4">
                  <select required name="tier" className="bg-black border border-white/20 p-2 text-gray-400 focus:border-neon-cyan outline-none uppercase tracking-widest w-1/2">
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="PARTNER">Partner</option>
                  </select>
                  <input type="number" name="amountInvested" placeholder="Investment Amount (₹)" className="bg-transparent border border-white/20 p-2 focus:border-neon-cyan outline-none w-1/2" />
                </div>
                <input required name="logo" type="file" accept="image/*" className="bg-transparent border border-white/20 p-2 text-xs text-gray-400" />
                <button type="submit" className="bg-pink-500/20 text-pink-500 border border-pink-500 p-2 hover:bg-pink-500 hover:text-black">ADD SPONSOR</button>
              </form>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {sponsorsList.map(s => (
                  <div key={s._id} className="bg-white/5 p-4 border border-white/10 flex flex-col items-center">
                    <img src={s.logoUrl} className="w-16 h-16 object-contain mb-2" />
                    <p className="font-bold text-center text-xs text-white">{s.name}</p>
                    <span className="text-[10px] text-pink-400">{s.tier}</span>
                    <span className="text-[10px] text-green-400 mt-1 font-bold">₹{(s.amountInvested || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}


          {activeTab === "LOGS" && (
            <div className="max-w-5xl mx-auto space-y-4 mt-10 text-white font-mono">
              <h2 className="text-2xl text-orange-500 font-bold uppercase tracking-widest border-b border-orange-500/30 pb-4">System Audit Log</h2>
              <div className="bg-black/80 border border-white/10 p-4 h-96 overflow-y-auto">
                {logsList.map(l => (
                  <div key={l._id} className="border-b border-white/5 py-2 flex items-start gap-4 hover:bg-white/5">
                    <span className="text-[10px] text-gray-500 w-32 shrink-0">{new Date(l.createdAt).toLocaleString()}</span>
                    <span className="text-[10px] text-orange-400 w-24 shrink-0 font-bold">{l.action}</span>
                    <span className="text-[10px] text-gray-400 w-32 shrink-0 overflow-hidden text-ellipsis">{l.adminEmail}</span>
                    <span className="text-[10px] text-white">{l.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "MAP" && (
            <div className="max-w-6xl mx-auto space-y-8 mt-10 text-white font-mono pb-20">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-display font-bold text-3xl text-cyan-500 uppercase">Tactical Campus Map</h2>
                <div className="h-px bg-cyan-500/30 flex-grow"></div>
              </div>

              <div className="bg-black/60 border border-cyan-500/30 p-8" style={extremeCut}>
                <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6 border-b border-white/10 pb-4">Manage Node Status (Updates Global Feed)</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mapNodes.map(node => (
                    <div key={node.id} className="bg-white/5 border border-white/10 p-4 flex flex-col gap-4 relative group hover:border-cyan-500/50 transition-colors" style={cutCorners}>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Node ID: {node.id}</span>
                        <div className={`w-2 h-2 rounded-full ${node.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : node.status === 'STANDBY' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : node.status === 'RESTRICTED' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : node.status === 'ACTIVE' ? 'bg-neon-cyan shadow-[0_0_10px_#66fcf1]' : 'bg-gray-500'}`} />
                      </div>

                      <div>
                        <label className="text-[9px] text-cyan-400 uppercase block mb-1">Node Designation</label>
                        <input
                          type="text"
                          value={node.label}
                          onChange={(e) => handleUpdateMapNode(node.id, 'label', e.target.value)}
                          disabled={adminUser?.role === 'VOLUNTEER'}
                          className={`w-full bg-transparent border-b border-white/20 text-white font-bold text-sm focus:outline-none focus:border-cyan-500 uppercase ${adminUser?.role === 'VOLUNTEER' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-cyan-400 uppercase block mb-1">Operational Status</label>
                        <select
                          value={node.status}
                          onChange={(e) => handleUpdateMapNode(node.id, 'status', e.target.value)}
                          disabled={adminUser?.role === 'VOLUNTEER'}
                          className={`w-full bg-black border border-white/20 text-gray-300 focus:outline-none p-2 text-xs uppercase tracking-wider focus:border-cyan-500 cursor-pointer ${adminUser?.role === 'VOLUNTEER' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="ONLINE">ONLINE (Normal Ops)</option>
                          <option value="STANDBY">STANDBY (Idle)</option>
                          <option value="RESTRICTED">RESTRICTED (No Entry)</option>
                          <option value="ACTIVE">ACTIVE (Event Running)</option>
                          <option value="OFFLINE">OFFLINE</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "SCHEDULE" && (
            <div className="max-w-7xl mx-auto space-y-8 mt-10 text-white font-mono pb-20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-orange-500 tracking-widest uppercase">
                    <GlitchText text="SCHEDULE MANAGER TERMINAL" />
                  </h2>
                  <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-bold">Day 1 & Day 2 Live Chronology Protocol</p>
                </div>
                <button
                  onClick={handleSaveSchedule}
                  disabled={isSavingSchedule}
                  className={`bg-orange-500/20 text-orange-500 border border-orange-500 px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-black transition-colors ${
                    isSavingSchedule ? "opacity-50 cursor-wait" : ""
                  }`}
                  style={cutCorners}
                >
                  {isSavingSchedule ? "TRANSMITTING..." : "SAVE PROTOCOL CHANGES"}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* DAY 1 EDITOR */}
                <div className="bg-black/60 border border-white/10 p-6 space-y-6" style={extremeCut}>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="font-bold text-lg text-neon-cyan tracking-wider uppercase">DAY 01 PROTOCOLS</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newEntry = {
                          time: "12:00 PM - 01:00 PM",
                          phase: `PHASE-${String((adminSchedule.day1?.length || 0) + 1).padStart(2, '0')}`,
                          title: "NEW PROTOCOL KICKOFF",
                          desc: "Enter details for the newly scheduled event phase.",
                          location: "Main Campus Stage",
                          color: "green-500"
                        };
                        setAdminSchedule({
                          ...adminSchedule,
                          day1: [...(adminSchedule.day1 || []), newEntry]
                        });
                      }}
                      className="bg-neon-cyan/20 border border-neon-cyan text-neon-cyan px-3 py-1.5 text-xs font-bold uppercase hover:bg-neon-cyan hover:text-black transition-colors"
                    >
                      + ADD ENTRY
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {adminSchedule.day1?.map((entry, index) => (
                      <div key={index} className="bg-black/40 border border-white/5 p-4 relative group space-y-4 hover:border-neon-cyan/30 transition-colors" style={cutCorners}>
                        <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedDay1 = [...adminSchedule.day1];
                              updatedDay1.splice(index, 1);
                              setAdminSchedule({ ...adminSchedule, day1: updatedDay1 });
                            }}
                            className="text-red-500 hover:text-red-400 p-1 bg-red-950/20 border border-red-500/30 hover:border-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase block mb-1">Phase Index</label>
                            <input
                              type="text"
                              value={entry.phase}
                              onChange={(e) => {
                                const updated = [...adminSchedule.day1];
                                updated[index].phase = e.target.value;
                                setAdminSchedule({ ...adminSchedule, day1: updated });
                              }}
                              className="w-full bg-transparent border-b border-white/20 text-white text-xs p-1 focus:outline-none focus:border-neon-cyan uppercase"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase block mb-1">Time Range</label>
                            <input
                              type="text"
                              value={entry.time}
                              onChange={(e) => {
                                const updated = [...adminSchedule.day1];
                                updated[index].time = e.target.value;
                                setAdminSchedule({ ...adminSchedule, day1: updated });
                              }}
                              className="w-full bg-transparent border-b border-white/20 text-white text-xs p-1 focus:outline-none focus:border-neon-cyan"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-500 uppercase block mb-1">Title / Action Name</label>
                          <input
                            type="text"
                            value={entry.title}
                            onChange={(e) => {
                              const updated = [...adminSchedule.day1];
                              updated[index].title = e.target.value;
                              setAdminSchedule({ ...adminSchedule, day1: updated });
                            }}
                            className="w-full bg-transparent border-b border-white/20 text-white text-xs p-1 focus:outline-none focus:border-neon-cyan uppercase"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-500 uppercase block mb-1">Description / Brief</label>
                          <textarea
                            rows="2"
                            value={entry.desc}
                            onChange={(e) => {
                              const updated = [...adminSchedule.day1];
                              updated[index].desc = e.target.value;
                              setAdminSchedule({ ...adminSchedule, day1: updated });
                            }}
                            className="w-full bg-transparent border border-white/10 text-white text-xs p-2 focus:outline-none focus:border-neon-cyan"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase block mb-1">Sector / Location</label>
                            <input
                              type="text"
                              value={entry.location}
                              onChange={(e) => {
                                const updated = [...adminSchedule.day1];
                                updated[index].location = e.target.value;
                                setAdminSchedule({ ...adminSchedule, day1: updated });
                              }}
                              className="w-full bg-transparent border-b border-white/20 text-white text-xs p-1 focus:outline-none focus:border-neon-cyan"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase block mb-1">Laser Theme Color</label>
                            <select
                              value={entry.color}
                              onChange={(e) => {
                                const updated = [...adminSchedule.day1];
                                updated[index].color = e.target.value;
                                setAdminSchedule({ ...adminSchedule, day1: updated });
                              }}
                              className="w-full bg-black border border-white/20 text-white text-xs p-1.5 focus:outline-none focus:border-neon-cyan uppercase"
                            >
                              <option value="green-500">Volt Green</option>
                              <option value="blue-500">Cobalt Blue</option>
                              <option value="cyan-500">Neon Cyan</option>
                              <option value="yellow-500">Solar Yellow</option>
                              <option value="purple-500">Electric Purple</option>
                              <option value="red-500">Crimson Red</option>
                              <option value="indigo-500">Indigo Aura</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    ))}
                    {(!adminSchedule.day1 || adminSchedule.day1.length === 0) && (
                      <p className="text-center text-gray-500 text-xs uppercase py-10">No entries defined for Day 1</p>
                    )}
                  </div>
                </div>

                {/* DAY 2 EDITOR */}
                <div className="bg-black/60 border border-white/10 p-6 space-y-6" style={extremeCut}>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="font-bold text-lg text-electric-purple tracking-wider uppercase">DAY 02 PROTOCOLS</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newEntry = {
                          time: "09:00 AM - 10:00 AM",
                          phase: `PHASE-${String((adminSchedule.day2?.length || 0) + 1).padStart(2, '0')}`,
                          title: "DAY 2 PROTOCOL ENTRY",
                          desc: "Enter details for this Day 2 event phase.",
                          location: "Main Campus Stage",
                          color: "purple-500"
                        };
                        setAdminSchedule({
                          ...adminSchedule,
                          day2: [...(adminSchedule.day2 || []), newEntry]
                        });
                      }}
                      className="bg-electric-purple/20 border border-electric-purple text-electric-purple px-3 py-1.5 text-xs font-bold uppercase hover:bg-electric-purple hover:text-black transition-colors"
                    >
                      + ADD ENTRY
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {adminSchedule.day2?.map((entry, index) => (
                      <div key={index} className="bg-black/40 border border-white/5 p-4 relative group space-y-4 hover:border-electric-purple/30 transition-colors" style={cutCorners}>
                        <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedDay2 = [...adminSchedule.day2];
                              updatedDay2.splice(index, 1);
                              setAdminSchedule({ ...adminSchedule, day2: updatedDay2 });
                            }}
                            className="text-red-500 hover:text-red-400 p-1 bg-red-950/20 border border-red-500/30 hover:border-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase block mb-1">Phase Index</label>
                            <input
                              type="text"
                              value={entry.phase}
                              onChange={(e) => {
                                const updated = [...adminSchedule.day2];
                                updated[index].phase = e.target.value;
                                setAdminSchedule({ ...adminSchedule, day2: updated });
                              }}
                              className="w-full bg-transparent border-b border-white/20 text-white text-xs p-1 focus:outline-none focus:border-electric-purple uppercase"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase block mb-1">Time Range</label>
                            <input
                              type="text"
                              value={entry.time}
                              onChange={(e) => {
                                const updated = [...adminSchedule.day2];
                                updated[index].time = e.target.value;
                                setAdminSchedule({ ...adminSchedule, day2: updated });
                              }}
                              className="w-full bg-transparent border-b border-white/20 text-white text-xs p-1 focus:outline-none focus:border-electric-purple"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-500 uppercase block mb-1">Title / Action Name</label>
                          <input
                            type="text"
                            value={entry.title}
                            onChange={(e) => {
                              const updated = [...adminSchedule.day2];
                              updated[index].title = e.target.value;
                              setAdminSchedule({ ...adminSchedule, day2: updated });
                            }}
                            className="w-full bg-transparent border-b border-white/20 text-white text-xs p-1 focus:outline-none focus:border-electric-purple uppercase"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-500 uppercase block mb-1">Description / Brief</label>
                          <textarea
                            rows="2"
                            value={entry.desc}
                            onChange={(e) => {
                              const updated = [...adminSchedule.day2];
                              updated[index].desc = e.target.value;
                              setAdminSchedule({ ...adminSchedule, day2: updated });
                            }}
                            className="w-full bg-transparent border border-white/10 text-white text-xs p-2 focus:outline-none focus:border-electric-purple"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase block mb-1">Sector / Location</label>
                            <input
                              type="text"
                              value={entry.location}
                              onChange={(e) => {
                                const updated = [...adminSchedule.day2];
                                updated[index].location = e.target.value;
                                setAdminSchedule({ ...adminSchedule, day2: updated });
                              }}
                              className="w-full bg-transparent border-b border-white/20 text-white text-xs p-1 focus:outline-none focus:border-electric-purple"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 uppercase block mb-1">Laser Theme Color</label>
                            <select
                              value={entry.color}
                              onChange={(e) => {
                                const updated = [...adminSchedule.day2];
                                updated[index].color = e.target.value;
                                setAdminSchedule({ ...adminSchedule, day2: updated });
                              }}
                              className="w-full bg-black border border-white/20 text-white text-xs p-1.5 focus:outline-none focus:border-electric-purple uppercase"
                            >
                              <option value="green-500">Volt Green</option>
                              <option value="blue-500">Cobalt Blue</option>
                              <option value="cyan-500">Neon Cyan</option>
                              <option value="yellow-500">Solar Yellow</option>
                              <option value="purple-500">Electric Purple</option>
                              <option value="red-500">Crimson Red</option>
                              <option value="indigo-500">Indigo Aura</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    ))}
                    {(!adminSchedule.day2 || adminSchedule.day2.length === 0) && (
                      <p className="text-center text-gray-500 text-xs uppercase py-10">No entries defined for Day 2</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}



        </div>
      </main>

    </div>
  );
}
