# Public proof index

## September 6, 2026: inscription lock and script-path claim

The operator recorded a confirmed Bitcoin mainnet lock and a connected preimage-bearing Taproot claim carrying a real inscription.

| Field | Record |
| --- | --- |
| Inscription | `5ec25d2eb7416f530aea00614ba8744c4ff7f5a35bf90e2094123d7d43eb16a1i0` |
| Lock | [efe16e4cb60d0395f283b898f7e08a2597b4ca97bec80b482189fbd51865a493](https://mempool.space/tx/efe16e4cb60d0395f283b898f7e08a2597b4ca97bec80b482189fbd51865a493), output 0, block 965799 |
| Claim | [43bee33807fc453b360a8f0a3e0653b70cc97e177bbe07221fc60806ddd3d7b5](https://mempool.space/tx/43bee33807fc453b360a8f0a3e0653b70cc97e177bbe07221fc60806ddd3d7b5), output 0, block 965803 |
| Completion satpoint | Claim output 0, offset 0 |
| Postage | 10,000 sats at lock; 9,840 sats at claim |
| Lock + claim fees | 212 + 160 = 372 sats; excludes other transfers |
| Completion snapshot | 2026-09-06T16:39:56.956Z |

The original files are copied byte for byte from the [website publication](https://sparkleprotocol.com/mainnet-inscription-proof.html):

- [Publication note](mainnet/2026-09-06/index.md)
- [Machine-readable manifest](mainnet/2026-09-06/proof.json)
- [Original checksums](mainnet/2026-09-06/SHA256SUMS.txt)
- [Original ZIP](mainnet/2026-09-06/sparkle-mainnet-publication-20260906.zip)

Run `npm run verify:proofs` to check all four artifact hashes. The original checksum file lists the note and JSON manifest; the repository checker additionally pins the checksum file and ZIP themselves. The ZIP is a sanitized completion record, not a full offline reproduction kit.

**Scope:** the operator controlled the buyer and seller keys. This connected run did not include a Lightning invoice/payment, an independent-party sale, a broadcast refund, or an independent audit. Recorded confirmations and inscription location are historical snapshot values. The public [Proof 3 verifier](https://sparkleprotocol.com/verify.html#proof-3) provides additional transaction and script inspection.

## Earlier evidence

| Record | How to read it |
| --- | --- |
| [Mainnet proof](SPARKLE_MAINNET_PROOF.md) | Historical Bitcoin and operator-recorded Lightning evidence |
| [Complete proof report](SPARKLE_MAINNET_COMPLETE_PROOF_REPORT.md) | Historical report; its broad production-readiness claims are superseded by the current scope assessment |
| [Proof bundle](PROOF_BUNDLE.json) and [test results](TEST_RESULTS.json) | Original historical JSON records, preserved unchanged |

The December prototype inscription movement used a key-path sweep. It is distinct from the September real-inscription script-path claim and from earlier hashlock/Lightning experiments. Do not combine separate runs into a claim that one independently operated end-to-end sale was demonstrated.

See [readiness and remaining work](../docs/READINESS.md) before using the evidence as a basis for deployment.
