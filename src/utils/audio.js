"use client";

let audioCtx = null;
let unlocked = false;

export const unlockAudio = () => {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  if (!unlocked) {
    // Play silent buffer to unlock audio engine completely
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
    unlocked = true;
  }
};

const getAudioCtx = () => {
  if (!audioCtx) unlockAudio();
  return audioCtx;
};

export const playHoverSound = () => {
  try {
    const ctx = getAudioCtx();
    if (!ctx || ctx.state === 'suspended') return;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);

    // Increased volume significantly
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {}
};

export const playClickSound = () => {
  try {
    const ctx = getAudioCtx();
    if (!ctx || ctx.state === 'suspended') return;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

    // Increased volume significantly
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

export const playHackerSound = () => {
  try {
    const ctx = getAudioCtx();
    if (!ctx || ctx.state === 'suspended') return;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

export const playBackgroundSound = () => {
  try {
    const ctx = getAudioCtx();
    if (!ctx || ctx.state === 'suspended') return;
    
    // Prevent multiple instances from running
    if (window._bgAudioPlaying) return;
    window._bgAudioPlaying = true;

    // Create a deep, slowly pulsating sci-fi engine drone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();

    // Deep sub-bass frequency
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // Low hum
    
    // Slightly detuned overtone for thickness
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110.5, ctx.currentTime);

    // LFO for slow "breathing" / pulsing effect
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // 1 pulse every ~6 seconds
    
    // Apply LFO to frequency modulation for a shifting sound
    lfoGain.gain.setValueAtTime(5, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    // Global volume control (Very quiet background ambiance)
    mainGain.gain.setValueAtTime(0, ctx.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 8); // Fade in over 8 seconds smoothly

    osc1.connect(mainGain);
    osc2.connect(mainGain);
    mainGain.connect(ctx.destination);

    lfo.start();
    osc1.start();
    osc2.start();
  } catch (e) {}
};
