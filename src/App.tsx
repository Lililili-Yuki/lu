import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';
import { Timer } from '@/components/Timer';
import { Calendar } from '@/components/Calendar';
import { Stats } from '@/components/Stats';
import { HistoryList } from '@/components/HistoryList';
import { useRecords } from '@/hooks/useRecords';
import { Timer as TimerIcon, BarChart3, CalendarDays, History } from 'lucide-react';

function App() {
  const {
    records,
    isLoaded,
    addRecord,
    deleteRecord,
  } = useRecords();

  const [activeTab, setActiveTab] = useState('timer');

  const handleRecord = (duration: number) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    const record = addRecord({
      date: dateStr,
      startTime: new Date(now.getTime() - duration * 1000).toISOString(),
      endTime: now.toISOString(),
      duration,
    });

    if (record) {
      toast.success('记录已保存！', {
        description: `时长: ${formatDurationForToast(duration)}`,
      });
    }
  };

  const formatDurationForToast = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}小时 ${mins}分钟 ${secs}秒`;
    } else if (mins > 0) {
      return `${mins}分钟 ${secs}秒`;
    }
    return `${secs}秒`;
  };

  const handleDelete = (id: string) => {
    deleteRecord(id);
    toast.success('记录已删除');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                🦌
              </div>
              <div>
                <h1 className="text-xl font-bold">🦌记录器</h1>
                <p className="text-xs text-muted-foreground">记录每一次美好时光</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              已记录 <span className="font-medium text-foreground">{records.length}</span> 次
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <TimerIcon className="w-4 h-4" />
              <span className="hidden sm:inline">计时</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">日历</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">统计</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">历史</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-6">
            <Timer onRecord={handleRecord} />
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {records.length}
                </div>
                <div className="text-xs text-muted-foreground">总次数</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.floor(records.reduce((sum, r) => sum + r.duration, 0) / 3600)}
                </div>
                <div className="text-xs text-muted-foreground">总小时</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {new Set(records.map((r) => r.date)).size}
                </div>
                <div className="text-xs text-muted-foreground">活跃天数</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Calendar records={records} />
          </TabsContent>

          <TabsContent value="stats">
            <Stats records={records} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryList records={records} onDelete={handleDelete} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>🦌 记录美好生活 · 数据本地存储</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
