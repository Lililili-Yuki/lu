import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatchServer } from './index.mjs';
test('real pair, isolated credentials, finish and cancellation', async () => {
  const realNow = Date.now;
  let now = realNow();
  Date.now = () => now;
  const server = createMatchServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + '/api/match';
  async function call(path = '', token = '', method = 'GET') {
    return fetch(base + path, {method, headers:{Authorization:'Bearer ' + token}});
  }
  try {
    const a = (await (await call('/join', '', 'POST')).json()).token;
    assert.equal((await (await call('', a)).json()).status, 'waiting');
    const b = (await (await call('/join', '', 'POST')).json()).token;
    const first = await (await call('', a)).json();
    const second = await (await call('', b)).json();
    assert.equal(first.status, 'playing');
    assert.equal(first.started, second.started);
    assert.equal(first.opponent.name, second.name);
    assert.equal((await call('', 'invalid')).status, 401);
    now += 12000;
    await call('/stop', a, 'POST');
    now += 5000;
    const done = await (await call('/stop', b, 'POST')).json();
    assert.equal(done.status, 'done');
    assert.equal(typeof done.score, 'number');
    assert.equal(done.score, 17);
    assert.equal(done.opponent.score, 12);
    assert.equal((await (await call('', a)).json()).status, 'done');
    const c = (await (await call('/join', '', 'POST')).json()).token;
    await call('/leave', c, 'POST');
    const d = (await (await call('/join', '', 'POST')).json()).token;
    assert.equal((await (await call('', d)).json()).status, 'waiting');
    const e = (await (await call('/join', '', 'POST')).json()).token;
    now += 31000;
    const offline = await (await call('', e)).json();
    assert.equal(offline.status, 'done');
  } finally { Date.now = realNow; await new Promise(resolve => server.close(resolve)); }
});
