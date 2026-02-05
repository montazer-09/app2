import type { StepReading } from '@/types';

interface StepCounterCallback {
  onStep: (steps: number) => void;
  onComplete: () => void;
}

class StepCounterService {
  private isCounting = false;
  private currentSteps = 0;
  private targetSteps = 20;
  private readings: StepReading[] = [];
  private lastStepTime = 0;
  private callback: StepCounterCallback | null = null;

  // Step detection parameters
  private readonly STEP_THRESHOLD = 12; // Magnitude threshold
  private readonly MIN_STEP_INTERVAL = 250; // Minimum ms between steps

  async initialize(): Promise<boolean> {
    // Check if DeviceMotion is supported
    if (!('DeviceMotionEvent' in window)) {
      console.log('DeviceMotion not supported');
      return false;
    }
    return true;
  }

  startCounting(targetSteps: number, callback: StepCounterCallback): boolean {
    if (!('DeviceMotionEvent' in window)) {
      console.log('DeviceMotion not supported');
      return false;
    }

    this.targetSteps = targetSteps;
    this.currentSteps = 0;
    this.readings = [];
    this.callback = callback;
    this.isCounting = true;

    window.addEventListener('devicemotion', this.handleDeviceMotion);

    return true;
  }

  private handleDeviceMotion = (event: DeviceMotionEvent): void => {
    if (!this.isCounting) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const x = acceleration.x || 0;
    const y = acceleration.y || 0;
    const z = acceleration.z || 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    this.processReading(x, y, z, magnitude);
  };

  private processReading(x: number, y: number, z: number, magnitude: number): void {
    const now = Date.now();

    // Store reading
    this.readings.push({
      timestamp: now,
      x,
      y,
      z,
      magnitude,
    });

    // Keep only recent readings (last 2 seconds)
    const cutoff = now - 2000;
    this.readings = this.readings.filter((r) => r.timestamp > cutoff);

    // Check for step
    if (this.detectStep(magnitude, now)) {
      this.currentSteps++;
      this.lastStepTime = now;
      this.callback?.onStep(this.currentSteps);

      if (this.currentSteps >= this.targetSteps) {
        this.stopCounting();
        this.callback?.onComplete();
      }
    }
  }

  private detectStep(magnitude: number, now: number): boolean {
    // Check minimum time between steps
    if (now - this.lastStepTime < this.MIN_STEP_INTERVAL) {
      return false;
    }

    // Check if magnitude exceeds threshold
    if (magnitude < this.STEP_THRESHOLD) {
      return false;
    }

    // Check for peak in recent readings
    if (this.readings.length < 3) {
      return false;
    }

    const recentReadings = this.readings.slice(-3);
    const prevMagnitude = recentReadings[recentReadings.length - 2].magnitude;
    const currentMagnitude = recentReadings[recentReadings.length - 1].magnitude;

    // Detect peak
    return currentMagnitude > prevMagnitude && magnitude > this.STEP_THRESHOLD;
  }

  stopCounting(): void {
    this.isCounting = false;
    window.removeEventListener('devicemotion', this.handleDeviceMotion);
  }

  getCurrentSteps(): number {
    return this.currentSteps;
  }

  getTargetSteps(): number {
    return this.targetSteps;
  }

  getProgress(): number {
    return this.targetSteps > 0
      ? Math.min(this.currentSteps / this.targetSteps, 1)
      : 0;
  }

  isActive(): boolean {
    return this.isCounting;
  }

  reset(): void {
    this.currentSteps = 0;
    this.readings = [];
    this.lastStepTime = 0;
  }
}

export const stepCounterService = new StepCounterService();
