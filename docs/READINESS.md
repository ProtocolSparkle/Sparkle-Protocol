# Readiness and implementation limits

Assessment of this repository on September 7, 2026. This is a source and evidence review, not an independent security audit.

## What is ready to share

The repository and [public evidence pages](https://sparkleprotocol.com/mainnet-inscription-proof.html) are suitable for technical review and discussion. The Bitcoin mechanism has meaningful public evidence: a real inscription was locked and spent through a preimage-bearing Taproot script path on September 6, 2026.

The [original manifest](../proofs/mainnet/2026-09-06/proof.json) is a completion snapshot. It records the inscription at claim output 0, offset 0 at that time; it does not assert current ownership. The operator controlled both keys. This run did not include a Lightning invoice/payment, an independent-party sale, or a broadcast refund. Earlier Lightning evidence remains separately documented.

## Repository improvements

- Source ports of the published npm 1.0.1 invoice-padding and incorrect-key fixes.
- Correct ESM imports in the claim/refund convenience wrappers and a working offline example.
- Actual assertions for invoice parsing, incorrect keys/preimages, claim/refund signatures, witness structure, and simulated state transitions.
- A committed npm lockfile, maintained development tools, and CI checks for builds, tests, exports, proof hashes, and dependency advisories.
- A separate development version, `1.0.2-dev.0`, so this checkout is not confused with the published npm 1.0.1 artifact.

These checks improve reproducibility and regression coverage. They do not prove the protocol safe under every failure condition.

## Work required before general public trading

| Area | Current limitation | Required validation |
| --- | --- | --- |
| SDK finalization | [finalizeSweepWithPreimage](../src/sdk-psbt.ts) is unimplemented; PSBT signing metadata and wallet behavior need completion/review | Complete the selected signing path and test it with supported wallets |
| Funding verification | [verifyBeforePayment](../src/core/swap-execution.ts) does not fetch or prove the funding UTXO | Enforce contract, unspent status, confirmations, value, and inscription checks before payment |
| Lightning lifecycle | Minimal invoice parsing and provider interfaces do not validate the complete hold-invoice flow | Review invoice validation, HTLC deadlines, acceptance, cancellation, settlement, and failures |
| Protocol ordering | Legacy seller-preimage helpers and buyer-preimage SDK interfaces encode different flows | Select and document one complete flow; test independent buyer and seller operation |
| Fee and asset preservation | Primitive builders deduct fees from postage; the SDK models separate fee funding | Validate sat offsets, dust/output policies, fee bumps, and wallet funding across both claim and refund |
| Operational recovery | Offline tests do not exercise reorgs, node outages, stalled payments, or adversarial peers | Run bounded integration tests and recovery drills, including the refund path |
| Independent review | No independent audit is established by these records | Commission review of the exact release commit and address findings before a general trading launch |

The experimental coordinator, auction engine, and browser adapters also need integration review before deployment with user assets. This update does not deploy those services or publish a new npm release.

## Evidence boundaries

`npm run verify:proofs` checks four original file hashes and manifest arithmetic. It does not independently execute Bitcoin consensus, prove chain inclusion, track Ordinals, or verify Lightning settlement. The website verifier performs additional script and transaction checks through public data sources; its checks should be read with the scope shown on the page.

The September claim reduced postage from 10,000 to 9,840 sats. It therefore demonstrates the single-input primitive path, not compliance with the SDK's separate-funding output-preservation policy. Preserve this distinction when presenting the result.
