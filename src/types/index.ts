export type DismissMethod = 'steps' | 'photo' | 'both';

export interface Alarm {
  id: string;
  title: string;
  hour: number;
  minute: number;
  repeatDays: boolean[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  soundPath: string;
  volume: number;
  vibrate: boolean;
  isEnabled: boolean;
  dismissMethod: DismissMethod;
  requiredSteps: number;
  referencePhotoPath: string | null;
  similarityThreshold: number;
  requireBothMethods: boolean;
  createdAt: number;
  lastRingTime: number | null;
  snoozeCount: number;
  snoozeMinutes: number;
}

export interface StepData {
  alarmId: string;
  targetSteps: number;
  currentSteps: number;
  startTime: number;
  endTime: number | null;
  isCompleted: boolean;
  stepReadings: StepReading[];
}

export interface StepReading {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

export interface PhotoData {
  alarmId: string;
  referencePhotoPath: string;
  capturedPhotoPath: string | null;
  startTime: number;
  endTime: number | null;
  isCompleted: boolean;
  similarityScore: number | null;
  similarityThreshold: number;
  attempts: PhotoAttempt[];
}

export interface PhotoAttempt {
  timestamp: number;
  photoPath: string;
  similarityScore: number;
  failureReason?: string;
}

export interface AlarmHistory {
  id: string;
  alarmId: string;
  alarmTitle: string;
  ringTime: number;
  dismissTime: number | null;
  dismissType: DismissType;
  stepsTaken: number | null;
  photoSimilarity: number | null;
  photoPath: string | null;
  wasSnoozed: boolean;
  snoozeCount: number;
  notes: string | null;
}

export type DismissType = 'steps' | 'photo' | 'both' | 'snooze' | 'forceStop' | 'unknown';

export interface VerificationResult {
  isSimilar: boolean;
  similarity: number;
  faceSimilarity?: number;
  labelSimilarity?: number;
  pixelSimilarity?: number;
  error?: string;
}

export interface AppState {
  alarms: Alarm[];
  history: AlarmHistory[];
  ringingAlarm: Alarm | null;
  currentSteps: number;
  targetSteps: number;
  photoSimilarity: number | null;
  isProcessingPhoto: boolean;
  isCountingSteps: boolean;
}
