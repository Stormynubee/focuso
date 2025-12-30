import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CatPersonality = 'calm' | 'playful' | 'sleepy';
export type CatMood = 'happy' | 'focused' | 'curious' | 'sleepy' | 'celebrating';
export type CatStyle = 'default' | 'orange' | 'gray' | 'calico';

interface CatThemeState {
  // Theme settings
  isEnabled: boolean;
  personality: CatPersonality;
  animationIntensity: 'low' | 'medium' | 'high';
  soundEnabled: boolean;
  
  // UI Color Theme (hue value 0-360)
  uiHue: number;
  
  // Timer Cat settings
  timerCatEnabled: boolean;
  timerCatStyle: CatStyle;
  timerCatMode: 'walking' | 'sitting';
  
  // Spotify Cat settings
  spotifyCatEnabled: boolean;
  spotifyCatStyle: CatStyle;
  spotifyCatPosition: { x: number; y: number } | null;
  spotifyCatLocked: boolean;
  
  // Per-page cat visibility
  pageCats: {
    dashboard: boolean;
    focus: boolean;
    analytics: boolean;
    leaderboard: boolean;
    profile: boolean;
    couple: boolean;
    chat: boolean;
  };
  
  // Current state
  currentMood: CatMood;
  isInteracting: boolean;
  lastInteraction: Date | null;
  
  // Actions
  setEnabled: (enabled: boolean) => void;
  setPersonality: (personality: CatPersonality) => void;
  setAnimationIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMood: (mood: CatMood) => void;
  triggerInteraction: () => void;
  setUiHue: (hue: number) => void;
  
  // Timer Cat actions
  setTimerCatEnabled: (enabled: boolean) => void;
  setTimerCatStyle: (style: CatStyle) => void;
  setTimerCatMode: (mode: 'walking' | 'sitting') => void;
  
  // Spotify Cat actions
  setSpotifyCatEnabled: (enabled: boolean) => void;
  setSpotifyCatStyle: (style: CatStyle) => void;
  setSpotifyCatPosition: (position: { x: number; y: number } | null) => void;
  setSpotifyCatLocked: (locked: boolean) => void;
  
  // Per-page cat actions
  setPageCat: (page: keyof CatThemeState['pageCats'], enabled: boolean) => void;
  
  // Reactions based on app events
  onStudyStart: () => void;
  onStudyComplete: () => void;
  onBreakStart: () => void;
  onDistraction: (appName: string) => void;
  onPartnerConnect: () => void;
}

export const useCatThemeStore = create<CatThemeState>()(
  persist(
    (set, get) => ({
      // Defaults - Cat Theme ON by default (subtle)
      isEnabled: true,
      personality: 'calm',
      animationIntensity: 'low',
      soundEnabled: false,
      currentMood: 'happy',
      isInteracting: false,
      lastInteraction: null,
      
      // UI Color Theme - default lavender hue (270)
      uiHue: 270,
      
      // Timer Cat defaults
      timerCatEnabled: true,
      timerCatStyle: 'default',
      timerCatMode: 'walking',
      
      // Spotify Cat defaults
      spotifyCatEnabled: true,
      spotifyCatStyle: 'orange',
      spotifyCatPosition: null,
      spotifyCatLocked: false,
      
      // Per-page cats - all enabled by default
      pageCats: {
        dashboard: true,
        focus: true,
        analytics: true,
        leaderboard: true,
        profile: true,
        couple: true,
        chat: true,
      },

      setEnabled: (enabled) => set({ isEnabled: enabled }),
      
      setPersonality: (personality) => set({ personality }),
      
      setAnimationIntensity: (intensity) => set({ animationIntensity: intensity }),
      
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      
      setMood: (mood) => set({ currentMood: mood }),
      
      setUiHue: (hue) => set({ uiHue: hue }),
      
      triggerInteraction: () => {
        set({ isInteracting: true, lastInteraction: new Date() });
        setTimeout(() => set({ isInteracting: false }), 2000);
      },
      
      // Timer Cat
      setTimerCatEnabled: (enabled) => set({ timerCatEnabled: enabled }),
      setTimerCatStyle: (style) => set({ timerCatStyle: style }),
      setTimerCatMode: (mode) => set({ timerCatMode: mode }),
      
      // Spotify Cat
      setSpotifyCatEnabled: (enabled) => set({ spotifyCatEnabled: enabled }),
      setSpotifyCatStyle: (style) => set({ spotifyCatStyle: style }),
      setSpotifyCatPosition: (position) => set({ spotifyCatPosition: position }),
      setSpotifyCatLocked: (locked) => set({ spotifyCatLocked: locked }),
      
      // Per-page
      setPageCat: (page, enabled) => set((state) => ({
        pageCats: { ...state.pageCats, [page]: enabled }
      })),

      // Event-based reactions
      onStudyStart: () => {
        set({ currentMood: 'focused' });
      },

      onStudyComplete: () => {
        set({ currentMood: 'celebrating', isInteracting: true });
        setTimeout(() => set({ currentMood: 'happy', isInteracting: false }), 3000);
      },

      onBreakStart: () => {
        const personality = get().personality;
        set({ currentMood: personality === 'sleepy' ? 'sleepy' : 'happy' });
      },

      onDistraction: (appName: string) => {
        set({ currentMood: 'curious', isInteracting: true });
        setTimeout(() => set({ currentMood: 'focused', isInteracting: false }), 2000);
      },

      onPartnerConnect: () => {
        set({ currentMood: 'happy', isInteracting: true });
        setTimeout(() => set({ isInteracting: false }), 2000);
      },
    }),
    {
      name: 'focusos-cat-theme',
    }
  )
);
