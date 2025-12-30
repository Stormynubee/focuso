import { useCallback, useRef } from 'react';
import { useCatThemeStore } from '@/store/useCatThemeStore';

type SoundType = 'meow' | 'purr' | 'chirp' | 'success' | 'click' | 'notification';

export function useCatSounds() {
  const soundEnabled = useCatThemeStore((state) => state.soundEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playMeow = useCallback(() => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Cat meow - pitch slides up then down
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, [getAudioContext]);

  const playPurr = useCallback(() => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    
    // Purr uses LFO modulation for rumbling effect
    lfo.frequency.value = 25;
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.value = 80;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    lfo.start(ctx.currentTime);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    lfo.stop(ctx.currentTime + 0.5);
  }, [getAudioContext]);

  const playChirp = useCallback(() => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Short high-pitched chirp
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }, [getAudioContext]);

  const playSuccess = useCallback(() => {
    const ctx = getAudioContext();
    
    // Happy ascending notes
    [0, 0.1, 0.2].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      const freq = 400 * Math.pow(1.25, i);
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  }, [getAudioContext]);

  const playClick = useCallback(() => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Soft click
    osc.type = 'sine';
    osc.frequency.value = 600;
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, [getAudioContext]);

  const playNotification = useCallback(() => {
    const ctx = getAudioContext();
    
    // Gentle bell-like notification
    [0, 0.15].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.value = delay === 0 ? 523 : 659; // C5 to E5
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
  }, [getAudioContext]);

  const play = useCallback((type: SoundType) => {
    if (!soundEnabled) return;
    
    try {
      switch (type) {
        case 'meow':
          playMeow();
          break;
        case 'purr':
          playPurr();
          break;
        case 'chirp':
          playChirp();
          break;
        case 'success':
          playSuccess();
          break;
        case 'click':
          playClick();
          break;
        case 'notification':
          playNotification();
          break;
      }
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }, [soundEnabled, playMeow, playPurr, playChirp, playSuccess, playClick, playNotification]);

  return { play, soundEnabled };
}
