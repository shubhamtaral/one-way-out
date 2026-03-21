import { useCallback, useRef, useEffect } from 'react';

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Low rumble/drone
function playDrone(frequency, duration, volume = 0.1) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(frequency * 0.8, ctx.currentTime + duration);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// Creepy whisper-like noise
function playWhisper(duration, volume = 0.05) {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Modulated noise for whisper effect
      const mod = Math.sin(i / 500) * 0.5 + 0.5;
      data[i] = (Math.random() * 2 - 1) * mod;
    }
    
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  } catch (e) {}
}

// Distorted screech
function playScreech(volume = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const distortion = ctx.createWaveShaper();
    
    // Create distortion curve
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * 5);
    }
    distortion.curve = curve;
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(300, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(150, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    osc1.connect(distortion);
    osc2.connect(distortion);
    distortion.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// Deep impact/thud
function playImpact(volume = 0.2) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

// Death sound - long terrifying sequence
function playDeath() {
  try {
    const ctx = getAudioContext();
    
    // Deep rumble
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(40, ctx.currentTime);
    rumble.frequency.linearRampToValueAtTime(20, ctx.currentTime + 2);
    rumbleGain.gain.setValueAtTime(0.3, ctx.currentTime);
    rumbleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
    rumble.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumble.start();
    rumble.stop(ctx.currentTime + 2);
    
    // Screech
    setTimeout(() => playScreech(0.25), 100);
    setTimeout(() => playScreech(0.2), 400);
    
    // Whispers
    setTimeout(() => playWhisper(1.5, 0.1), 200);
    
    // Final impact
    setTimeout(() => playImpact(0.3), 800);
    
  } catch (e) {}
}

export function useSound() {
  const heartbeatRef = useRef(null);
  const heartbeatSpeed = useRef(1200);

  // Subtle key click - softer, creepier
  const playKeystroke = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100 + Math.random() * 50, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }, []);

  // Error - creature approaches with screech
  const playError = useCallback(() => {
    playScreech(0.12);
    playImpact(0.15);
    playWhisper(0.5, 0.08);
  }, []);

  // Success - brief relief, but still tense
  const playSuccess = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }, []);

  // Game over - full horror
  const playGameOver = useCallback(() => {
    playDeath();
  }, []);

  // Soft tick
  const playTick = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch (e) {}
  }, []);

  // Warning tick - deeper, more urgent
  const playWarningTick = useCallback(() => {
    playDrone(50, 0.15, 0.08);
  }, []);

  // Heartbeat - organic, terrifying
  const startHeartbeat = useCallback((mistakes) => {
    heartbeatSpeed.current = Math.max(400, 1200 - (mistakes * 200));
    
    if (heartbeatRef.current) return;
    
    const beat = () => {
      // Two-part heartbeat (lub-dub)
      try {
        const ctx = getAudioContext();
        
        // Lub
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(40, ctx.currentTime);
        gain1.gain.setValueAtTime(0.1, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.1);
        
        // Dub (slightly delayed)
        setTimeout(() => {
          const ctx = getAudioContext();
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(35, ctx.currentTime);
          gain2.gain.setValueAtTime(0.08, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.12);
        }, 100);
      } catch (e) {}
      
      heartbeatRef.current = setTimeout(beat, heartbeatSpeed.current);
    };
    beat();
  }, []);

  const updateHeartbeat = useCallback((mistakes) => {
    heartbeatSpeed.current = Math.max(400, 1200 - (mistakes * 200));
    // Add whisper on each mistake
    if (mistakes > 0) {
      playWhisper(0.8, 0.05 + mistakes * 0.02);
    }
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearTimeout(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopHeartbeat();
  }, [stopHeartbeat]);

  return {
    playKeystroke,
    playError,
    playSuccess,
    playGameOver,
    playTick,
    playWarningTick,
    startHeartbeat,
    updateHeartbeat,
    stopHeartbeat,
  };
}
