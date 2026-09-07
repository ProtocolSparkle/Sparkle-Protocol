import { describe, it, expect } from 'vitest';
import { createSwapOffer, getPublicOffer, verifySwapOffer, recordFunding,
  recordPayment, buildClaimForBuyer, buildRefundForSeller, recordClaim,
  recordRefund } from '../src/core/index.js';
import { BUYER_KEY, SELLER_KEY, BUYER_PUBKEY, SELLER_PUBKEY, HEIGHT,
  FUNDING_TXID, FUNDING_AMOUNT, BUYER_ADDRESS, SELLER_ADDRESS } from './fixtures.js';

// Legacy coordinator state simulation. No Lightning node, wallet, or broadcast.
const offerFixture = () => createSwapOffer({
  sellerPubkey: SELLER_PUBKEY, buyerPubkey: BUYER_PUBKEY,
  ordinalId: 'bb'.repeat(32) + 'i0', priceSats: 5000n,
  currentBlockHeight: HEIGHT, locktimeBlocks: 288, network: 'testnet',
});
const fundedFixture = () => recordFunding(offerFixture(), FUNDING_TXID, 0, FUNDING_AMOUNT);

describe('Offline legacy swap state flow', () => {
  it('omits the secret from the public offer and reconstructs the address', () => {
    const swap = offerFixture();
    const offer = getPublicOffer(swap);
    expect(offer).not.toHaveProperty('preimageHex');
    expect(JSON.stringify(offer)).not.toContain(swap.preimageHex);
    expect(verifySwapOffer(offer, BUYER_PUBKEY).valid).toBe(true);
  });
  it('rejects a different buyer and a substituted swap address', () => {
    const offer = getPublicOffer(offerFixture());
    expect(verifySwapOffer(offer, SELLER_PUBKEY).valid).toBe(false);
    expect(verifySwapOffer({ ...offer, swapAddress: BUYER_ADDRESS }, BUYER_PUBKEY).valid).toBe(false);
  });
  it('records a simulated preimage reveal and builds a buyer claim', () => {
    const funded = fundedFixture();
    const paid = recordPayment(funded, funded.preimageHex!);
    const claim = buildClaimForBuyer(paid, BUYER_KEY, BUYER_ADDRESS, 2);
    const completed = recordClaim(paid, claim.txid);
    expect(completed.state).toBe('claimed');
    expect(completed.claimTxid).toBe(claim.txid);
    expect(claim.outputAmount + claim.fee).toBe(FUNDING_AMOUNT);
  });
  it('rejects a refund before the recorded timelock', () => {
    const funded = fundedFixture();
    expect(() => buildRefundForSeller(funded, SELLER_KEY, SELLER_ADDRESS, 2, HEIGHT)).toThrow();
  });
  it('builds and records the alternative refund after the timelock', () => {
    const funded = fundedFixture();
    const refund = buildRefundForSeller(funded, SELLER_KEY, SELLER_ADDRESS, 2, funded.refundLocktime + 1);
    expect(refund.locktime).toBe(funded.refundLocktime);
    expect(recordRefund(funded, refund.txid).state).toBe('refunded');
  });
});
