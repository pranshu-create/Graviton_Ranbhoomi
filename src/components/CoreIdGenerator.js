"use client";

import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, Orbit, Upload, Cpu, Zap, Activity, ShieldCheck, Target, SquareTerminal } from 'lucide-react';

export default function CoreIdGenerator() {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: "PRANSHU SHARMA",
    role: "PRESIDENT",
    phone: "+91 7693091309",
    email: "spranshu671@gmail.com",
    photo: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, photo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getBase64Image = async () => {
    if (!cardRef.current) return null;
    const originalTransform = cardRef.current.style.transform;
    cardRef.current.style.transform = 'none';
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        width: 600,
        height: 940,
        style: { transform: 'none', borderRadius: '0' }
      });
      return dataUrl;
    } catch (err) {
      console.error("Capture Error:", err);
      throw err;
    } finally {
      cardRef.current.style.transform = originalTransform;
    }
  };

  const generateCard = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await getBase64Image();
      const link = document.createElement('a');
      link.download = `Graviton_Core_ID_${formData.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate ID Card:", err);
      alert("Error generating the ID Card image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const techClip = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };
  const cardShape = { clipPath: "polygon(0 40px, 40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)" };
  const hexClip = { clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" };

  return (
    <div className="flex flex-col xl:flex-row gap-12 w-full items-start justify-center p-4">

      {/* Config Form (Left) */}
      <div className="w-full xl:w-1/2 bg-black/80 border border-red-500/20 p-8 flex flex-col gap-6 relative" style={techClip}>
        <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-red-500/40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-red-500/40 pointer-events-none"></div>

        <div className="flex items-center gap-4 border-b border-red-500/20 pb-6">
          <div className="p-3 bg-red-600/10 border border-red-600/40 rounded-lg">
            <SquareTerminal className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">ID COMMAND CENTER</h2>
            <p className="text-[10px] text-red-500 font-mono tracking-[0.4em] uppercase mt-1 animate-pulse">Establishing Secure Uplink...</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">Full Operative Designation</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/50 border border-red-500/30 p-3 text-sm focus:border-red-500 focus:outline-none text-white font-mono uppercase tracking-[0.2em] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">Command Role</label>
            <input name="role" value={formData.role} onChange={handleChange} className="w-full bg-black/50 border border-red-500/30 p-3 text-sm focus:border-red-500 focus:outline-none text-white font-mono uppercase tracking-[0.2em] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">Emergency Frequency</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/50 border border-red-500/30 p-3 text-sm focus:border-red-500 focus:outline-none text-white font-mono uppercase tracking-[0.2em] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">Secure Email Uplink</label>
            <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/50 border border-red-500/30 p-3 text-sm focus:border-red-500 focus:outline-none text-white font-mono uppercase tracking-[0.2em] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">Neural Interface Scan (Photo)</label>
            <div className="relative">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="id-photo-upload" />
              <label htmlFor="id-photo-upload" className="flex items-center justify-center gap-3 w-full bg-red-950/20 border border-dashed border-red-500/30 hover:border-red-500 p-4 text-xs text-red-400 cursor-pointer font-mono tracking-widest uppercase transition-all hover:bg-red-950/40">
                <Upload className="w-5 h-5" />
                {formData.photo ? "RE-SCAN PHOTO" : "UPLOAD HEADSHOT"}
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={generateCard}
          disabled={isGenerating}
          className={`mt-4 flex items-center justify-center gap-3 px-8 py-5 border font-black text-sm tracking-[0.3em] uppercase transition-all ${isGenerating ? 'bg-red-900/10 border-gray-700 text-gray-600' : 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_40px_rgba(220,38,38,0.3)]'}`}
          style={techClip}
        >
          {isGenerating ? (
            <span className="flex items-center gap-3"><Orbit className="w-5 h-5 animate-spin" /> GENERATING ASSET...</span>
          ) : (
            <span className="flex items-center gap-3"><Download className="w-5 h-5" /> INITIALIZE DOWNLOAD</span>
          )}
        </button>
      </div>

      {/* ID Card Preview (Right) */}
      <div className="relative shadow-[0_0_80px_rgba(0,0,0,0.8)]" style={{ width: '340px', height: '530px' }}>
        <p className="absolute -top-6 left-0 w-full text-center text-[9px] text-red-500/40 font-mono tracking-[0.4em] uppercase">Tactical_ID_v04.PNG</p>

        <div
          ref={cardRef}
          className="absolute top-0 left-0 bg-[#020202] text-white overflow-hidden origin-top-left flex flex-col"
          style={{
            width: '600px',
            height: '940px',
            transform: 'scale(0.56)',
            ...cardShape
          }}
        >
          {/* 1. LAYER: DYNAMIC BACKGROUND */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#300000_0%,#000000_70%)]"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

          {/* Animated Glow Elements */}
          <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-red-600/5 blur-[100px] rounded-full"></div>

          {/* 2. LAYER: DECORATIVE BORDERS */}
          <div className="absolute inset-4 border border-red-500/20" style={cardShape}></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>

          {/* Side status bar */}
          <div className="absolute top-40 left-0 w-1 h-80 flex flex-col gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`w-full flex-grow ${i < 8 ? 'bg-red-600' : 'bg-red-600/20'}`}></div>
            ))}
          </div>

          {/* 3. LAYER: CONTENT - HEADER */}
          <div className="relative z-10 pt-16 px-12 flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-[2px] bg-red-600"></div>
                <p className="text-[10px] font-mono text-red-500 font-black tracking-[0.5em] uppercase">COMMAND_UNIT</p>
              </div>
              <h1 className="text-6xl font-display font-black tracking-tighter text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                GRAVITON<span className="text-red-600">.</span>
              </h1>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full scale-150 animate-pulse"></div>
              <img src="/Logo.png" alt="Logo" className="w-24 h-24 relative z-10 filter brightness-0 invert" style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 10px rgba(255,255,255,0.4))' }} />
            </div>
          </div>

          {/* 4. LAYER: MAIN DISPLAY AREA (PHOTO & DATA) */}
          <div className="relative z-10 mt-12 flex flex-col items-center px-12">

            {/* Hexagonal Image Container */}
            <div className="relative mb-14 group">
              {/* Multi-layered frames */}
              <div className="absolute inset-[-12px] bg-red-600/20 blur-md opacity-50 group-hover:opacity-100 transition-opacity" style={hexClip}></div>
              <div className="absolute inset-[-6px] border-[2px] border-red-600/40" style={hexClip}></div>
              <div className="absolute inset-[-2px] border-[3px] border-white" style={hexClip}></div>

              <div className="w-[280px] h-[320px] bg-[#111] overflow-hidden relative shadow-[0_0_50px_rgba(220,38,38,0.2)]" style={hexClip}>
                {formData.photo ? (
                  <img src={formData.photo} alt="Operative" className="w-full h-full object-cover filter contrast-110 brightness-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
                    <Target className="w-20 h-20 text-white/5 animate-spin-slow" />
                    <p className="text-[10px] font-mono text-red-600 mt-4 tracking-[0.4em] font-black italic">AWAITING_BIO_LINK</p>
                  </div>
                )}
                {/* Coordinate brackets */}
                <div className="absolute top-4 left-10 w-4 h-4 border-t-2 border-l-2 border-red-600"></div>
                <div className="absolute bottom-4 right-10 w-4 h-4 border-b-2 border-r-2 border-red-600"></div>
              </div>

              {/* Bio-metric Tag */}
              <div className="absolute -bottom-6 -right-4 bg-red-600 text-white px-4 py-2 font-mono text-[9px] font-black tracking-widest flex items-center gap-2 shadow-xl border border-white/20">
                <Activity className="w-3 h-3" /> VERIFIED_OP
              </div>
            </div>

            {/* IDENTITY DATA PANEL */}
            <div className="w-full relative flex flex-col items-center">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

              <div className="pt-8 text-center w-full">
                <h2 className="text-[52px] font-display font-black text-white leading-none uppercase tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  {formData.name}
                </h2>

                <div className="mt-8 relative inline-block px-12 py-3">
                  <div className="absolute inset-0 bg-red-600 skew-x-[-15deg] shadow-[0_0_30px_rgba(220,38,38,0.4)]"></div>
                  <p className="relative z-10 text-2xl font-mono text-white font-black tracking-[0.4em] uppercase">
                    {formData.role}
                  </p>
                </div>
              </div>

              {/* GRID FOOTER DATA */}
              <div className="w-full mt-12 grid grid-cols-2 gap-px bg-white/10 p-px">
                <div className="bg-black/80 p-6 flex flex-col items-center">
                  <p className="text-[9px] font-mono text-red-500 font-black tracking-[0.4em] mb-2 uppercase italic">Email ID</p>
                  <p className="text-lg font-bold text-white tracking-[0.1em] lowercase">{formData.email}</p>
                </div>
                <div className="bg-black/80 p-6 flex flex-col items-center">
                  <p className="text-[9px] font-mono text-red-500 font-black tracking-[0.4em] mb-2 uppercase italic">Emergency Contact</p>
                  <p className="text-lg font-bold text-white tracking-[0.1em] uppercase">{formData.phone}</p>
                </div>
              </div>


            </div>
          </div>

          {/* 5. LAYER: FOOTER METADATA */}
          <div className="absolute bottom-10 w-full px-12 flex justify-between items-end z-10">
            <div className="flex flex-col">
              <div className="flex gap-1 mb-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 ${i < 5 ? 'bg-red-600' : 'bg-red-600/20'}`}></div>
                ))}
              </div>
              <p className="text-[8px] font-mono text-white/20 tracking-[0.5em] uppercase italic">ISS_AUTH: GRAVITON_ROBOTICS_HQ</p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-mono text-white/20 font-black tracking-[-2px] italic">REv_26_27</p>
            </div>
          </div>

          {/* Diagonal Warning Corner */}
          <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 right-0 w-32 h-10 bg-red-600 rotate-[-45deg] translate-x-10 translate-y-10 flex items-center justify-center">
              <p className="text-white text-[8px] font-black font-mono tracking-widest">SECURITY_ACTIVE</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
