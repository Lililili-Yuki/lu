import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DeerRecord } from '@/types';
import { Trophy, Clock, Calendar, TrendingUp } from 'lucide-react';

interface StatsProps {
  records: DeerRecord[];
}

export function Stats({ records }: StatsProps) {
  const stats = (() => {
    const totalCount = records.length;
    const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
    const daysWithRecords = new Set(records.map((r) => r.date)).size;
    
    // Calculate streak
    const sortedDates = [...new Set(records.map((r) => r.date))].sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let streak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays === 1) {
          streak++;
        } else {
          maxStreak = Math.max(maxStreak, streak);
          streak = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, streak);
    
    // Current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0];
    const hasRecordToday = sortedDates.includes(today);
    
    if (hasRecordToday) {
      currentStreak = 1;
      const todayDate = new Date();
      
      for (let i = 1; i <= 365; i++) {
        const checkDate = new Date(todayDate);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (sortedDates.includes(checkDateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Find longest session
    const longestSession = records.length > 0 
      ? Math.max(...records.map((r) => r.duration))
      : 0;
    
    // Find most active day
    const dayCounts: { [key: string]: number } = {};
    records.forEach((r) => {
      dayCounts[r.date] = (dayCounts[r.date] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalCount,
      totalDuration,
      daysWithRecords,
      averageDuration: totalCount > 0 ? totalDuration / totalCount : 0,
      averagePerDay: daysWithRecords > 0 ? totalCount / daysWithRecords : 0,
      currentStreak,
      maxStreak,
      longestSession,
      mostActiveDay: mostActiveDay?.[0] || null,
      mostActiveDayCount: mostActiveDay?.[1] || 0,
    };
  })();

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}小时${mins > 0 ? `${mins}分钟` : ''}`;
    }
    return `${mins}分钟`;
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const [, month, day] = dateStr.split('-');
    return `${month}月${day}日`;
  };

  const statCards = [
    {
      title: '总次数',
      value: stats.totalCount,
      unit: '次',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: '总时长',
      value: formatDuration(stats.totalDuration),
      unit: '',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: '活跃天数',
      value: stats.daysWithRecords,
      unit: '天',
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: '当前连续',
      value: stats.currentStreak,
      unit: '天',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">
                    {card.value}
                    {card.unit && <span className="text-sm font-normal ml-1">{card.unit}</span>}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均时长
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatDuration(stats.averageDuration)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              每次平均
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              最长记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatDuration(stats.longestSession)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              单次最高
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              最活跃日
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatDate(stats.mostActiveDay)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(stats.mostActiveDayCount as number) > 0 ? `${stats.mostActiveDayCount} 次` : '-'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
