import { useState, useEffect, useCallback } from 'react';
import { useAlarmStore } from '@/store/alarmStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  History, 
  Settings, 
  Bell, 
  BellOff,
  Trash2,
  Edit3,
  Footprints,
  Camera,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Alarm } from '@/types';

interface HomeScreenProps {
  onAddAlarm: () => void;
  onEditAlarm: (alarmId: string) => void;
  onViewHistory: () => void;
  onViewSettings: () => void;
}

export function HomeScreen({ 
  onAddAlarm, 
  onEditAlarm, 
  onViewHistory, 
  onViewSettings 
}: HomeScreenProps) {
  const { alarms, toggleAlarm, deleteAlarm, getNextAlarm, getEnabledAlarms } = useAlarmStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const nextAlarm = getNextAlarm();
  const enabledAlarms = getEnabledAlarms();

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteAlarm = useCallback((alarm: Alarm) => {
    if (confirm(`Are you sure you want to delete "${alarm.title}"?`)) {
      deleteAlarm(alarm.id);
      toast.success('Alarm deleted');
    }
  }, [deleteAlarm]);

  const handleToggleAlarm = useCallback((alarm: Alarm) => {
    toggleAlarm(alarm.id);
    toast.info(alarm.isEnabled ? 'Alarm disabled' : 'Alarm enabled');
  }, [toggleAlarm]);

  const getDismissIcon = (method: string) => {
    switch (method) {
      case 'steps': return <Footprints className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'both': return <RefreshCw className="w-4 h-4" />;
      default: return <Footprints className="w-4 h-4" />;
    }
  };

  const getTimeUntil = (alarm: Alarm | null) => {
    if (!alarm) return null;
    
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(alarm.hour, alarm.minute, 0, 0);
    
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    const diff = alarmTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Clock */}
      <div className="text-center py-8">
        <p className="text-muted-foreground text-lg mb-2">
          {format(currentTime, 'EEEE, MMMM d')}
        </p>
        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
          {format(currentTime, 'HH:mm')}
        </h1>
        <p className="text-muted-foreground text-xl">
          {format(currentTime, 'ss')}s
        </p>
      </div>

      {/* Next Alarm Card */}
      {nextAlarm && (
        <Card className="bg-gradient-to-r from-primary to-purple-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm">Next Alarm</p>
                <p className="text-white text-2xl font-bold">
                  {format(
                    new Date().setHours(nextAlarm.hour, nextAlarm.minute),
                    'h:mm a'
                  )}
                </p>
                <p className="text-white/70 text-sm">{getTimeUntil(nextAlarm)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alarms List Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Alarms</h2>
        <span className="text-muted-foreground text-sm">
          {enabledAlarms.length} active
        </span>
      </div>

      {/* Alarms List */}
      {alarms.length === 0 ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Alarms</h3>
            <p className="text-muted-foreground mb-4">
              Tap the + button to add your first alarm
            </p>
            <Button onClick={onAddAlarm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Alarm
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alarms.map((alarm) => (
            <Card 
              key={alarm.id} 
              className={`group transition-all duration-200 ${
                alarm.isEnabled 
                  ? 'border-primary/30 shadow-lg shadow-primary/5' 
                  : 'opacity-70'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Time */}
                  <div className="flex-1">
                    <p className={`text-2xl font-bold ${
                      alarm.isEnabled ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {format(
                        new Date().setHours(alarm.hour, alarm.minute),
                        'h:mm a'
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{alarm.title}</p>
                  </div>

                  {/* Dismiss Method Badge */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs">
                    {getDismissIcon(alarm.dismissMethod)}
                    <span className="capitalize">{alarm.dismissMethod}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onEditAlarm(alarm.id)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => handleDeleteAlarm(alarm)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Switch
                      checked={alarm.isEnabled}
                      onCheckedChange={() => handleToggleAlarm(alarm)}
                    />
                  </div>
                </div>

                {/* Mobile: Dismiss Method */}
                <div className="sm:hidden mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  {getDismissIcon(alarm.dismissMethod)}
                  <span className="capitalize">{alarm.dismissMethod}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-around">
          <Button variant="ghost" size="lg" className="flex-col gap-1 h-auto py-2">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-xs">Alarms</span>
          </Button>
          
          <Button 
            variant="default" 
            size="lg" 
            className="flex-col gap-1 h-auto py-2 px-6"
            onClick={onAddAlarm}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg" 
            className="flex-col gap-1 h-auto py-2"
            onClick={onViewHistory}
          >
            <History className="w-5 h-5" />
            <span className="text-xs">History</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg" 
            className="flex-col gap-1 h-auto py-2"
            onClick={onViewSettings}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
