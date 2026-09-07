# Sparkle implementation notes

Updated September 7, 2026. These notes describe the repository's Bitcoin primitives and integration boundaries. They are not an audited production specification.

## Bitcoin contract

[createSparkleSwapAddress](../src/core/taproot-scripts.ts) creates a P2TR output with two TapScript leaves:

```text
Claim:  OP_SHA256 <payment_hash> OP_EQUALVERIFY <buyer_xonly_pubkey> OP_CHECKSIG
Refund: <refund_height> OP_CHECKLOCKTIMEVERIFY OP_DROP <seller_xonly_pubkey> OP_CHECKSIG
```

The internal key is the fixed BIP-341 NUMS point:

```text
50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0
```

No private key for this point is known. It is used to make spending rely on the script conditions, under the discrete-log assumption. Earlier documentation identifying the seller's public key as the internal key does not describe the current builder. See [BIP-341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#constructing-and-spending-taproot-outputs).

| Path | Required witness, in stack order | Timing |
| --- | --- | --- |
| Buyer claim | Signature, 32-byte preimage, claim script, control block | Claim leaf has no expiry condition |
| Seller refund | Signature, refund script, control block | Refund transaction locktime and sequence must satisfy CLTV and transaction finality |

The buyer claim path remains spendable after the refund height. Claim and refund can therefore compete for the same UTXO; recovery requires an unspent output, a valid signature, sufficient fees, and inclusion in the chain.

## Public primitive API

Import these functions from `@sparkleprotocol/core/core`.

| Function | Inputs or behavior |
| --- | --- |
| `generatePreimage()` | Returns `{ preimage, paymentHash }` as 32-byte arrays |
| `createSparkleSwapAddress(params)` | Uses byte-array keys and hash, integer `refundLocktime`, and an explicit network; defaults to testnet |
| `buildClaimTransaction(params)` | Requires the buyer private key and matching preimage; returns a signed transaction |
| `buildRefundTransaction(params)` | Requires the seller private key; returns a signed transaction with the refund locktime |
| `decodeBolt11(invoice)` | Extracts payment hash, amount, and network; performs minimal parsing |

Public keys can be compressed (33 bytes) or x-only (32 bytes). The claim and refund builders reject a signing key that differs from the key in the supplied swap parameters. Construct and verify those parameters locally: this comparison does not authenticate arbitrary caller-supplied transaction or chain data.

The primitive builders spend one lock input and deduct fees from its value. They do not implement the provider SDK's separate fee-funding model. An application must verify the inscription offset and output ordering before using this construction.

## Lightning integration boundaries

The shared payment hash is the link between the Bitcoin hashlock and a Lightning payment. A hash match alone does not establish that the invoice is valid, held, settled, or safe to pay. The minimal decoder does not verify the invoice signature or expose a complete expiry/HTLC policy. Use a fully validating Lightning implementation for payment decisions. See [BOLT-11](https://github.com/lightning/bolts/blob/master/11-payment-encoding.md).

There are two distinct layers in this repository:

- The legacy `src/core/swap-execution.ts` helpers simulate a seller-generated preimage flow. `verifyBeforePayment` checks invoice fields but explicitly leaves on-chain funding verification to the caller.
- The root SDK exposes buyer-preimage utilities, hold-invoice provider interfaces, a settlement watcher, and a separate-funding PSBT builder. These interfaces and helpers do not constitute a completed end-to-end implementation. In particular, `finalizeSweepWithPreimage` currently throws an implementation-in-progress error.

Do not combine the ordering or assumptions from these layers into a payment flow without reviewing the whole integration. The offline state tests are simulations, with no Lightning payment or broadcast.

## Time and asset checks

The SDK's `SAFETY_BUFFER_BLOCKS` is 72 and its default refund window is 288 blocks. Historical 6/12/24-block recommendations in older reports are not the current SDK settings. Block production varies; conversion from invoice wall-clock expiry to a block height is an estimate. A production policy must also account for Lightning HTLC deadlines, confirmation policy, outages, fee escalation, and reorgs.

Bitcoin script validation does not identify inscriptions. Before a payment or signature, an integration must independently verify the actual funding output, unspent status, confirmations, reconstructed contract, inscription satpoint, destination, output ordering, and fees. See [readiness](READINESS.md) for the remaining implementation work and [the proof index](../proofs/README.md) for what has actually been demonstrated.
