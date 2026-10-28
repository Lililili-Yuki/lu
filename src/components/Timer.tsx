import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

interface TimerProps {
  onRecord: (duration: number, startedAt?: string) => void;
}

export function Timer({ onRecord }: TimerProps) {
  const [saved] = useState(() => { try { return JSON.parse(localStorage.getItem('deer-timer') || 'null'); } catch { return null; } });
  const [startedAt, setStartedAt] = useState<string | null>(saved?.startedAt || null);
  const [isRunning, setIsRunning] = useState(Boolean(saved?.running));
  const [startTime, setStartTime] = useState<number | null>(saved?.startTime || null);
  const [elapsed, setElapsed] = useState<number>(saved?.elapsed || 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  useEffect(() => {
    localStorage.setItem('deer-timer', JSON.stringify({ running: isRunning, startTime, elapsed, startedAt }));
  }, [isRunning, startTime, elapsed, startedAt]);

  const handleStart = () => {
    if (!startedAt) setStartedAt(new Date().toISOString());
    setIsRunning(true);
    setStartTime(Date.now() - elapsed * 1000);
  };

  const handlePause = () => {
    if (startTime) setElapsed(Math.floor((Date.now() - startTime) / 1000));
    setIsRunning(false);
  };

  const handleStop = () => {
    const duration = isRunning && startTime ? Math.floor((Date.now() - startTime) / 1000) : elapsed;
    try { if (duration > 0) onRecord(duration, startedAt || undefined); } catch { return; }
    setStartedAt(null);
    setIsRunning(false);
    setStartTime(null);
    setElapsed(0);
  };

  const handleReset = () => {
    if (!window.confirm('确定放弃当前计时？')) return;
    setStartedAt(null);
    setIsRunning(false);
    setStartTime(null);
    setElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl">🦌 计时器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-primary tracking-wider">
            {formatTime(elapsed)}
          </div>
          <p className="text-muted-foreground mt-2">
            {isRunning ? '计时中...' : elapsed > 0 ? '已暂停' : '准备开始'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {!isRunning ? (
            <Button
              size="lg"
              onClick={handleStart}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-5 h-5 mr-2" />
              开始
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={handlePause}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Pause className="w-5 h-5 mr-2" />
              暂停
            </Button>
          )}

          <Button
            size="lg"
            variant="outline"
            onClick={handleStop}
            disabled={elapsed === 0}
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <Square className="w-5 h-5 mr-2" />
            结束并记录
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            disabled={elapsed === 0}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            重置
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

