# Changelog

## 1.0.2-dev.0 (unreleased) — 2026-09-07

- Synchronize the three npm 1.0.1 corrections into the TypeScript source, with regression tests.
- Stop the coordinator housekeeping timer from keeping an idle SDK consumer alive.
- Fix ESM imports in the claim/refund hex wrappers and regtest invoice prefix detection.
- Replace the broken quick start with an executable offline testnet example.
- Replace false-success verification scripts with assertion-based test entry points; verify claim and refund Schnorr signatures and reject tampering.
- Commit the npm lockfile, update development tools, and check supported Node 22/24 builds, package exports, proof integrity, and dependency advisories in CI.
- Add the original September 6 mainnet inscription proof bundle without modifying its bytes.
- Clarify evidence scope, incomplete SDK paths, and historical production claims. Align package and public SDK development version labels.
- Development now requires Node.js 22.12 or newer. This is a repository development snapshot; no new npm package is published by this update.

## 1.0.1 — 2026-09-02 (published npm artifact)

- Remove an unused whole-payload byte conversion that caused real BOLT11 invoices to fail with a padding error.
- Reject buyer and seller private keys that differ from the keys in the supplied swap parameters.
- Correct package naming, logo links, and the npm package's description.

The source ports in this checkout were checked against the published [npm 1.0.1 artifact](https://www.npmjs.com/package/@sparkleprotocol/core/v/1.0.1). The original release was maintained as compiled output; this repository now carries the corresponding TypeScript fixes. These fixes do not change contract address or script construction.

## Historical entries

The original entries below are preserved as release history. Their broad production or atomic-swap claims are superseded by the current [evidence scope](proofs/README.md) and [readiness assessment](docs/READINESS.md).

## [1.0.0] - 2025-12-14

### Mainnet Validated Release

This release marks the first production-proven version of Sparkle Protocol, validated with a successful atomic swap on Bitcoin mainnet.

### Mainnet Proof
- **Lock TX**: [a3c6b08ed820194ee...](https://mempool.space/tx/a3c6b08ed820194ee3274a3eae945071c2ed33105b41db207cd16c9661de28a7)
- **Sweep TX**: [9422e6cb358295d86...](https://mempool.space/tx/9422e6cb358295d86ad6d73bc0566c869aa0be8290c60598be205f4eea9ce50b)

### Features
- **Sparkle Swap**: Trustless atomic swaps using Taproot hashlock/timelock scripts
- **Lightning Integration**: BOLT11 invoice decoding and payment hash verification
- **Wallet Adapters**: Support for Unisat, Xverse, and Alby wallets
- **Settlement Watcher**: Automatic preimage detection and settlement
- **Ghost Desk**: Private messaging via Nostr gift wrapping (NIP-59)
- **Safety Gates**: Comprehensive validation before transaction broadcast
- **Test Vectors**: Full test suite with cryptographic verification

### SDK Exports
- Core swap primitives (`createSparkleSwapAddress`, `buildClaimTransaction`, `buildRefundTransaction`)
- Provider interfaces (Indexer, Signer, Wallet, Lightning, Nostr)
- Safety validation (`validateOffer`, `calculateMinimumSafeTimelock`)
- PSBT construction (`constructSweepPsbt`, `finalizeSweepWithPreimage`)
- High-level SDK (`SparkleSDK`, `createSparkleSDK`)

### Security
- Taproot script-path spending (BIP-341)
- SHA256 hashlocks bound to Lightning payment hashes
- CLTV timelocks for seller refund protection
- No private key exposure in browser

## [0.3.0] - 2025-12-01

### Pre-release
- Initial TypeScript SDK implementation
- Core Taproot script generation
- Basic claim/refund transaction builders
- Test suite foundation

---

For more details, see the [GitHub repository](https://github.com/ProtocolSparkle/Sparkle-Protocol).
