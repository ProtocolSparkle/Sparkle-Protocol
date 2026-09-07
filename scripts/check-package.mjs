import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert.ok(process.env.npm_execpath, 'Run this check with npm run check:package');
const packed = spawnSync(process.execPath, [process.env.npm_execpath,
  'pack', '--dry-run', '--ignore-scripts', '--json'], {
  cwd: fileURLToPath(root), encoding: 'utf8', windowsHide: true,
});
assert.equal(packed.status, 0, packed.stderr || 'npm pack failed');
const packReport = JSON.parse(packed.stdout);
// npm 10/11 return an array; npm 12 keys results by package name.
const manifest = Array.isArray(packReport) ? packReport[0] : packReport[pkg.name];
assert.ok(manifest?.files, 'npm pack did not return a file manifest');
const paths = new Set(manifest.files.map(file => file.path));
for (const entry of Object.values(pkg.exports)) {
  assert.ok(paths.has(entry.import.replace('./', '')), entry.import);
  assert.ok(paths.has(entry.types.replace('./', '')), entry.types);
}
for (const name of ['README.md', 'LICENSE', 'CHANGELOG.md', pkg.bin.sparkle.replace('./', '')]) {
  assert.ok(paths.has(name), 'Package is missing ' + name);
}
assert.ok([...paths].every(path => path === 'package.json' || path.startsWith('dist/') ||
  ['README.md', 'LICENSE', 'CHANGELOG.md'].includes(path)), 'Unexpected package contents');
// Catch import-time handles that would make a consumer or this check hang.
const smoke = spawnSync(process.execPath, ['--input-type=module', '--eval',
  "await import('@sparkleprotocol/core');"], {
  cwd: fileURLToPath(root), encoding: 'utf8', windowsHide: true, timeout: 15000,
});
assert.equal(smoke.status, 0, smoke.error?.message || smoke.stderr || 'SDK import did not exit');
const sdk = await import('@sparkleprotocol/core');
const core = await import('@sparkleprotocol/core/core');
const adapters = await import('@sparkleprotocol/core/adapters');
assert.equal(sdk.VERSION, pkg.version);
assert.equal(sdk.SparkleSDK.version, pkg.version);
assert.equal(typeof core.createSparkleSwapAddress, 'function');
assert.equal(typeof adapters.createHiroIndexer, 'function');
console.log('Package contents, ESM exports, declarations, and SDK version checks passed.');
