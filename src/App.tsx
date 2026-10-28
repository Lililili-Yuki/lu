import { ForestDeer } from '@/components/ForestDeer';
import { slogans } from '@/lib/slogans';
import { CheckIn } from '@/components/CheckIn';
import { Match } from '@/components/Match';
import { localDay } from '@/lib/date';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';
import { Timer } from '@/components/Timer';
import { Calendar } from '@/components/Calendar';
import { Stats } from '@/components/Stats';
import { HistoryList } from '@/components/HistoryList';
import { useRecords } from '@/hooks/useRecords';
import { Timer as TimerIcon, BarChart3, CalendarDays, History, Users, Leaf } from 'lucide-react';

function App() {
  const {
    records,
    isLoaded,
    addRecord,
    deleteRecord,
  } = useRecords();

  const [activeTab, setActiveTab] = useState('timer');
  const [slogan] = useState(() => slogans[Math.floor(Math.random() * slogans.length)]);

  const handleRecord = (duration: number, startedAt?: string) => {
    const now = new Date();
    const dateStr = localDay(now);
    
    try {
    const record = addRecord({
      date: dateStr,
      startTime: startedAt || new Date(now.getTime() - duration * 1000).toISOString(),
      endTime: now.toISOString(),
      duration,
    });

    if (record) {
      toast.success('记录已保存！', {
        description: `时长: ${formatDurationForToast(duration)}`,
      });
    }
    } catch { toast.error('记录保存失败，请检查存储空间后重试'); throw new Error('记录保存失败'); }
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
    <div className="forest-app min-h-screen">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="forest-header">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                🦌
              </div>
              <div>
                <h1 className="text-xl font-bold">鹿间 · 记录</h1>
                <p className="text-xs text-muted-foreground">DEER DAYS · 每一刻，都值得记录</p>
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
        <section className="forest-welcome">
          <div><span className="forest-eyebrow"><Leaf size={14}/> YOUR LITTLE FOREST</span><h2>{slogan[0]}<br/>{slogan[1]}</h2><p>把片刻留在这里，让每一天都有迹可循。</p><span className="forest-date">{new Date().toLocaleDateString('zh-CN', {month:'long',day:'numeric',weekday:'long'})}</span></div>
          <ForestDeer />
        </section>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <TimerIcon className="w-4 h-4" />
              <span className="nav-label">计时</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span className="nav-label">日历</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="nav-label">统计</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="nav-label">历史</span>
            </TabsTrigger>
            <TabsTrigger value="match" className="flex items-center gap-2"><Users className="w-4 h-4" /><span className="nav-label">匹配</span></TabsTrigger>
          </TabsList>

          <TabsContent value="timer" forceMount hidden={activeTab !== 'timer'} className="space-y-6">
            <div className="forest-workspace"><Timer onRecord={handleRecord} /><CheckIn /></div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {records.length}
                </div>
                <div className="text-xs text-muted-foreground">记录次数</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.floor(records.reduce((sum, r) => sum + r.duration, 0) / 3600)}
                </div>
                <div className="text-xs text-muted-foreground">累计小时</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {new Set(records.map((r) => r.date)).size}
                </div>
                <div className="text-xs text-muted-foreground">活跃天数</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="match" forceMount hidden={activeTab !== 'match'}><Match onRecord={handleRecord} /></TabsContent>
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
          <p>一鹿相伴，慢慢记录。 · 数据保存在当前浏览器</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

