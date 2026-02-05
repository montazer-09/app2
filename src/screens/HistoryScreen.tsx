import { useAlarmStore } from '@/store/alarmStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Trash2, 
  Footprints, 
  Camera, 
  RefreshCw,
  Clock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { AlarmHistory } from '@/types';

interface HistoryScreenProps {
  onBack: () => void;
}

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const { history, clearHistory, deleteHistoryEntry, getStatistics } = useAlarmStore();
  const stats = getStatistics();

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  const handleDeleteEntry = (id: string) => {
    deleteHistoryEntry(id);
    toast.success('Entry deleted');
  };

  const getDismissIcon = (type: string) => {
    switch (type) {
      case 'steps': return <Footprints className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'both': return <RefreshCw className="w-4 h-4" />;
      case 'snooze': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDismissColor = (type: string) => {
    switch (type) {
      case 'steps': return 'bg-green-500/20 text-green-500';
      case 'photo': return 'bg-pink-500/20 text-pink-500';
      case 'both': return 'bg-purple-500/20 text-purple-500';
      case 'snooze': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">History</h1>
        </div>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClearHistory}
            className="text-destructive"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRings}</p>
                <p className="text-xs text-muted-foreground">Total Rings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Footprints className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.dismissBySteps}</p>
                <p className="text-xs text-muted-foreground">By Steps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-pink-500/5 border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.dismissByPhoto}</p>
                <p className="text-xs text-muted-foreground">By Photo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.snoozed}</p>
                <p className="text-xs text-muted-foreground">Snoozed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No History</h3>
            <p className="text-muted-foreground">
              Your alarm history will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((entry: AlarmHistory) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onDelete={() => handleDeleteEntry(entry.id)}
              getDismissIcon={getDismissIcon}
              getDismissColor={getDismissColor}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface HistoryCardProps {
  entry: AlarmHistory;
  onDelete: () => void;
  getDismissIcon: (type: string) => React.ReactNode;
  getDismissColor: (type: string) => string;
  formatDuration: (ms: number) => string;
}

function HistoryCard({ 
  entry, 
  onDelete, 
  getDismissIcon, 
  getDismissColor,
  formatDuration 
}: HistoryCardProps) {
  const duration = entry.dismissTime && entry.ringTime 
    ? entry.dismissTime - entry.ringTime 
    : 0;

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDismissColor(entry.dismissType)}`}>
            {getDismissIcon(entry.dismissType)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium truncate">{entry.alarmTitle}</h4>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {format(entry.ringTime, 'MMM d')}
              </span>
            </div>
            
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{format(entry.ringTime, 'h:mm a')}</span>
              {duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(duration)}
                </span>
              )}
            </div>

            {/* Extra details */}
            {(entry.stepsTaken || entry.photoSimilarity) && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                {entry.stepsTaken && (
                  <span className="flex items-center gap-1 text-green-500">
                    <Footprints className="w-3 h-3" />
                    {entry.stepsTaken} steps
                  </span>
                )}
                {entry.photoSimilarity && (
                  <span className="flex items-center gap-1 text-pink-500">
                    <Camera className="w-3 h-3" />
                    {Math.round(entry.photoSimilarity * 100)}% match
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default HistoryScreen;
