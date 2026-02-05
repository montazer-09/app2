import { useState, useRef, useCallback } from 'react';
import { useAlarmStore } from '@/store/alarmStore';
import { AdsterraNative } from '@/components/ads';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Footprints, 
  Camera, 
  RefreshCw,
  Volume2,
  Vibrate,
  Upload,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import type { DismissMethod } from '@/types';

interface AddAlarmScreenProps {
  alarmId: string | null;
  onBack: () => void;
}

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEK_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AddAlarmScreen({ alarmId, onBack }: AddAlarmScreenProps) {
  const { alarms, addAlarm, updateAlarm } = useAlarmStore();
  const existingAlarm = alarmId ? alarms.find(a => a.id === alarmId) : null;
  
  // Form state
  const [title, setTitle] = useState(existingAlarm?.title || 'Alarm');
  const [hour, setHour] = useState(existingAlarm?.hour || 7);
  const [minute, setMinute] = useState(existingAlarm?.minute || 0);
  const [repeatDays, setRepeatDays] = useState<boolean[]>(existingAlarm?.repeatDays || [false, false, false, false, false, false, false]);
  const [dismissMethod, setDismissMethod] = useState<DismissMethod>(existingAlarm?.dismissMethod || 'steps');
  const [requiredSteps, setRequiredSteps] = useState(existingAlarm?.requiredSteps || 20);
  const [similarityThreshold, setSimilarityThreshold] = useState(existingAlarm?.similarityThreshold || 0.85);
  const [referencePhoto, setReferencePhoto] = useState<string | null>(existingAlarm?.referencePhotoPath || null);
  const [requireBothMethods, setRequireBothMethods] = useState(existingAlarm?.requireBothMethods || false);
  const [vibrate, setVibrate] = useState(existingAlarm?.vibrate ?? true);
  const [snoozeCount, setSnoozeCount] = useState(existingAlarm?.snoozeCount || 3);
  const [volume, setVolume] = useState(existingAlarm?.volume || 1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(() => {
    // Validate
    if ((dismissMethod === 'photo' || dismissMethod === 'both') && !referencePhoto) {
      toast.error('Please select a reference photo');
      return;
    }

    const alarmData = {
      title,
      hour,
      minute,
      repeatDays,
      soundPath: 'default',
      volume,
      vibrate,
      isEnabled: true,
      dismissMethod: requireBothMethods ? 'both' : dismissMethod,
      requiredSteps,
      referencePhotoPath: referencePhoto,
      similarityThreshold,
      requireBothMethods,
      lastRingTime: null,
      snoozeCount,
      snoozeMinutes: 5,
    };

    if (existingAlarm) {
      updateAlarm(existingAlarm.id, alarmData);
      toast.success('Alarm updated');
    } else {
      addAlarm(alarmData);
      toast.success('Alarm created');
    }

    onBack();
  }, [title, hour, minute, repeatDays, volume, vibrate, dismissMethod, requireBothMethods, requiredSteps, referencePhoto, similarityThreshold, snoozeCount, existingAlarm, addAlarm, updateAlarm, onBack]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferencePhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const toggleDay = useCallback((index: number) => {
    setRepeatDays((prev: boolean[]) => {
      const newDays = [...prev];
      newDays[index] = !newDays[index];
      return newDays;
    });
  }, []);

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">
          {existingAlarm ? 'Edit Alarm' : 'Add Alarm'}
        </h1>
      </div>

      {/* Time Selector */}
      <Card className="bg-gradient-to-r from-primary to-purple-600 border-0">
        <CardContent className="p-6 text-center">
          <div className="text-5xl font-bold text-white mb-2">
            {formatTime(hour, minute)}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex flex-col items-center">
              <label className="text-white/70 text-sm mb-1">Hour</label>
              <input
                type="range"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-24 accent-white"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-white/70 text-sm mb-1">Minute</label>
              <input
                type="range"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value))}
                className="w-24 accent-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Native Ad */}
      <AdsterraNative />

      {/* Alarm Name */}
      <div className="space-y-2">
        <Label>Alarm Name</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter alarm name"
          className="h-12"
        />
      </div>

      {/* Repeat Days */}
      <div className="space-y-2">
        <Label>Repeat</Label>
        <div className="flex justify-between gap-1">
          {WEEK_DAYS.map((day, index) => (
            <button
              key={index}
              onClick={() => toggleDay(index)}
              className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                repeatDays[index]
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              title={WEEK_DAY_NAMES[index]}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Dismiss Method */}
      <div className="space-y-3">
        <Label>Dismiss Method</Label>
        
        {/* Steps Option */}
        <Card 
          className={`cursor-pointer transition-all ${
            dismissMethod === 'steps' || requireBothMethods
              ? 'border-primary bg-primary/5' 
              : 'border-muted'
          }`}
          onClick={() => {
            setDismissMethod('steps');
            setRequireBothMethods(false);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                dismissMethod === 'steps' || requireBothMethods
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <Footprints className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Walk Steps</p>
                <p className="text-sm text-muted-foreground">
                  Walk {requiredSteps} steps to dismiss
                </p>
              </div>
              {(dismissMethod === 'steps' || requireBothMethods) && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </div>
            
            {(dismissMethod === 'steps' || requireBothMethods) && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Required Steps</span>
                  <span className="font-medium">{requiredSteps}</span>
                </div>
                <Slider
                  value={[requiredSteps]}
                  onValueChange={(value) => setRequiredSteps(value[0])}
                  min={5}
                  max={100}
                  step={5}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Option */}
        <Card 
          className={`cursor-pointer transition-all ${
            dismissMethod === 'photo' || requireBothMethods
              ? 'border-primary bg-primary/5' 
              : 'border-muted'
          }`}
          onClick={() => {
            setDismissMethod('photo');
            setRequireBothMethods(false);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                dismissMethod === 'photo' || requireBothMethods
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Take Photo</p>
                <p className="text-sm text-muted-foreground">
                  Take a matching photo to dismiss
                </p>
              </div>
              {(dismissMethod === 'photo' || requireBothMethods) && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </div>
            
            {(dismissMethod === 'photo' || requireBothMethods) && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {/* Similarity Threshold */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Similarity Required</span>
                    <span className="font-medium">{Math.round(similarityThreshold * 100)}%</span>
                  </div>
                  <Slider
                    value={[similarityThreshold * 100]}
                    onValueChange={(value) => setSimilarityThreshold(value[0] / 100)}
                    min={70}
                    max={95}
                    step={1}
                  />
                </div>
                
                {/* Reference Photo */}
                <div>
                  <Label className="mb-2 block">Reference Photo</Label>
                  {referencePhoto ? (
                    <div className="relative">
                      <img
                        src={referencePhoto}
                        alt="Reference"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReferencePhoto(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="w-full h-40 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Tap to upload reference photo
                      </span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Both Methods */}
        <Card className="border-muted">
          <CardContent className="p-4">
            <div 
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setRequireBothMethods(!requireBothMethods)}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                requireBothMethods
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Require Both</p>
                <p className="text-sm text-muted-foreground">
                  Must complete both steps AND photo
                </p>
              </div>
              <Switch checked={requireBothMethods} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <Label>Settings</Label>
        
        {/* Volume */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Volume</span>
                  <span className="font-medium">{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => setVolume(value[0] / 100)}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vibrate */}
        <Card>
          <CardContent className="p-4">
            <div 
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setVibrate(!vibrate)}
            >
              <Vibrate className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Vibrate</p>
                <p className="text-sm text-muted-foreground">
                  Vibrate when alarm rings
                </p>
              </div>
              <Switch checked={vibrate} />
            </div>
          </CardContent>
        </Card>

        {/* Snooze Count */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Snooze Count</p>
                <p className="text-sm text-muted-foreground">
                  Number of times you can snooze
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSnoozeCount(Math.max(0, snoozeCount - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{snoozeCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSnoozeCount(Math.min(5, snoozeCount + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Button 
        size="lg" 
        className="w-full h-14 text-lg"
        onClick={handleSave}
      >
        {existingAlarm ? 'Update Alarm' : 'Save Alarm'}
      </Button>
    </div>
  );
}

export default AddAlarmScreen;
