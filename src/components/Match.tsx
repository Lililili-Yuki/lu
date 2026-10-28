import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type State = {status: string; name: string; started?: number; elapsed: number; score: number | null; reason?: string; opponent?: {name: string; score: number | null}};
const base = (import.meta.env.VITE_MATCH_API_URL ?? (import.meta.env.PROD ? 'https://lu-match-service.spunkykoi259.chatgpt.site' : '')).replace(/\/$/, '');
export function Match({onRecord}: {onRecord: (duration: number, startedAt?: string) => void}) {
  const available = import.meta.env.DEV || Boolean(base);
  const [token, setToken] = useState(() => sessionStorage.getItem('deer-match') || '');
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const recorded = useRef('');
  async function request(path: string, method = 'GET', auth = token) {
    const response = await fetch(base + '/api/match' + path, {method, headers: {Authorization: 'Bearer ' + auth}, signal: AbortSignal.timeout(8000)});
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '匹配服务暂不可用，请稍后重试');
    return data;
  }
  useEffect(() => {
    if (!token || !available) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try { const next = await request(''); if (active) { setState(next); setError(''); if (next.status === 'done') return; } }
      catch (e) { if (active) setError(String(e instanceof Error ? e.message : e)); }
      if (active) timer = setTimeout(poll, 3000);
    }
    void poll();
    return () => { active = false; clearTimeout(timer); };
  // The token identifies the current anonymous session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, available]);
  useEffect(() => {
    if (state?.score != null && state.score > 0 && token && recorded.current !== token && localStorage.getItem('deer-match-saved-' + token) !== '1') {
      try { onRecord(state.score, state.started ? new Date(state.started).toISOString() : undefined); } catch { return; }
      recorded.current = token; localStorage.setItem('deer-match-saved-' + token, '1');
    }
  }, [state, token, onRecord]);
  async function action(path: string) {
    setBusy(true); setError('');
    try {
      if (path === '/join') {
        if (token) await request('/leave', 'POST').catch(() => {});
        const result = await request(path, 'POST', ''); sessionStorage.setItem('deer-match', result.token); setState(null); setToken(result.token);
      } else setState(await request(path, 'POST'));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }
  return <section className="bg-card border rounded-xl p-6 space-y-5">
    <h2 className="text-xl font-bold">双人时长比拼</h2>
    <p className="text-sm text-muted-foreground">匿名匹配在线鹿友，配对后同时开始。双方结束后比较有效时长，最长一小时。成绩仅用于娱乐，请按自己的节奏结束。</p>
    <p className="text-sm text-muted-foreground">{!available ? '当前预览尚未连接匹配服务器，真人匹配暂未开放。计时与打卡可正常使用。' : '真人匹配已开放 · 等待另一位在线鹿友加入'}</p>
    <div aria-live="polite" className="space-y-2">
      {!token && <p>点击匹配，等待另一位在线用户加入。</p>}
      {token && !state && <p>正在连接匹配服务…</p>}
      {state?.status === 'waiting' && <p>正在寻找对手… 可随时取消</p>}
      {state?.opponent && <p>{state.name} vs {state.opponent.name}</p>}
      {state?.status === 'playing' && <p className="text-3xl font-mono">{state.score ?? state.elapsed} 秒 {state.score != null ? '· 等待对方结束' : '· 比拼中'}</p>}
      {state?.status === 'done' && <p>比拼结束 · 我 {state.score ?? 0} 秒 / 对方 {state.opponent?.score ?? 0} 秒<br/>{state.reason || (state.score === state.opponent?.score ? '平局' : (state.score ?? 0) > (state.opponent?.score ?? 0) ? '本次你获胜' : '对方获胜')}</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}
    </div>
    <div className="flex gap-3 flex-wrap">
      {(!token || state?.status === 'done' || error) && <Button disabled={busy || !available} onClick={() => action('/join')}>开始匹配</Button>}
      {state?.status === 'playing' && state.score == null && <Button disabled={busy} onClick={() => action('/stop')}>结束并记录</Button>}
      {token && state?.status !== 'done' && <Button disabled={busy} variant="outline" onClick={() => action('/leave')}>取消 / 退出</Button>}
    </div>
    <p className="text-xs text-muted-foreground">仅共享匿名昵称和本场成绩，不上传本地历史。离线超过 45 秒自动结束；刷新可恢复当前匹配。</p>
  </section>;
}
