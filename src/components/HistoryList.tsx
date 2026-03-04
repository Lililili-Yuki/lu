import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DeerRecord } from '@/types';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HistoryListProps {
  records: DeerRecord[];
  onDelete: (id: string) => void;
}

export function HistoryList({ records, onDelete }: HistoryListProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Group records by date
  const groupedRecords = (() => {
    const groups: { [key: string]: DeerRecord[] } = {};
    
    // Sort records by date (newest first)
    const sortedRecords = [...records].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    
    sortedRecords.forEach((record) => {
      if (!groups[record.date]) {
        groups[record.date] = [];
      }
      groups[record.date].push(record);
    });
    
    return groups;
  })();

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    
    return `${month}月${day}日`;
  };

  const sortedDates = Object.keys(groupedRecords).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">📜 历史记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>暂无记录</p>
            <p className="text-sm mt-1">开始计时来添加第一条记录吧！</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">📜 历史记录</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {sortedDates.map((date) => {
              const dayRecords = groupedRecords[date];
              const dayTotal = dayRecords.reduce((sum: number, r: DeerRecord) => sum + r.duration, 0);
              const isExpanded = expandedDates.has(date);

              return (
                <div key={date} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatDate(date)}</span>
                      <span className="text-sm text-muted-foreground">
                        {dayRecords.length} 次
                      </span>
                      <span className="text-sm text-primary">
                        {formatDuration(dayTotal)}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 space-y-2">
                      {dayRecords.map((record, index) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-2 bg-background rounded border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-6">
                              #{dayRecords.length - index}
                            </span>
                            <div>
                              <div className="font-mono font-medium">
                                {formatDuration(record.duration)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(record.startTime).toLocaleTimeString(
                                  'zh-CN',
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                                {' - '}
                                {record.endTime
                                  ? new Date(record.endTime).toLocaleTimeString(
                                      'zh-CN',
                                      { hour: '2-digit', minute: '2-digit' }
                                    )
                                  : '?'}
                              </div>
                            </div>
                          </div>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除这条记录吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(record.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
