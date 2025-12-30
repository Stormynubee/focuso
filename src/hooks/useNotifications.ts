import { useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

type NotificationType = 'pomodoro' | 'study' | 'distraction' | 'reminder';

interface NotificationOptions {
  title: string;
  body: string;
  type: NotificationType;
  icon?: string;
  requireInteraction?: boolean;
}

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  pomodoro: '⏰',
  study: '📚',
  distraction: '⚠️',
  reminder: '💡',
};

export function useNotifications() {
  const { toast } = useToast();
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications not supported',
        description: 'Your browser does not support notifications.',
        variant: 'destructive',
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: 'Notifications blocked',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      
      if (permission === 'granted') {
        toast({
          title: 'Notifications enabled! 🔔',
          description: 'You\'ll now receive focus reminders.',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [toast]);

  const sendNotification = useCallback(({ title, body, type, requireInteraction = false }: NotificationOptions) => {
    // Always show in-app toast
    toast({
      title: `${NOTIFICATION_ICONS[type]} ${title}`,
      description: body,
    });

    // Try to send browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: type,
          requireInteraction,
          silent: false,
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }, [toast]);

  const notifyPomodoroComplete = useCallback((isBreak: boolean) => {
    sendNotification({
      title: isBreak ? 'Break time! 🧘' : 'Focus session complete! 🎉',
      body: isBreak 
        ? 'Take a moment to relax before your next session.'
        : 'Great work! Time for a well-deserved break.',
      type: 'pomodoro',
      requireInteraction: true,
    });

    // Play sound
    playNotificationSound();
  }, [sendNotification]);

  const notifyDistraction = useCallback((appName: string) => {
    sendNotification({
      title: 'Distraction detected! 🚫',
      body: `${appName} is breaking your focus. Stay on track!`,
      type: 'distraction',
    });
  }, [sendNotification]);

  const notifyStudyReminder = useCallback(() => {
    sendNotification({
      title: 'Time to study! 📖',
      body: 'Your daily study session is waiting. Start now to stay on track!',
      type: 'reminder',
      requireInteraction: true,
    });
  }, [sendNotification]);

  const notifyStudyMilestone = useCallback((minutes: number) => {
    sendNotification({
      title: `${minutes} minutes of focus! 🌟`,
      body: 'Amazing progress! Keep up the great work.',
      type: 'study',
    });
  }, [sendNotification]);

  const isSupported = 'Notification' in window;
  const isEnabled = permissionRef.current === 'granted';

  return {
    requestPermission,
    sendNotification,
    notifyPomodoroComplete,
    notifyDistraction,
    notifyStudyReminder,
    notifyStudyMilestone,
    isSupported,
    isEnabled,
    permission: permissionRef.current,
  };
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant chime sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}
