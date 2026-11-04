const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tianji-desktop-test-'));
try {
  const result = spawnSync(require('electron'), [path.join(__dirname, 'smoke.cjs')], {
    cwd: __dirname, stdio: 'inherit', windowsHide: true, timeout: 45000,
    env: { ...process.env, TIANJI_SMOKE_DATA: temporary },
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  const target = path.resolve(temporary);
  assert.equal(path.dirname(target), path.resolve(os.tmpdir()));
  assert.ok(path.basename(target).startsWith('tianji-desktop-test-'));
  fs.rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
}
