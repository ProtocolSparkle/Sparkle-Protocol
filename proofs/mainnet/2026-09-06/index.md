# Verified Bitcoin mainnet inscription lock and claim

On **6 September 2026**, a controlled Sparkle Protocol test locked an inscription
in a Bitcoin mainnet Taproot output and claimed it through the hashlock script
path. Final verification passed at **16:39:56.956 UTC**, with the active chain at
height **965,803**. The lock had five confirmations and the claim had one.

The operator controlled both buyer and seller test keys. This demonstration
did not execute a cross-party Bitcoin payment or sale, and **no Lightning
invoice or payment was involved**. It establishes the specific Bitcoin
transaction behavior and inscription location recorded below.

| Transaction | Confirmed block | Fee | Virtual size | Effective fee rate |
| --- | --- | --- | --- | --- |
| [Lock: efe16e4cb60d0395f283b898f7e08a2597b4ca97bec80b482189fbd51865a493](https://mempool.space/tx/efe16e4cb60d0395f283b898f7e08a2597b4ca97bec80b482189fbd51865a493) | 965,799 | 212 sats | 212 vB | 1 sat/vB |
| [Claim: 43bee33807fc453b360a8f0a3e0653b70cc97e177bbe07221fc60806ddd3d7b5](https://mempool.space/tx/43bee33807fc453b360a8f0a3e0653b70cc97e177bbe07221fc60806ddd3d7b5) | 965,803 | 160 sats | 154 vB | 1.038961 sats/vB |

The combined lock and claim fees were **372 sats**, excluding the funding
transaction and any later transfers. Both builders were set to 1 sat/vB; the
claim SDK's conservative size allowance produced a 160-sat fee for the actual
154-vB transaction. The lock placed exactly **10,000 sats** in output zero. The
claim spent that output into one operator-owned Taproot output containing
**9,840 sats**.

The inscription was:

`5ec25d2eb7416f530aea00614ba8744c4ff7f5a35bf90e2094123d7d43eb16a1i0`

Its observed final satpoint was:

`43bee33807fc453b360a8f0a3e0653b70cc97e177bbe07221fc60806ddd3d7b5:0:0`

This identifies claim output zero, offset zero. At the verification snapshot,
that output was confirmed, unspent, and contained exactly the identified
inscription with **no runes**.

Verification compared the confirmed transactions with the saved artifacts,
checked their membership in Bitcoin Core's active chain, reconstructed the
public Taproot commitment, matched the claim script and control block, and
verified that the witness preimage hashed to the committed payment hash. The
claim's four witness items measured **64, 32, 69 and 65 bytes**. Inscription
identity and inventory were checked through the operator's approved ordinal
API; the local chain tip remained stable throughout that read.

A seller refund was prepared privately before the claim, but was never
broadcast. Its recovery path requires the height-lock condition **966,085** to
be satisfied while the lock output remains unspent. The confirmed claim has
spent that output, so the saved refund cannot spend it.

The [sanitized completion manifest](proof.json)
records the transaction IDs, block hashes, confirmations, fees and passed
checks. This controlled result is not a production security audit or evidence
of adversarial-party interoperability, Lightning atomicity, or every recovery
and reorganization scenario. Its observations apply to the stated snapshot.
