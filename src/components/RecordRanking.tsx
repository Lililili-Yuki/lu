import type { DeerRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

function duration(seconds: number) {
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
}
function timestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '时间未知' : date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}
export function RecordRanking({ records }: { records: DeerRecord[] }) {
  const sorted = [...records].sort((a, b) => b.duration - a.duration
    || b.startTime.localeCompare(a.startTime) || a.id.localeCompare(b.id));
  const ranks = new Map<number, number>();
  for (let index = 0; index < sorted.length; index++) {
    if (!ranks.has(sorted[index].duration)) ranks.set(sorted[index].duration, index + 1);
  }
  return <Card>
    <CardHeader>
      <CardTitle className="text-xl flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" />个人记录排名</CardTitle>
      <p className="text-sm text-muted-foreground">按单次时长从长到短排列，相同时长并列名次。仅比较你在本机保存的记录。</p>
    </CardHeader>
    <CardContent>
      {!sorted.length ? <div className="text-center py-10 text-muted-foreground"><p>还没有可排名的记录</p><p className="text-sm mt-2">完成一次计时并保存，就会出现在这里。</p></div> : <>
        <div className="rounded-xl bg-muted p-4 mb-5 flex flex-wrap justify-between gap-2 text-sm">
          <span>共 {sorted.length} 条记录</span>
          <span>最长时长 <strong className="font-mono text-primary">{duration(sorted[0].duration)}</strong></span>
        </div>
        <ol aria-label="个人时长排行榜" className="space-y-3 max-h-[560px] overflow-y-auto">
          {sorted.map((record) => {
            const rank = ranks.get(record.duration)!;
            return <li key={record.id} className="flex gap-3 sm:gap-4 rounded-xl border p-3 sm:p-4" data-record-id={record.id}>
              <span aria-label={`第 ${rank} 名`} className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-semibold ${rank <= 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{rank}</span>
              <div className="min-w-0 space-y-1">
                <p className="font-mono text-xl font-semibold text-primary">{duration(record.duration)}</p>
                <p className="text-sm">记录日期：<time dateTime={record.date}>{record.date}</time></p>
                <p className="text-xs text-muted-foreground break-words">开始：<time dateTime={record.startTime}>{timestamp(record.startTime)}</time></p>
                {record.endTime && <p className="text-xs text-muted-foreground break-words">结束：<time dateTime={record.endTime}>{timestamp(record.endTime)}</time></p>}
              </div>
            </li>;
          })}
        </ol>
        <p className="text-xs text-muted-foreground mt-4">日期按原记录归档，开始与结束时间按当前设备时区显示。时长格式为 时:分:秒，暂停时间不计入时长。新增或删除记录后排名自动更新。</p>
      </>}
    </CardContent>
  </Card>;
}
