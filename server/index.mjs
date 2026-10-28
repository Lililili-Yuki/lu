import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export function createMatchServer() {
  const players = new Map();
  const queue = [];
  const MAX_SECONDS = 3600;
  function finish(p, now) {
    if (p.status === 'playing' && p.score == null) p.score = Math.min(MAX_SECONDS, Math.floor((now - p.started) / 1000));
  }
  function clean(now) {
    for (const [id, p] of players) {
      if (now - p.seen > 30000 && p.status !== 'done') {
        const other = players.get(p.opponent);
        if (other && other.status !== 'done') { finish(other, now); other.status = 'done'; other.reason = '对方已离线'; }
        p.status = 'done';
      }
      if (now - p.seen > 3600000) players.delete(id);
      if (p.status === 'playing' && now - p.started >= MAX_SECONDS * 1000) {
        finish(p, now); const other = players.get(p.opponent); if (other) { finish(other, now); other.status = 'done'; } p.status = 'done';
      }
    }
  }
  return createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const origin = process.env.ALLOWED_ORIGIN;
    if (origin && req.headers.origin === origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); }
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    const now = Date.now(); clean(now);
    const send = (code, data) => { res.writeHead(code); res.end(JSON.stringify(data)); };
    if (req.url === '/api/match/join' && req.method === 'POST') {
      if (players.size >= 1000) return send(503, {error:'服务繁忙，请稍后再试'});
      const id = randomUUID();
      const p = {id, name: '鹿友 ' + id.slice(0,4), status:'waiting', seen:now, score:null};
      players.set(id,p);
      let other;
      while (queue.length && !other) { const candidate = players.get(queue.shift()); if (candidate?.status === 'waiting') other = candidate; }
      if (other) {
        p.opponent = other.id; other.opponent = id;
        p.started = other.started = now; p.status = other.status = 'playing';
      } else queue.push(id);
      return send(200, {token:id});
    }
    const p = players.get(req.headers.authorization?.replace(/^Bearer /, ''));
    if (!p) return send(401, {error:'匹配已过期，请重新加入'});
    p.seen = now;
    if (req.url === '/api/match/stop' && req.method === 'POST') {
      finish(p, now);
      const other = players.get(p.opponent);
      if (other?.score != null) p.status = other.status = 'done';
    } else if (req.url === '/api/match/leave' && req.method === 'POST') {
      finish(p,now); p.status = 'done';
      const other = players.get(p.opponent);
      if (other) { finish(other,now); other.status = 'done'; other.reason = '对方已退出'; }
    } else if (!(req.url === '/api/match' && req.method === 'GET')) return send(404, {error:'接口不存在'});
    const other = players.get(p.opponent);
    return send(200, {status:p.status, name:p.name, started:p.started, score:p.score, elapsed:p.started ? Math.min(MAX_SECONDS, Math.floor((now-p.started)/1000)) : 0, reason:p.reason, opponent:other ? {name:other.name, score:other.score} : null});
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) createMatchServer().listen(Number(process.env.PORT || 3001), '0.0.0.0');
