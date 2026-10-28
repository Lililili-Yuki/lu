import { useState, useEffect } from 'react';
import { localDay } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function CheckIn() {
  const [days, setDays] = useState<string[]>(() => {
    try { const value = JSON.parse(localStorage.getItem('deer-checkins') || '[]'); return Array.isArray(value) ? value.filter(x => typeof x === 'string') : []; } catch { return []; }
  });
  const [today, setToday] = useState(localDay());
  useEffect(() => { const id = setInterval(() => setToday(localDay()), 1000); return () => clearInterval(id); }, []);
  const cursor = new Date(today + 'T12:00:00');
  if (!days.includes(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.includes(localDay(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  function checkIn() {
    const next = [...new Set([...days, today])];
    try { localStorage.setItem('deer-checkins', JSON.stringify(next)); setDays(next); toast.success('今日打卡成功'); }
    catch { toast.error('保存失败，请检查浏览器存储空间'); }
  }
  return <section className="border rounded-xl p-5 space-y-3 bg-card">
    <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">每日打卡</h2><p className="text-sm text-muted-foreground">连续 {streak} 天 · 累计 {new Set(days).size} 天</p></div>
    <Button disabled={days.includes(today)} onClick={checkIn}>{days.includes(today) ? '今日已打卡 ✓' : '今日打卡'}</Button></div>
    <p className="text-xs text-muted-foreground">打卡独立于计时，每天一次，以本地日期计算。</p>
    <div className="flex gap-2 flex-wrap">{Array.from({length: 7}, (_, i) => { const d = new Date(today + 'T12:00:00'); d.setDate(d.getDate() - 6 + i); const key = localDay(d); return <span key={key} className={`rounded px-2 py-1 text-xs ${days.includes(key) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{key.slice(5)} {days.includes(key) ? '✓' : '·'}</span>; })}</div>
  </section>;
}
