import { useState, useEffect, useCallback, useRef } from 'react';
import { AdsterraBanner } from '@/components/ads';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Footprints, 
  Camera, 
  RefreshCw,
  CheckCircle2,
  X,
  Camera as CameraIcon,
  RefreshCcw,
  PauseCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { stepCounterService } from '@/services/stepCounterService';
import { photoVerificationService } from '@/services/photoVerificationService';
import type { Alarm } from '@/types';

interface AlarmRingingScreenProps {
  alarm: Alarm;
  onDismiss: (dismissType: 'steps' | 'photo' | 'both', data?: { steps?: number; photoSimilarity?: number; photoPath?: string }) => void;
  onSnooze: () => void;
}

export function AlarmRingingScreen({ alarm, onDismiss, onSnooze }: AlarmRingingScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stepProgress, setStepProgress] = useState(0);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState(false);
  const [photoCompleted, setPhotoCompleted] = useState(false);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize step counter
  useEffect(() => {
    if (alarm.dismissMethod === 'steps' || alarm.dismissMethod === 'both') {
      const started = stepCounterService.startCounting(alarm.requiredSteps, {
        onStep: (steps) => {
          setCurrentSteps(steps);
          setStepProgress(stepCounterService.getProgress());
        },
        onComplete: () => {
          setStepsCompleted(true);
          toast.success('Steps completed! ✓');
          
          if (alarm.dismissMethod === 'steps') {
            onDismiss('steps', { steps: alarm.requiredSteps });
          }
        },
      });

      if (!started) {
        toast.error('Could not access motion sensors. Please enable permissions.');
      }

      return () => {
        stepCounterService.stopCounting();
      };
    }
  }, [alarm, onDismiss]);

  // Initialize photo verification
  useEffect(() => {
    if ((alarm.dismissMethod === 'photo' || alarm.dismissMethod === 'both') && alarm.referencePhotoPath) {
      photoVerificationService.setReferencePhoto(alarm.referencePhotoPath);
    }
  }, [alarm]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (error) {
      toast.error('Could not access camera. Please enable permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const photoUrl = canvas.toDataURL('image/jpeg');
    setCapturedPhoto(photoUrl);
    stopCamera();

    // Verify photo
    setIsVerifying(true);
    const result = await photoVerificationService.verifyPhoto(photoUrl, alarm.similarityThreshold);
    setIsVerifying(false);
    
    setSimilarity(result.similarity);

    if (result.isSimilar) {
      setPhotoCompleted(true);
      toast.success('Photo verified! ✓');
      
      if (alarm.dismissMethod === 'photo') {
        onDismiss('photo', { photoSimilarity: result.similarity, photoPath: photoUrl });
      } else if (alarm.dismissMethod === 'both' && stepsCompleted) {
        onDismiss('both', { 
          steps: currentSteps, 
          photoSimilarity: result.similarity, 
          photoPath: photoUrl 
        });
      }
    } else {
      toast.error(`Photo not similar enough (${Math.round(result.similarity * 100)}%). Try again.`);
    }
  }, [alarm, stepsCompleted, currentSteps, stopCamera, onDismiss]);

  // Check if both methods completed
  useEffect(() => {
    if (alarm.dismissMethod === 'both' && stepsCompleted && photoCompleted) {
      onDismiss('both', { 
        steps: currentSteps, 
        photoSimilarity: similarity || 0, 
        photoPath: capturedPhoto || '' 
      });
    }
  }, [alarm.dismissMethod, stepsCompleted, photoCompleted, currentSteps, similarity, capturedPhoto, onDismiss]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getDismissMethodIcon = () => {
    switch (alarm.dismissMethod) {
      case 'steps': return <Footprints className="w-8 h-8" />;
      case 'photo': return <Camera className="w-8 h-8" />;
      case 'both': return <RefreshCw className="w-8 h-8" />;
      default: return <Footprints className="w-8 h-8" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-red-500/90 to-pink-600/90 flex flex-col">
      {/* 
        ============================================================
        ADSTERRA BANNER - Inside alarm screen
        ============================================================
      */}
      <div className="bg-background/10 backdrop-blur-sm">
        <AdsterraBanner className="max-w-4xl mx-auto" />
      </div>

      {/* Alarm Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white">
        <div className="animate-bounce mb-4">
          {getDismissMethodIcon()}
        </div>
        
        <h1 className="text-6xl font-bold mb-2">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </h1>
        
        <p className="text-xl opacity-90 mb-8">{alarm.title}</p>
        
        <div className="flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full animate-pulse">
          <Bell className="w-5 h-5" />
          <span className="font-semibold">ALARM RINGING!</span>
        </div>
      </div>

      {/* Task Area */}
      <div className="bg-background rounded-t-3xl p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Progress for both methods */}
        {alarm.dismissMethod === 'both' && (
          <div className="flex gap-4 mb-4">
            <div className={`flex-1 p-4 rounded-xl ${stepsCompleted ? 'bg-green-500/20 border-2 border-green-500' : 'bg-muted'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="w-5 h-5" />
                <span className="font-medium">Steps</span>
                {stepsCompleted && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
              </div>
              <Progress value={stepProgress * 100} className="h-2" />
            </div>
            <div className={`flex-1 p-4 rounded-xl ${photoCompleted ? 'bg-green-500/20 border-2 border-green-500' : 'bg-muted'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5" />
                <span className="font-medium">Photo</span>
                {photoCompleted && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
              </div>
              <Progress value={similarity ? similarity * 100 : 0} className="h-2" />
            </div>
          </div>
        )}

        {/* Step Counter */}
        {(alarm.dismissMethod === 'steps' || (alarm.dismissMethod === 'both' && !stepsCompleted)) && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${stepProgress * 283} 283`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Footprints className="w-8 h-8 text-primary mb-1" />
                  <span className="text-2xl font-bold">{currentSteps}</span>
                  <span className="text-xs text-muted-foreground">/ {alarm.requiredSteps}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                Walk with your phone to count steps
              </p>
            </CardContent>
          </Card>
        )}

        {/* Photo Capture */}
        {(alarm.dismissMethod === 'photo' || (alarm.dismissMethod === 'both' && !photoCompleted)) && (
          <Card>
            <CardContent className="p-6">
              {capturedPhoto ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={capturedPhoto} 
                      alt="Captured" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {isVerifying && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p>Verifying...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {similarity !== null && !isVerifying && (
                    <div className={`p-4 rounded-lg ${similarity >= alarm.similarityThreshold ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <p className="text-center font-medium">
                        Similarity: {Math.round(similarity * 100)}%
                      </p>
                      {similarity < alarm.similarityThreshold && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => {
                            setCapturedPhoto(null);
                            setSimilarity(null);
                            startCamera();
                          }}
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : cameraActive ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={stopCamera}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Button onClick={capturePhoto} className="w-full">
                    <CameraIcon className="w-4 h-4 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  {alarm.referencePhotoPath && (
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={alarm.referencePhotoPath}
                        alt="Reference"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="text-left">
                        <p className="font-medium">Match this photo</p>
                        <p className="text-sm text-muted-foreground">
                          Similarity needed: {Math.round(alarm.similarityThreshold * 100)}%
                        </p>
                      </div>
                    </div>
                  )}
                  <Button onClick={startCamera} className="w-full">
                    <CameraIcon className="w-4 h-4 mr-2" />
                    Open Camera
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Snooze Button */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onSnooze}
        >
          <PauseCircle className="w-4 h-4 mr-2" />
          Snooze ({alarm.snoozeMinutes} min)
        </Button>
      </div>
    </div>
  );
}

export default AlarmRingingScreen;
