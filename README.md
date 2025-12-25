<p align="center">
  <img src="assets/sparkle-logo.png" alt="Sparkle Protocol" width="120" height="120">
</p>

<h1 align="center">Sparkle Protocol</h1>

<p align="center">
  <strong>Trustless Atomic Swaps for Bitcoin Ordinals via Lightning Network</strong>
</p>

<p align="center">
  <a href="#mainnet-proof"><img src="https://img.shields.io/badge/Status-Mainnet%20Validated-brightgreen?style=flat-square" alt="Status"></a>
  <a href="https://github.com/ProtocolSparkle/Sparkle-Protocol/actions"><img src="https://img.shields.io/github/actions/workflow/status/ProtocolSparkle/Sparkle-Protocol/ci.yml?style=flat-square&label=CI" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"></a>
  <a href="https://www.npmjs.com/package/@sparkleprotocol/core"><img src="https://img.shields.io/npm/v/@sparkleprotocol/core?style=flat-square" alt="npm"></a>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Bitcoin-Taproot-F7931A?style=flat-square&logo=bitcoin&logoColor=white" alt="Bitcoin">
</p>

<p align="center">
  <a href="https://sparkleprotocol.com">Website</a> |
  <a href="docs/SPECIFICATION.md">Specification</a> |
  <a href="proofs/">Mainnet Proofs</a> |
  <a href="#quick-start">Quick Start</a>
</p>

---

## Overview

Sparkle Protocol enables **trustless atomic swaps for Bitcoin Ordinals** using Lightning Network payments. Trade inscriptions securely without intermediaries, custodial accounts, or private key exposure.

**TL;DR:** Pay Lightning, get Ordinal. Trustless. No custody risk.

---

## Quick Start

### Installation

```bash
npm install @sparkleprotocol/core
```

### Basic Usage

```typescript
import {
  createSparkleSwapAddress,
  generatePreimage,
  computePaymentHash,
} from '@sparkleprotocol/core';

// 1. Generate preimage and payment hash
const { preimage, preimageHex } = generatePreimage();
const paymentHash = computePaymentHash(preimage);

// 2. Create swap address
const swapAddress = createSparkleSwapAddress({
  sellerPubkey: SELLER_PUBKEY,
  buyerPubkey: BUYER_PUBKEY,
  paymentHash: paymentHashHex,
  timelockHeight: currentBlock + 144,
  network: 'mainnet',
});

// 3. Seller locks inscription to swapAddress.address
// 4. Buyer pays Lightning invoice
// 5. Buyer claims with preimage
```

### Run Coordinator Server

```bash
git clone https://github.com/ProtocolSparkle/Sparkle-Protocol
cd Sparkle-Protocol && npm install
npx tsx src/coordinator/server.ts
```

---

## Mainnet Proof

The protocol has been validated on Bitcoin mainnet:

| Component | Transaction ID |
|-----------|---------------|
| **Lock TX** | [a3c6b08ed820194ee...](https://mempool.space/tx/a3c6b08ed820194ee3274a3eae945071c2ed33105b41db207cd16c9661de28a7) |
| **Sweep TX** | [9422e6cb358295d86...](https://mempool.space/tx/9422e6cb358295d86ad6d73bc0566c869aa0be8290c60598be205f4eea9ce50b) |

See [proofs/](proofs/) for full verification details.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPARKLE PROTOCOL FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SELLER                         HTLC                           BUYER      │
│   ┌─────┐                    ┌─────────┐                       ┌─────┐     │
│   │     │ ── 1. Lock ──────> │ Taproot │                       │     │     │
│   │ 🖼️  │    Inscription     │ Address │                       │ ⚡  │     │
│   │     │                    │         │ <── 2. Pay Lightning ─│     │     │
│   │     │                    │  ┌───┐  │     (reveals preimage)│     │     │
│   │     │                    │  │ 🔐│  │                       │     │     │
│   │     │ <── 4. Receive ─── │  └───┘  │ ── 3. Claim ────────> │     │     │
│   │     │    Lightning       │         │    with preimage      │ 🖼️  │     │
│   └─────┘                    └─────────┘                       └─────┘     │
│                                                                             │
│   ════════════════════════════════════════════════════════════════════     │
│   RESULT: Atomic exchange - both succeed or neither does                   │
│   TIMEOUT: Seller reclaims inscription if buyer abandons                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow Steps

1. **Seller locks inscription** in Taproot address with two spending paths
2. **Buyer pays Lightning invoice** - payment held until preimage revealed
3. **Seller claims payment** - reveals preimage on Lightning Network
4. **Buyer claims inscription** - uses revealed preimage on-chain
5. **Atomic settlement** - both parties receive assets or trade times out

### Security Properties

| Property | Guarantee |
|----------|-----------|
| **Atomicity** | Payment and transfer occur together or not at all |
| **Non-custodial** | No third party holds funds or inscriptions |
| **Trustless** | No trust required between buyer and seller |
| **Recoverable** | Seller can always reclaim via timelock refund |

---

## Coordinator API

| Endpoint | Method | Description |
|----------|--------|-------------|
| /health | GET | Health check and stats |
| /api/swaps | GET | List active swaps |
| /api/swaps/:id | GET | Get swap details |
| /api/swaps | POST | Create new swap |
| /api/stats | GET | Coordinator statistics |

---

## Repository Structure

```
Sparkle-Protocol/
├── docs/               # Protocol documentation
├── proofs/             # Mainnet validation evidence
├── src/                # TypeScript SDK source
│   ├── core/          # Core swap primitives
│   ├── coordinator/   # Coordinator server
│   └── adapters/      # Wallet integrations
├── examples/           # Usage examples
├── tests/              # Test suite
└── LICENSE             # MIT License
```

---

## Technical Specification

- **Taproot (BIP-341)** for script-path spending
- **SHA256 hashlocks** bound to Lightning payment hashes
- **CLTV timelocks** for seller refund protection
- **Hold invoices** for atomic settlement

Full specification: [docs/SPECIFICATION.md](docs/SPECIFICATION.md)

---

## License

MIT License - see [LICENSE](LICENSE)

---

## Community

- **Website:** https://sparkleprotocol.com
- **Twitter/X:** [@SparkleProtocol](https://twitter.com/SparkleProtocol)
- **Discord:** Coming soon

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Links

- **Website:** https://sparkleprotocol.com
- **NPM:** https://www.npmjs.com/package/@sparkleprotocol/core
- **Specification:** [docs/SPECIFICATION.md](docs/SPECIFICATION.md)
- **GitHub:** https://github.com/ProtocolSparkle/Sparkle-Protocol
