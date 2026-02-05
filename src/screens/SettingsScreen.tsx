import { useState, useEffect } from 'react';
import { AdsterraBanner } from '@/components/ads';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, 
  Bell, 
  Footprints, 
  Camera, 
  Volume2,
  Vibrate,
  Moon,
  Sun,
  Info,
  Shield,
  FileText,
  Mail,
  Github,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [defaultSteps, setDefaultSteps] = useState(20);
  const [defaultSimilarity, setDefaultSimilarity] = useState(85);
  const [preventSleep, setPreventSleep] = useState(true);

  // Request notification permission
  useEffect(() => {
    if (notifications && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          setNotifications(false);
          toast.error('Notification permission denied');
        }
      });
    }
  }, [notifications]);

  const handleResetSettings = () => {
    if (confirm('Reset all settings to default?')) {
      setNotifications(true);
      setSound(true);
      setVibration(true);
      setDarkMode(true);
      setDefaultSteps(20);
      setDefaultSimilarity(85);
      setPreventSleep(true);
      toast.success('Settings reset');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* App Info */}
      <Card className="bg-gradient-to-r from-primary to-purple-600 border-0">
        <CardContent className="p-6 text-center text-white">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Ultimate Alarm</h2>
          <p className="text-white/80">Version 1.0.0</p>
          <p className="text-white/60 text-sm mt-2">
            The alarm that won&apos;t let you oversleep
          </p>
        </CardContent>
      </Card>

      {/* General Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          General
        </h3>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Show alarm notifications
                  </p>
                </div>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications} 
              />
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Sound</p>
                  <p className="text-sm text-muted-foreground">
                    Play alarm sound
                  </p>
                </div>
              </div>
              <Switch checked={sound} onCheckedChange={setSound} />
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Vibrate className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Vibration</p>
                  <p className="text-sm text-muted-foreground">
                    Vibrate when alarm rings
                  </p>
                </div>
              </div>
              <Switch checked={vibration} onCheckedChange={setVibration} />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme
                  </p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Default Values */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Default Values
        </h3>
        
        <Card>
          <CardContent className="p-4 space-y-6">
            {/* Default Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Footprints className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Default Steps</p>
                    <p className="text-sm text-muted-foreground">
                      Steps required to dismiss
                    </p>
                  </div>
                </div>
                <span className="font-medium">{defaultSteps}</span>
              </div>
              <Slider
                value={[defaultSteps]}
                onValueChange={(value) => setDefaultSteps(value[0])}
                min={5}
                max={100}
                step={5}
              />
            </div>

            {/* Default Similarity */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-medium">Default Similarity</p>
                    <p className="text-sm text-muted-foreground">
                      Photo match threshold
                    </p>
                  </div>
                </div>
                <span className="font-medium">{defaultSimilarity}%</span>
              </div>
              <Slider
                value={[defaultSimilarity]}
                onValueChange={(value) => setDefaultSimilarity(value[0])}
                min={70}
                max={95}
                step={1}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Advanced
        </h3>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Prevent Sleep</p>
                  <p className="text-sm text-muted-foreground">
                    Keep screen on during alarm
                  </p>
                </div>
              </div>
              <Switch checked={preventSleep} onCheckedChange={setPreventSleep} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          About
        </h3>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <button className="flex items-center gap-3 w-full text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">About Ultimate Alarm</p>
                <p className="text-sm text-muted-foreground">
                  Learn more about the app
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 w-full text-left pt-4 border-t border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Privacy Policy</p>
                <p className="text-sm text-muted-foreground">
                  How we handle your data
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 w-full text-left pt-4 border-t border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Contact Us</p>
                <p className="text-sm text-muted-foreground">
                  Get support and help
                </p>
              </div>
            </button>

            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full text-left pt-4 border-t border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-sm text-muted-foreground">
                  View source code
                </p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center space-y-4">
        <Button variant="outline" onClick={handleResetSettings}>
          Reset to Defaults
        </Button>
        
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Ultimate Alarm Team
        </p>
      </div>

      {/* 
        ============================================================
        ADSTERRA BANNER - Bottom of settings page
        ============================================================
      */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border -mx-4 px-4 py-2">
        <AdsterraBanner />
      </div>
    </div>
  );
}

export default SettingsScreen;
