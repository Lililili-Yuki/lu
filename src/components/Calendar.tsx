import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DeerRecord } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarProps {
  records: DeerRecord[];
}

export function Calendar({ records }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Create calendar grid
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  // Get records for a specific day
  const getDayRecords = (day: number): DeerRecord[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records.filter((r) => r.date === dateStr);
  };

  // Calculate total duration for a day
  const getDayTotalDuration = (day: number): number => {
    const dayRecords = getDayRecords(day);
    return dayRecords.reduce((sum, r) => sum + r.duration, 0);
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h${remainingMins}m` : `${hrs}h`;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get selected date records
  const selectedDateRecords = selectedDate
    ? records.filter((r) => r.date === selectedDate)
    : [];

  const selectedDateTotal = selectedDateRecords.reduce(
    (sum, r) => sum + r.duration,
    0
  );

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">📅 日历记录</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            今天
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium min-w-[120px] text-center">
            {year}年{month + 1}月
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayRecords = getDayRecords(day);
            const hasRecords = dayRecords.length > 0;
            const totalDuration = getDayTotalDuration(day);
            const isToday =
              new Date().toDateString() ===
              new Date(year, month, day).toDateString();

            return (
              <button
                key={day}
                onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(
                    2,
                    '0'
                  )}-${String(day).padStart(2, '0')}`;
                  if (hasRecords) {
                    setSelectedDate(dateStr);
                  }
                }}
                className={`
                  aspect-square p-1 rounded-lg border transition-all relative
                  ${isToday ? 'border-primary bg-primary/5' : 'border-border'}
                  ${hasRecords ? 'hover:bg-accent cursor-pointer' : 'cursor-default'}
                `}
              >
                <span
                  className={`
                    text-sm font-medium
                    ${isToday ? 'text-primary' : 'text-foreground'}
                  `}
                >
                  {day}
                </span>
                {hasRecords && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-[10px] text-center text-primary font-medium truncate">
                      {formatDuration(totalDuration)}
                    </div>
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {dayRecords.length > 3 ? (
                        <span className="text-[8px] text-muted-foreground">
                          {dayRecords.length}次
                        </span>
                      ) : (
                        Array.from({ length: dayRecords.length }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>有记录</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full border border-primary" />
            <span>今天</span>
          </div>
        </div>
      </CardContent>

      {/* Day detail dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate?.split('-').slice(1).join('月')}日 的记录
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {selectedDateRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  暂无记录
                </p>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground mb-3">
                    当日总计:{' '}
                    <span className="font-medium text-foreground">
                      {formatDuration(selectedDateTotal)}
                    </span>{' '}
                    · {selectedDateRecords.length} 次
                  </div>
                  {selectedDateRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-medium">
                            {formatDuration(record.duration)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(record.startTime).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
