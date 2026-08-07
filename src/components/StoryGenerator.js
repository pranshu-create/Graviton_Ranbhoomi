"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, Share2, CheckCircle2, Hexagon, Crosshair, Orbit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoryGenerator({ team, autoSend = false }) {
  const storyRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const hasAutoSent = useRef(false);

  const getBase64Image = useCallback(async () => {
    if (!storyRef.current) return null;
    
    // Safety check to ensure we are capturing the full size
    const originalTransform = storyRef.current.style.transform;
    storyRef.current.style.transform = 'none';
    
    try {
      const dataUrl = await htmlToImage.toJpeg(storyRef.current, {
        quality: 0.85,
        width: 1080,
        height: 1920,
        style: {
          transform: 'none',
          borderRadius: '0'
        }
      });
      return dataUrl;
    } catch (err) {
      console.error("Capture Error:", err);
      throw err;
    } finally {
      storyRef.current.style.transform = originalTransform;
    }
  }, []);

  const generateStory = useCallback(async () => {
    if (!team) return;
    setIsGenerating(true);
    try {
      const dataUrl = await getBase64Image();
      const link = document.createElement('a');
      link.download = `ranbhoomi_${team.name.replace(/\s+/g, '_')}_story.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate story:", err);
      alert("Error generating the Instagram Story image. Please check console.");
    } finally {
      setIsGenerating(false);
    }
  }, [team, getBase64Image]);

  const emailStory = useCallback(async (targetEmail = null, silent = false) => {
    if (!team) return;
    const emailToUse = targetEmail || team.memberDetails?.find(m => m.role === 'Leader')?.email;
    if (!emailToUse) {
      if (!silent) alert("No Leader email found for this team.");
      return;
    }

    setIsEmailing(true);
    try {
      const dataUrl = await getBase64Image();
      
      // Ensure we are sending a string, not an event object
      const payload = {
        toEmail: typeof emailToUse === 'string' ? emailToUse : team.memberDetails?.find(m => m.role === 'Leader')?.email,
        teamName: String(team.name),
        imageBase64: dataUrl
      };

      if (!payload.toEmail) throw new Error("Recalculated email is missing");

      const res = await fetch("/api/admin/send-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!silent) {
        if (data.success) {
          alert("Marketing Card successfully sent to the Team Leader!");
        } else {
          alert("Failed to send email: " + data.error);
        }
      }
    } catch (err) {
      console.error(err);
      if (!silent) alert("Network error while sending email.");
    } finally {
      setIsEmailing(false);
    }
  }, [team, getBase64Image]);

  useEffect(() => {
    if (autoSend && team && !hasAutoSent.current) {
      const leaderEmail = team.memberDetails?.find(m => m.role === 'Leader')?.email;
      if (leaderEmail) {
        hasAutoSent.current = true;
        // Wait for DOM to render correctly before generating
        setTimeout(() => {
          emailStory(leaderEmail, true); 
        }, 2000); // Increased delay for safety
      }
    }
  }, [team, autoSend, emailStory]);

  if (!team) {
    return <div className="text-gray-500 font-mono text-xs uppercase tracking-widest text-center py-10 border border-white/10 bg-black/40">Select a team from the registry to generate their marketing material.</div>;
  }

  const cutCorners = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  const leaderEmail = team.memberDetails?.find(m => m.role === 'Leader')?.email;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-8 flex flex-col gap-6 w-full bg-black/60 border border-white/10 p-6" style={cutCorners}>
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h3 className="text-orange-500 font-display font-bold uppercase tracking-widest text-lg">Marketing Uplink Station</h3>
            <p className="text-gray-400 font-mono text-[10px] tracking-widest uppercase">Target Entity: {team.name}</p>
          </div>
          <Crosshair className="w-5 h-5 text-orange-500/30" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {leaderEmail && (
            <button 
              onClick={() => emailStory()} 
              disabled={isEmailing || isGenerating}
              className={`flex items-center justify-center gap-2 px-4 py-1.5 border font-bold text-[10px] tracking-widest uppercase transition-all ${isEmailing ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' : 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black shadow-[0_0_15px_rgba(102,252,241,0.4)]'}`}
              style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
            >
              {isEmailing ? (
                <span className="flex items-center gap-2"><Orbit className="w-3 h-3 animate-spin" /> UPLINKING...</span>
              ) : (
                <span className="flex items-center gap-2"><Share2 className="w-3 h-3" /> EMAIL LEADER</span>
              )}
            </button>
          )}
          <button 
            onClick={generateStory} 
            disabled={isGenerating || isEmailing}
            className={`flex items-center justify-center gap-2 px-4 py-1.5 border font-bold text-[10px] tracking-widest uppercase transition-all ${isGenerating ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' : 'bg-orange-500/20 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]'}`}
            style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2"><Orbit className="w-3 h-3 animate-spin" /> EXPORTING...</span>
            ) : (
              <span className="flex items-center gap-2"><Download className="w-3 h-3" /> DOWNLOAD</span>
            )}
          </button>
        </div>
      </div>

      {/* Preview Container - Scaled down for dashboard viewing (Portrait 1080x1920) */}
      <div className="relative border-4 border-gray-800 rounded-3xl overflow-hidden shadow-2xl bg-black" style={{ width: '270px', height: '480px' }}>
        <p className="absolute top-2 left-0 w-full text-center text-[8px] text-gray-500 font-mono tracking-widest z-50 pointer-events-none uppercase">Preview Scale: 25% (9:16 Portrait)</p>
        
        {/* Actual 1080x1920 DOM element that will be captured. */}
        <div 
          ref={storyRef}
          className="absolute top-0 left-0 bg-[#050505] text-white overflow-hidden origin-top-left flex flex-col items-center justify-center"
          style={{ 
            width: '1080px', 
            height: '1920px',
            transform: 'scale(0.25)', 
          }}
        >
          {/* Premium Background */}
          <div className="absolute inset-0 bg-[url('/story_bg.png')] bg-cover bg-center bg-no-repeat"></div>
          
          {/* Subtle Dark Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Cyberpunk Radar Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none mix-blend-overlay">
             <div className="absolute w-[900px] h-[900px] border border-orange-500 rounded-full animate-spin-slow"></div>
             <div className="absolute w-[600px] h-[600px] border border-orange-500 border-dashed rounded-full animate-reverse-spin"></div>
          </div>

          <div className="absolute top-16 left-16 z-20">
            <h1 className="text-6xl font-display font-black tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">GRAVITON<span className="text-orange-500">.</span></h1>
            <p className="text-2xl font-mono text-orange-400 tracking-[0.5em] mt-2 font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">ADVANCED RESEARCH INSTITUTE</p>
          </div>

          <div className="absolute top-16 right-16 border border-orange-500/50 bg-black/40 backdrop-blur-sm p-4 z-20 rounded-xl">
            <Crosshair className="w-16 h-16 text-orange-500 animate-pulse" />
          </div>

          {/* Main Content Layout - Portrait (Stacked) */}
          <div className="relative z-20 w-full px-16 flex flex-col items-center mt-40">
            
            {/* Glassmorphism Card */}
            <div className="relative bg-black/50 border border-white/20 p-12 mb-16 flex flex-col items-center w-full max-w-4xl backdrop-blur-xl shadow-[0_0_50px_rgba(249,115,22,0.15)] rounded-3xl overflow-hidden">
              {/* Decorative Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-orange-500 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-neon-cyan rounded-br-3xl"></div>

              <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-black px-10 py-3 font-black tracking-widest text-3xl mb-12 uppercase rounded-full shadow-lg">
                TARGET ACQUIRED
              </div>
              
              <div className="flex flex-col items-center gap-6 mb-12">
                <div className="p-8 bg-neon-cyan/10 rounded-full border border-neon-cyan/30 shadow-[0_0_30px_rgba(102,252,241,0.3)]">
                  <CheckCircle2 className="w-24 h-24 text-neon-cyan drop-shadow-[0_0_20px_rgba(102,252,241,0.8)]" />
                </div>
                <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neon-cyan drop-shadow-[0_0_20px_rgba(102,252,241,0.4)] tracking-widest uppercase">VERIFIED</h2>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-12"></div>

              <p className="text-orange-400 font-mono font-bold tracking-widest text-3xl mb-4 uppercase drop-shadow-md">TEAM DESIGNATION</p>
              <h3 className="text-[90px] font-display font-black text-white text-center mb-16 uppercase tracking-wider leading-tight w-full drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" style={{ textWrap: "balance" }}>
                {team.name}
              </h3>

              <div className="w-full flex justify-between items-center bg-black/60 border border-white/10 rounded-2xl p-10 shadow-inner">
                <div>
                  <p className="text-gray-400 font-mono tracking-widest text-2xl mb-2 uppercase">OPERATION</p>
                  <p className="text-5xl font-bold text-orange-500 tracking-widest uppercase">{team.event}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 font-mono tracking-widest text-2xl mb-2 uppercase">OPERATIVES</p>
                  <p className="text-5xl font-bold text-neon-cyan tracking-widest uppercase">{team.members || 1} M</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center mt-8 text-center bg-black/40 px-12 py-8 rounded-full backdrop-blur-md border border-white/5">
              <h1 className="text-[100px] font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-neon-cyan tracking-tighter drop-shadow-2xl">
                RANBHOOMI <span className="text-white">2.0</span>
              </h1>
              <p className="text-3xl font-mono text-white tracking-[0.5em] mt-4 uppercase drop-shadow-md font-bold">SEE YOU IN THE ARENA</p>
            </div>

          </div>

          <div className="absolute bottom-16 w-full px-16 flex justify-between items-end z-20">
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-sm ${i === 0 ? 'bg-orange-500' : 'bg-orange-500/30'} animate-pulse`}></div>
              ))}
            </div>
            <div className="text-right bg-black/50 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/10">
              <p className="text-3xl font-mono font-bold text-orange-500 tracking-widest">#GRAVITON_ROBOTICS</p>
              <p className="text-xl font-mono text-white tracking-[0.2em] mt-2 uppercase">PREPARE FOR BATTLE</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
