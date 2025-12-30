import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CatPersonality = 'calm' | 'playful' | 'sleepy';
export type CatMood = 'happy' | 'focused' | 'curious' | 'sleepy' | 'celebrating';

interface CatThemeState {
  // Theme settings
  isEnabled: boolean;
  personality: CatPersonality;
  animationIntensity: 'low' | 'medium' | 'high';
  soundEnabled: boolean;
  
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
      // Defaults - Cat Theme OFF by default
      isEnabled: false,
      personality: 'calm',
      animationIntensity: 'medium',
      soundEnabled: false,
      currentMood: 'happy',
      isInteracting: false,
      lastInteraction: null,

      setEnabled: (enabled) => set({ isEnabled: enabled }),
      
      setPersonality: (personality) => set({ personality }),
      
      setAnimationIntensity: (intensity) => set({ animationIntensity: intensity }),
      
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      
      setMood: (mood) => set({ currentMood: mood }),
      
      triggerInteraction: () => {
        set({ isInteracting: true, lastInteraction: new Date() });
        // Reset after animation
        setTimeout(() => set({ isInteracting: false }), 2000);
      },

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
        // Cat looks curious/sideways - non-judgmental
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
