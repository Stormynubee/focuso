import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNotifications } from './useNotifications';

const REMINDER_HOUR = 9; // 9 AM
const STUDY_MILESTONES = [30, 60, 120, 180]; // minutes

export function useStudyReminders() {
  const { notifyStudyReminder, notifyStudyMilestone, isEnabled } = useNotifications();
  const { getTodayStudyTime, studySessions } = useAppStore();
  const lastMilestoneRef = useRef<number>(0);
  const reminderSentTodayRef = useRef<string>('');

  // Daily study reminder
  useEffect(() => {
    if (!isEnabled) return;

    const checkDailyReminder = () => {
      const now = new Date();
      const today = now.toDateString();
      const hour = now.getHours();
      const todayStudyTime = getTodayStudyTime();

      // Send reminder at 9 AM if no study time logged today
      if (
        hour >= REMINDER_HOUR &&
        todayStudyTime === 0 &&
        reminderSentTodayRef.current !== today
      ) {
        notifyStudyReminder();
        reminderSentTodayRef.current = today;
      }
    };

    // Check immediately and every 30 minutes
    checkDailyReminder();
    const interval = setInterval(checkDailyReminder, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isEnabled, getTodayStudyTime, notifyStudyReminder]);

  // Study milestones
  useEffect(() => {
    if (!isEnabled) return;

    const todayStudyMinutes = Math.floor(getTodayStudyTime() / 60);
    
    for (const milestone of STUDY_MILESTONES) {
      if (todayStudyMinutes >= milestone && lastMilestoneRef.current < milestone) {
        notifyStudyMilestone(milestone);
        lastMilestoneRef.current = milestone;
        break;
      }
    }
  }, [isEnabled, getTodayStudyTime, studySessions, notifyStudyMilestone]);

  // Reset milestone tracking at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        lastMilestoneRef.current = 0;
      }
    };

    const interval = setInterval(checkMidnight, 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}
