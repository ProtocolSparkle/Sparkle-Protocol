import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Expected digests of the exact public September 6 publication. This verifies
// artifact integrity and manifest consistency, not Bitcoin consensus or ownership.
const directory = new URL('../proofs/mainnet/2026-09-06/', import.meta.url);
const digests = {
  'index.md': '32621dd15e20b7ba30a1544a599e6d88f6895fece31f29b386ddd6e2c1da430e',
  'proof.json': 'dd7dac18342813939877c842410596a263a354a2b266d8db3c5d8332cc18f319',
  'SHA256SUMS.txt': '443dc68803b10288047d585398bca56c788a6ab2d7c72c876167911636de35b4',
  'sparkle-mainnet-publication-20260906.zip': '5903fe251e0a0f3b5bc27a57726d79f5036d2ac385324e53c30789c252b269ff',
};
for (const [name, expected] of Object.entries(digests)) {
  const bytes = await readFile(new URL(name, directory));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, name + ' digest');
}
const proof = JSON.parse(await readFile(new URL('proof.json', directory), 'utf8'));
assert.equal(proof.network, 'mainnet');
assert.equal(proof.lock.value_sats - proof.claim.value_sats, proof.claim.fee_sats);
assert.equal(proof.lock.fee_sats + proof.claim.fee_sats, 372);
assert.ok(proof.claim.block_height > proof.lock.block_height);
console.log('Verified all 4 original proof artifact hashes and manifest arithmetic.');
