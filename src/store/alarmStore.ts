import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Alarm, AlarmHistory, DismissType } from '@/types';

interface AlarmState {
  alarms: Alarm[];
  history: AlarmHistory[];
  ringingAlarm: Alarm | null;
  
  // Actions
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt'>) => void;
  updateAlarm: (id: string, alarm: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  setRingingAlarm: (alarm: Alarm | null) => void;
  dismissAlarm: (dismissType: DismissType, data?: { steps?: number; photoSimilarity?: number; photoPath?: string }) => void;
  snoozeAlarm: () => void;
  addToHistory: (history: Omit<AlarmHistory, 'id'>) => void;
  clearHistory: () => void;
  deleteHistoryEntry: (id: string) => void;
  getEnabledAlarms: () => Alarm[];
  getNextAlarm: () => Alarm | null;
  getStatistics: () => {
    totalRings: number;
    dismissBySteps: number;
    dismissByPhoto: number;
    dismissByBoth: number;
    snoozed: number;
    averageDismissTime: number;
  };
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: [],
      history: [],
      ringingAlarm: null,

      addAlarm: (alarmData) => {
        const newAlarm: Alarm = {
          ...alarmData,
          id: uuidv4(),
          createdAt: Date.now(),
        };
        set((state: AlarmState) => ({
          alarms: [...state.alarms, newAlarm].sort((a, b) => {
            const aTime = a.hour * 60 + a.minute;
            const bTime = b.hour * 60 + b.minute;
            return aTime - bTime;
          }),
        }));
      },

      updateAlarm: (id, alarmData) => {
        set((state: AlarmState) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, ...alarmData } : alarm
          ),
        }));
      },

      deleteAlarm: (id) => {
        set((state: AlarmState) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        }));
      },

      toggleAlarm: (id) => {
        set((state: AlarmState) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, isEnabled: !alarm.isEnabled } : alarm
          ),
        }));
      },

      setRingingAlarm: (alarm) => {
        set({ ringingAlarm: alarm });
      },

      dismissAlarm: (dismissType, data) => {
        const { ringingAlarm } = get();
        if (!ringingAlarm) return;

        const historyEntry: AlarmHistory = {
          id: uuidv4(),
          alarmId: ringingAlarm.id,
          alarmTitle: ringingAlarm.title,
          ringTime: Date.now(),
          dismissTime: Date.now(),
          dismissType,
          stepsTaken: data?.steps ?? null,
          photoSimilarity: data?.photoSimilarity ?? null,
          photoPath: data?.photoPath ?? null,
          wasSnoozed: false,
          snoozeCount: 0,
          notes: null,
        };

        set((state: AlarmState) => ({
          ringingAlarm: null,
          history: [historyEntry, ...state.history],
        }));
      },

      snoozeAlarm: () => {
        const { ringingAlarm } = get();
        if (!ringingAlarm) return;

        const historyEntry: AlarmHistory = {
          id: uuidv4(),
          alarmId: ringingAlarm.id,
          alarmTitle: ringingAlarm.title,
          ringTime: Date.now(),
          dismissTime: Date.now(),
          dismissType: 'snooze',
          stepsTaken: null,
          photoSimilarity: null,
          photoPath: null,
          wasSnoozed: true,
          snoozeCount: 1,
          notes: null,
        };

        set((state: AlarmState) => ({
          ringingAlarm: null,
          history: [historyEntry, ...state.history],
        }));

        // Schedule snooze
        setTimeout(() => {
          get().setRingingAlarm(ringingAlarm);
        }, ringingAlarm.snoozeMinutes * 60 * 1000);
      },

      addToHistory: (historyData) => {
        const historyEntry: AlarmHistory = {
          ...historyData,
          id: uuidv4(),
        };
        set((state: AlarmState) => ({
          history: [historyEntry, ...state.history],
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      deleteHistoryEntry: (id) => {
        set((state: AlarmState) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },

      getEnabledAlarms: () => {
        return get().alarms.filter((alarm) => alarm.isEnabled);
      },

      getNextAlarm: () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const enabledAlarms = get().getEnabledAlarms();

        let nextAlarm: Alarm | null = null;
        let minDiff = 24 * 60;

        for (const alarm of enabledAlarms) {
          const alarmMinutes = alarm.hour * 60 + alarm.minute;
          let diff = alarmMinutes - currentMinutes;
          if (diff < 0) diff += 24 * 60;

          if (diff < minDiff) {
            minDiff = diff;
            nextAlarm = alarm;
          }
        }

        return nextAlarm;
      },

      getStatistics: () => {
        const { history } = get();
        const dismissed = history.filter((h) => h.dismissTime !== null);
        const dismissBySteps = history.filter((h) => h.dismissType === 'steps').length;
        const dismissByPhoto = history.filter((h) => h.dismissType === 'photo').length;
        const dismissByBoth = history.filter((h) => h.dismissType === 'both').length;
        const snoozed = history.filter((h) => h.wasSnoozed).length;

        const avgDismissTime = dismissed.length > 0
          ? dismissed.reduce((acc, h) => {
              if (h.dismissTime && h.ringTime) {
                return acc + (h.dismissTime - h.ringTime);
              }
              return acc;
            }, 0) / dismissed.length / 1000
          : 0;

        return {
          totalRings: history.length,
          dismissBySteps,
          dismissByPhoto,
          dismissByBoth,
          snoozed,
          averageDismissTime: Math.round(avgDismissTime),
        };
      },
    }),
    {
      name: 'ultimate-alarm-storage',
    }
  )
);
