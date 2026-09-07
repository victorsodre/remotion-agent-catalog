import assert from 'node:assert/strict';
import { request } from 'node:http';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { startServer } from './serve.mjs';

function get(port, path, headers = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method, headers, agent: false }, res => {
      const chunks = [];
      res.on('data', x => chunks.push(x));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
    });
    req.setTimeout(2000, () => req.destroy(new Error('Tempo de resposta excedido')));
    req.on('error', reject);
    req.end();
  });
}

test('servidor publica apenas os assets autorizados e resiste a URLs inválidas', async t => {
  const temp = await mkdtemp(join(tmpdir(), 'static-security-'));
  const root = join(temp, 'site');
  const sibling = join(temp, 'site-private');
  await mkdir(join(root, 'web'), { recursive: true });
  await mkdir(join(root, '.git'));
  await mkdir(join(root, 'scripts'));
  await mkdir(sibling);
  await writeFile(join(root, 'web/index.html'), 'PUBLIC_TEST_PAGE');
  await writeFile(join(root, 'web', 'app.js'), 'PUBLIC_TEST_SCRIPT');
  await writeFile(join(root, '.env'), 'PRIVATE_TEST_DATA');
  await writeFile(join(root, '.git', 'config'), 'PRIVATE_TEST_DATA');
  await writeFile(join(root, 'scripts', 'private.js'), 'PRIVATE_TEST_DATA');
  await writeFile(join(sibling, 'private.js'), 'PRIVATE_TEST_DATA');
  await symlink(join(sibling, 'private.js'), join(root, 'web', 'outside.js'));
  await symlink(join(root, '.env'), join(root, 'web', 'hidden.js'));
  const instance = await startServer(0, { root });
  t.after(async () => { await instance.close(); await rm(temp, { recursive: true, force: true }); });
  const { port, address } = instance.server.address();
  assert.equal(address, '127.0.0.1');
  assert.equal((await get(port, '/')).body, 'PUBLIC_TEST_PAGE');
  const asset = await get(port, '/web/app.js');
  assert.equal(asset.status, 200);
  assert.equal(asset.headers['access-control-allow-origin'], undefined);
  assert.equal(asset.headers['x-content-type-options'], 'nosniff');
  for (const target of ['/.env', '/.git/config', '/scripts/private.js', '/..%2fsite-private%2fprivate.js', '/web/%2e%2e/.env', '/web/outside.js', '/web/hidden.js', '/web/%00.js', '/web/%5c..%5c.env']) {
    await t.test(`bloqueia ${target}`, async () => {
      const result = await get(port, target);
      assert.equal(result.status, 404);
      assert.ok(!result.body.includes('PRIVATE_TEST_DATA'));
    });
  }
  assert.equal((await get(port, '/%')).status, 400);
  assert.equal((await get(port, '/')).status, 200);
  assert.equal((await get(port, '/', { Host: 'untrusted.example' })).status, 403);
  assert.equal((await get(port, '/', { Origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await get(port, '/', {}, 'POST')).status, 405);
  const head = await get(port, '/', {}, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
});
