import { useEffect, useState, useCallback } from 'react';
import { useAlarmStore } from '@/store/alarmStore';
import { notificationService } from '@/services/notificationService';
import { stepCounterService } from '@/services/stepCounterService';
import { photoVerificationService } from '@/services/photoVerificationService';
import { AdsterraBanner, AdsterraSmartlink, AdsterraSocialBar } from '@/components/ads';
import { HomeScreen } from '@/screens/HomeScreen';
import { AddAlarmScreen } from '@/screens/AddAlarmScreen';
import { AlarmRingingScreen } from '@/screens/AlarmRingingScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export type Screen = 'home' | 'add-alarm' | 'edit-alarm' | 'ringing' | 'history' | 'settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    alarms, 
    ringingAlarm, 
    setRingingAlarm, 
    dismissAlarm, 
    snoozeAlarm,
    updateAlarm 
  } = useAlarmStore();

  // Initialize services - simplified to avoid loading issues
  useEffect(() => {
    const init = async () => {
      try {
        // Request notification permission (non-blocking)
        notificationService.requestPermission().catch(() => {});
        
        // Initialize step counter (lightweight)
        await stepCounterService.initialize();
        
        // Initialize photo verification (simplified, no heavy models)
        await photoVerificationService.initialize();
      } catch (error) {
        console.log('Some services failed to initialize, continuing anyway');
      } finally {
        // Always finish loading, even if some services fail
        setIsLoading(false);
      }
    };
    
    init();
    
    // Safety timeout - force loading to finish after 3 seconds
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Check alarms every second
  useEffect(() => {
    if (isLoading) return; // Don't check alarms while loading
    
    const interval = setInterval(() => {
      notificationService.checkAlarms(alarms, (alarm) => {
        // Update last ring time
        updateAlarm(alarm.id, { lastRingTime: Date.now() });
        
        // Show notification
        notificationService.showAlarmNotification(alarm);
        
        // Start alarm sound
        notificationService.startAlarmSound(alarm.volume);
        
        // Vibrate
        if (alarm.vibrate) {
          notificationService.vibrate();
        }
        
        // Show ringing screen
        setRingingAlarm(alarm);
        setCurrentScreen('ringing');
        
        toast.info(`⏰ ${alarm.title} is ringing!`, {
          duration: Infinity,
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, isLoading, setRingingAlarm, updateAlarm]);

  // Handle alarm dismissed
  const handleAlarmDismissed = useCallback((
    dismissType: 'steps' | 'photo' | 'both',
    data?: { steps?: number; photoSimilarity?: number; photoPath?: string }
  ) => {
    notificationService.stopAlarmSound();
    notificationService.stopVibration();
    
    dismissAlarm(dismissType, data);
    setCurrentScreen('home');
    
    toast.success('Alarm dismissed! Good morning! ☀️');
  }, [dismissAlarm]);

  // Handle alarm snoozed
  const handleAlarmSnoozed = useCallback(() => {
    notificationService.stopAlarmSound();
    notificationService.stopVibration();
    
    snoozeAlarm();
    setCurrentScreen('home');
    
    toast.info('Alarm snoozed 😴');
  }, [snoozeAlarm]);

  // Navigation handlers
  const navigateToAddAlarm = useCallback(() => {
    setEditingAlarmId(null);
    setCurrentScreen('add-alarm');
  }, []);

  const navigateToEditAlarm = useCallback((alarmId: string) => {
    setEditingAlarmId(alarmId);
    setCurrentScreen('edit-alarm');
  }, []);

  const navigateToHistory = useCallback(() => {
    setCurrentScreen('history');
  }, []);

  const navigateToSettings = useCallback(() => {
    setCurrentScreen('settings');
  }, []);

  const navigateToHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Ultimate Alarm...</p>
          <p className="text-xs text-muted-foreground mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 
        ============================================================
        ADSTERRA SMARTLINK - Opens in new tab on user click
        Place your smartlink URL in: src/components/ads/AdsterraAd.tsx
        ============================================================
      */}
      <AdsterraSmartlink />
      
      {/* 
        ============================================================
        ADSTERRA BANNER 468x60 - Top of page
        Place your banner script in: src/components/ads/AdsterraAd.tsx
        Look for: AdsterraBanner component
        ============================================================
      */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <AdsterraBanner className="max-w-4xl mx-auto" />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {currentScreen === 'home' && (
          <HomeScreen
            onAddAlarm={navigateToAddAlarm}
            onEditAlarm={navigateToEditAlarm}
            onViewHistory={navigateToHistory}
            onViewSettings={navigateToSettings}
          />
        )}
        
        {(currentScreen === 'add-alarm' || currentScreen === 'edit-alarm') && (
          <AddAlarmScreen
            alarmId={editingAlarmId}
            onBack={navigateToHome}
          />
        )}
        
        {currentScreen === 'ringing' && ringingAlarm && (
          <AlarmRingingScreen
            alarm={ringingAlarm}
            onDismiss={handleAlarmDismissed}
            onSnooze={handleAlarmSnoozed}
          />
        )}
        
        {currentScreen === 'history' && (
          <HistoryScreen onBack={navigateToHome} />
        )}
        
        {currentScreen === 'settings' && (
          <SettingsScreen onBack={navigateToHome} />
        )}
      </main>

      {/* 
        ============================================================
        ADSTERRA SOCIAL BAR - Bottom sticky bar
        Place your social bar script in: src/components/ads/AdsterraAd.tsx
        Look for: AdsterraSocialBar component
        ============================================================
      */}
      <AdsterraSocialBar />

      {/* Toast notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </div>
  );
}

export default App;
