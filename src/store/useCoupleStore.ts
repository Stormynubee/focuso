import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PartnerStatus = 'studying' | 'break' | 'distracted' | 'offline';

export interface Partner {
  id: string;
  name: string;
  avatarEmoji: string;
  status: PartnerStatus;
  pomodoroActive: boolean;
  focusStreak: number;
  lastSeen: Date;
}

export interface CoupleMessage {
  id: string;
  senderId: 'me' | 'partner';
  content: string;
  timestamp: Date;
  emoji?: string;
}

export interface DistractionAlert {
  id: string;
  appName: string;
  message: string;
  timestamp: Date;
  from: 'me' | 'partner';
}

interface CoupleState {
  // Couple Mode
  isCoupleMode: boolean;
  linkCode: string | null;
  isConnected: boolean;
  
  // Partner
  partner: Partner | null;
  
  // My status (shared with partner)
  myStatus: PartnerStatus;
  myPomodoroActive: boolean;
  
  // Messages
  coupleMessages: CoupleMessage[];
  
  // Distraction alerts
  distractionAlerts: DistractionAlert[];
  
  // Alert settings
  alertSettings: {
    enabled: boolean;
    cooldownMinutes: number;
    customMessages: string[];
    enabledApps: string[];
  };
  
  // Actions
  enableCoupleMode: () => void;
  disableCoupleMode: () => void;
  generateLinkCode: () => string;
  connectWithCode: (code: string) => boolean;
  disconnect: () => void;
  
  // Partner updates (simulated for now, would use realtime in production)
  setPartner: (partner: Partner) => void;
  updatePartnerStatus: (status: PartnerStatus) => void;
  updatePartnerPomodoro: (active: boolean) => void;
  
  // My status
  setMyStatus: (status: PartnerStatus) => void;
  setMyPomodoroActive: (active: boolean) => void;
  
  // Messages
  sendMessage: (content: string, emoji?: string) => void;
  receiveMessage: (content: string, emoji?: string) => void;
  clearMessages: () => void;
  
  // Alerts
  sendDistractionAlert: (appName: string) => void;
  receiveDistractionAlert: (appName: string) => void;
  clearAlerts: () => void;
  
  // Settings
  updateAlertSettings: (settings: Partial<CoupleState['alertSettings']>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const DEFAULT_MESSAGES = [
  "Hey ❤️, you're on {app}. Stay focused! 🫂",
  "Miss you, but let's stay productive! 💕",
  "We've got this together! Back to work? 🌟",
  "Taking a break from {app}? I believe in you! 💪",
];

const DEFAULT_ENABLED_APPS = ['YouTube', 'Instagram', 'WhatsApp', 'Games', 'Facebook', 'TikTok'];

export const useCoupleStore = create<CoupleState>()(
  persist(
    (set, get) => ({
      isCoupleMode: false,
      linkCode: null,
      isConnected: false,
      partner: null,
      myStatus: 'offline',
      myPomodoroActive: false,
      coupleMessages: [],
      distractionAlerts: [],
      alertSettings: {
        enabled: true,
        cooldownMinutes: 5,
        customMessages: DEFAULT_MESSAGES,
        enabledApps: DEFAULT_ENABLED_APPS,
      },

      enableCoupleMode: () => set({ isCoupleMode: true }),
      
      disableCoupleMode: () => set({ 
        isCoupleMode: false, 
        isConnected: false, 
        partner: null,
        linkCode: null,
      }),

      generateLinkCode: () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        set({ linkCode: code });
        return code;
      },

      connectWithCode: (code: string) => {
        // In production, this would validate via backend
        // For now, we simulate a connection
        if (code.length === 6) {
          const simulatedPartner: Partner = {
            id: generateId(),
            name: 'My Love',
            avatarEmoji: '💕',
            status: 'studying',
            pomodoroActive: false,
            focusStreak: 3,
            lastSeen: new Date(),
          };
          set({ 
            isConnected: true, 
            partner: simulatedPartner,
            linkCode: code,
          });
          return true;
        }
        return false;
      },

      disconnect: () => set({ 
        isConnected: false, 
        partner: null, 
        linkCode: null,
      }),

      setPartner: (partner) => set({ partner }),

      updatePartnerStatus: (status) => set((state) => ({
        partner: state.partner ? { ...state.partner, status, lastSeen: new Date() } : null,
      })),

      updatePartnerPomodoro: (active) => set((state) => ({
        partner: state.partner ? { ...state.partner, pomodoroActive: active } : null,
      })),

      setMyStatus: (status) => set({ myStatus: status }),

      setMyPomodoroActive: (active) => set({ myPomodoroActive: active }),

      sendMessage: (content, emoji) => {
        const message: CoupleMessage = {
          id: generateId(),
          senderId: 'me',
          content,
          timestamp: new Date(),
          emoji,
        };
        set((state) => ({
          coupleMessages: [...state.coupleMessages, message],
        }));
      },

      receiveMessage: (content, emoji) => {
        const message: CoupleMessage = {
          id: generateId(),
          senderId: 'partner',
          content,
          timestamp: new Date(),
          emoji,
        };
        set((state) => ({
          coupleMessages: [...state.coupleMessages, message],
        }));
      },

      clearMessages: () => set({ coupleMessages: [] }),

      sendDistractionAlert: (appName) => {
        const state = get();
        const messages = state.alertSettings.customMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
          .replace('{app}', appName);
        
        const alert: DistractionAlert = {
          id: generateId(),
          appName,
          message: randomMessage,
          timestamp: new Date(),
          from: 'me',
        };
        set((state) => ({
          distractionAlerts: [...state.distractionAlerts, alert],
        }));
      },

      receiveDistractionAlert: (appName) => {
        const state = get();
        const messages = state.alertSettings.customMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
          .replace('{app}', appName);
        
        const alert: DistractionAlert = {
          id: generateId(),
          appName,
          message: randomMessage,
          timestamp: new Date(),
          from: 'partner',
        };
        set((state) => ({
          distractionAlerts: [...state.distractionAlerts, alert],
        }));
      },

      clearAlerts: () => set({ distractionAlerts: [] }),

      updateAlertSettings: (settings) => set((state) => ({
        alertSettings: { ...state.alertSettings, ...settings },
      })),
    }),
    {
      name: 'focusos-couple-storage',
    }
  )
);