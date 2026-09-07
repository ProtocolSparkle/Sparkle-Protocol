<p align="center">
  <img src="https://raw.githubusercontent.com/ProtocolSparkle/Sparkle-Protocol/main/assets/sparkle-logo.png" alt="Sparkle Protocol" width="120" height="120">
</p>

<h1 align="center">Sparkle Protocol</h1>

<p align="center">Bitcoin Ordinals swap primitives and Lightning integration research</p>

<p align="center">
  <a href="https://github.com/ProtocolSparkle/Sparkle-Protocol/actions/workflows/ci.yml"><img src="https://github.com/ProtocolSparkle/Sparkle-Protocol/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-555?style=flat-square" alt="MIT license"></a>
  <a href="https://www.npmjs.com/package/@sparkleprotocol/core"><img src="https://img.shields.io/npm/v/@sparkleprotocol/core?style=flat-square" alt="npm version"></a>
</p>

<p align="center">
  <a href="https://sparkleprotocol.com">Website</a> ·
  <a href="proofs/README.md">Public evidence</a> ·
  <a href="docs/SPECIFICATION.md">Implementation notes</a> ·
  <a href="docs/READINESS.md">Readiness</a>
</p>

Sparkle explores exchanging Bitcoin inscriptions for Lightning payments using a shared SHA256 hashlock and a Taproot refund path. This repository contains TypeScript transaction primitives, wallet and node interfaces, an experimental coordinator, and reproducible offline checks.

**Current status:** the September 6, 2026 mainnet run demonstrates a real inscription lock and a preimage-based Bitcoin script-path claim. The operator controlled both sides, and that run included no Lightning payment. The SDK remains unaudited and has incomplete integration paths. See [readiness and implementation limits](docs/READINESS.md) before connecting funds.

## Latest mainnet evidence

| Record | Confirmed block | Transaction |
| --- | ---: | --- |
| Inscription lock | 965799 | [efe16e4c…65a493](https://mempool.space/tx/efe16e4cb60d0395f283b898f7e08a2597b4ca97bec80b482189fbd51865a493) |
| Script-path claim | 965803 | [43bee338…d3d7b5](https://mempool.space/tx/43bee33807fc453b360a8f0a3e0653b70cc97e177bbe07221fc60806ddd3d7b5) |

The completion record places inscription `5ec25d2eb7416f530aea00614ba8744c4ff7f5a35bf90e2094123d7d43eb16a1i0` at claim output 0, offset 0. Lock and claim fees total 372 sats; the claim reduced postage from 10,000 to 9,840 sats.

[Read the evidence and its scope](proofs/README.md), [download the original bundle](proofs/mainnet/2026-09-06/sparkle-mainnet-publication-20260906.zip), or [inspect the public verifier](https://sparkleprotocol.com/verify.html#proof-3). Earlier Bitcoin and operator-recorded Lightning evidence is preserved separately.

## Build and check

Use Node.js 22.12 or newer; CI covers the maintained Node 22 and 24 lines.

```sh
git clone https://github.com/ProtocolSparkle/Sparkle-Protocol.git
cd Sparkle-Protocol
npm ci --ignore-scripts
npm run check
```

The check builds TypeScript and browser bundles, runs offline assertion tests, executes the example, checks the original proof hashes, and verifies package contents and exports. It does not connect a wallet, pay an invoice, or broadcast a transaction.

| Command | Purpose |
| --- | --- |
| `npm test` | Run the offline test suite once |
| `npm run test:watch` | Watch tests during development |
| `npm run build:all` | Build ESM declarations and browser bundles |
| `npm run example` | Derive a demonstration testnet address after building |
| `npm run verify:proofs` | Check original publication hashes and manifest arithmetic |
| `npm audit --audit-level=low` | Check dependency advisories, including development tools |

## Quick start: offline address derivation

The transaction primitives are exported from `@sparkleprotocol/core/core`. This example uses the checked-out package after `npm run build`; the complete runnable file is [examples/basic-swap.ts](examples/basic-swap.ts).

```ts
import {
  createSparkleSwapAddress,
  generatePreimage,
  fromHex,
} from '@sparkleprotocol/core/core';

// Public test keys. Never fund this example's address.
const buyerPubkey = fromHex('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798');
const sellerPubkey = fromHex('02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5');
const { paymentHash } = generatePreimage();
const swap = createSparkleSwapAddress({
  paymentHash,
  buyerPubkey,
  sellerPubkey,
  refundLocktime: 2_500_288, // Fixed fixture height, not a live recommendation.
  network: 'testnet',
});
console.log(swap.address);
```

This only derives a contract address. It does not demonstrate an end-to-end Lightning trade. The published npm release is [1.0.1](https://www.npmjs.com/package/@sparkleprotocol/core/v/1.0.1); this checkout is the unreleased `1.0.2-dev.0` development version. See the [changelog](CHANGELOG.md) for source synchronization and new fixes.

## Repository map

| Path | Contents |
| --- | --- |
| [src/core](src/core) | Taproot scripts, claim/refund builders, minimal invoice parsing, legacy state helpers |
| [src/index.ts](src/index.ts) | SDK exports and provider-based interface |
| [src/adapters](src/adapters) | Browser wallet, Nostr, Lightning, and indexer adapters |
| [src/coordinator](src/coordinator) | Experimental coordination and persistence code |
| [tests](tests) | Offline unit and regression tests; historical manual test guides |
| [proofs](proofs/README.md) | Dated public mainnet evidence and immutable downloads |
| [docs](docs/README.md) | Current implementation notes, readiness, and historical design reports |

The website is deployed separately from this SDK repository. Its proof pages link to the same dated artifacts; pushing this repository does not deploy the website.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and [SECURITY.md](SECURITY.md) for private vulnerability reporting. Code and documentation are licensed under [MIT](LICENSE).
