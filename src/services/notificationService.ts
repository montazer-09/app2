import type { Alarm } from '@/types';

class NotificationService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true,
      ...options,
    });
  }

  async showAlarmNotification(alarm: Alarm): Promise<void> {
    await this.showNotification(`⏰ ${alarm.title}`, {
      body: 'Your alarm is ringing! Complete the required task to stop it.',
      tag: alarm.id,
      requireInteraction: true,
    });
  }

  startAlarmSound(volume: number = 1): void {
    if (this.isPlaying) return;

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      this.oscillator.type = 'square';
      this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      
      // Create alarm pattern
      this.oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
      this.oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.2); // E5
      this.oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.4); // G5
      this.oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime + 0.6); // C5

      this.gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
      
      // Create pulsing effect
      const now = this.audioContext.currentTime;
      for (let i = 0; i < 100; i++) {
        this.gainNode.gain.setValueAtTime(volume * 0.5, now + i * 0.5);
        this.gainNode.gain.setValueAtTime(0, now + i * 0.5 + 0.25);
      }

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      this.oscillator.start();
      this.isPlaying = true;

      // Loop the alarm
      this.oscillator.onended = () => {
        if (this.isPlaying) {
          this.startAlarmSound(volume);
        }
      };
    } catch (error) {
      console.error('Error starting alarm sound:', error);
    }
  }

  stopAlarmSound(): void {
    this.isPlaying = false;
    
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
      this.oscillator = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.gainNode = null;
  }

  vibrate(pattern: number[] = [1000, 500, 1000, 500, 1000]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  stopVibration(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }

  // Check and trigger alarms
  checkAlarms(alarms: Alarm[], onAlarmTrigger: (alarm: Alarm) => void): void {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    for (const alarm of alarms) {
      if (!alarm.isEnabled) continue;

      // Check if alarm should ring today
      const shouldRingToday = alarm.repeatDays.every((d) => !d) || alarm.repeatDays[currentDay];
      if (!shouldRingToday) continue;

      // Check time
      if (alarm.hour === currentHour && alarm.minute === currentMinute) {
        // Check if we already rang this minute
        const lastRing = alarm.lastRingTime;
        if (lastRing) {
          const lastRingDate = new Date(lastRing);
          if (
            lastRingDate.getDate() === now.getDate() &&
            lastRingDate.getMonth() === now.getMonth() &&
            lastRingDate.getFullYear() === now.getFullYear() &&
            lastRingDate.getHours() === currentHour &&
            lastRingDate.getMinutes() === currentMinute
          ) {
            continue; // Already rang this minute
          }
        }

        onAlarmTrigger(alarm);
      }
    }
  }
}

export const notificationService = new NotificationService();
