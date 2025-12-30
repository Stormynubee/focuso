import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  age?: number;
  className?: string;
  goal?: string;
  createdAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export interface Distraction {
  id: string;
  userId: string;
  appName: string;
  category: 'social' | 'video' | 'games' | 'browser' | 'messaging' | 'other';
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  focusTime: number;
  breakTime: number;
  completed: boolean;
  timestamp: Date;
}

interface AppState {
  // User
  user: User | null;
  isOnboarded: boolean;
  
  // Study Sessions
  studySessions: StudySession[];
  currentStudySession: StudySession | null;
  
  // Distractions
  distractions: Distraction[];
  currentDistraction: Distraction | null;
  
  // Pomodoro
  pomodoroSessions: PomodoroSession[];
  pomodoroSettings: {
    focusTime: number;
    breakTime: number;
  };
  
  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  
  // Study actions
  startStudySession: (subject: string) => void;
  endStudySession: () => void;
  
  // Distraction actions
  startDistraction: (appName: string, category: Distraction['category']) => void;
  endDistraction: () => void;
  addManualDistraction: (distraction: Omit<Distraction, 'id' | 'userId'>) => void;
  
  // Pomodoro actions
  addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'userId'>) => void;
  setPomodoroSettings: (settings: { focusTime: number; breakTime: number }) => void;
  
  // Stats
  getTodayStudyTime: () => number;
  getTodayDistractionTime: () => number;
  getTodayFocusRatio: () => number;
  getPomodoroStreak: () => number;
  getWeeklyStats: () => { day: string; study: number; distraction: number }[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const isToday = (date: Date) => {
  const today = new Date();
  const d = new Date(date);
  return d.toDateString() === today.toDateString();
};

const getDayName = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboarded: false,
      studySessions: [],
      currentStudySession: null,
      distractions: [],
      currentDistraction: null,
      pomodoroSessions: [],
      pomodoroSettings: {
        focusTime: 25,
        breakTime: 5,
      },

      setUser: (user) => set({ user, isOnboarded: true }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      clearUser: () => set({ user: null, isOnboarded: false }),

      startStudySession: (subject) => {
        const state = get();
        if (!state.user || state.currentStudySession) return;
        
        const session: StudySession = {
          id: generateId(),
          userId: state.user.id,
          subject,
          startTime: new Date(),
          duration: 0,
        };
        
        set({ currentStudySession: session });
      },

      endStudySession: () => {
        const state = get();
        if (!state.currentStudySession) return;
        
        const endTime = new Date();
        const duration = Math.floor(
          (endTime.getTime() - new Date(state.currentStudySession.startTime).getTime()) / 1000
        );
        
        const completedSession: StudySession = {
          ...state.currentStudySession,
          endTime,
          duration,
        };
        
        set({
          studySessions: [...state.studySessions, completedSession],
          currentStudySession: null,
        });
      },

      startDistraction: (appName, category) => {
        const state = get();
        if (!state.user || state.currentDistraction) return;
        
        const distraction: Distraction = {
          id: generateId(),
          userId: state.user.id,
          appName,
          category,
          startTime: new Date(),
          duration: 0,
        };
        
        set({ currentDistraction: distraction });
      },

      endDistraction: () => {
        const state = get();
        if (!state.currentDistraction) return;
        
        const endTime = new Date();
        const duration = Math.floor(
          (endTime.getTime() - new Date(state.currentDistraction.startTime).getTime()) / 1000
        );
        
        const completedDistraction: Distraction = {
          ...state.currentDistraction,
          endTime,
          duration,
        };
        
        set({
          distractions: [...state.distractions, completedDistraction],
          currentDistraction: null,
        });
      },

      addManualDistraction: (distraction) => {
        const state = get();
        if (!state.user) return;
        
        const newDistraction: Distraction = {
          ...distraction,
          id: generateId(),
          userId: state.user.id,
        };
        
        set({ distractions: [...state.distractions, newDistraction] });
      },

      addPomodoroSession: (session) => {
        const state = get();
        if (!state.user) return;
        
        const newSession: PomodoroSession = {
          ...session,
          id: generateId(),
          userId: state.user.id,
        };
        
        set({ pomodoroSessions: [...state.pomodoroSessions, newSession] });
      },

      setPomodoroSettings: (settings) => set({ pomodoroSettings: settings }),

      getTodayStudyTime: () => {
        const state = get();
        return state.studySessions
          .filter((s) => isToday(new Date(s.startTime)))
          .reduce((acc, s) => acc + s.duration, 0);
      },

      getTodayDistractionTime: () => {
        const state = get();
        return state.distractions
          .filter((d) => isToday(new Date(d.startTime)))
          .reduce((acc, d) => acc + d.duration, 0);
      },

      getTodayFocusRatio: () => {
        const state = get();
        const studyTime = state.getTodayStudyTime();
        const distractionTime = state.getTodayDistractionTime();
        const total = studyTime + distractionTime;
        
        if (total === 0) return 100;
        return Math.round((studyTime / total) * 100);
      },

      getPomodoroStreak: () => {
        const state = get();
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          const hasCompleted = state.pomodoroSessions.some(
            (s) => s.completed && new Date(s.timestamp).toDateString() === date.toDateString()
          );
          
          if (hasCompleted) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        
        return streak;
      },

      getWeeklyStats: () => {
        const state = get();
        const stats: { day: string; study: number; distraction: number }[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = getDayName(date);
          const dateStr = date.toDateString();
          
          const studyTime = state.studySessions
            .filter((s) => new Date(s.startTime).toDateString() === dateStr)
            .reduce((acc, s) => acc + s.duration, 0);
          
          const distractionTime = state.distractions
            .filter((d) => new Date(d.startTime).toDateString() === dateStr)
            .reduce((acc, d) => acc + d.duration, 0);
          
          stats.push({
            day: dayName,
            study: Math.round(studyTime / 60),
            distraction: Math.round(distractionTime / 60),
          });
        }
        
        return stats;
      },
    }),
    {
      name: 'focusos-storage',
    }
  )
);
