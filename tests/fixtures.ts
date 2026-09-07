// Public deterministic keys for offline tests. Never fund these addresses.
import * as btc from '@scure/btc-signer';
import { fromHex, sha256, createSparkleSwapAddress } from '../src/core/index.js';

export const BUYER_KEY = fromHex('01'.padStart(64, '0'));
export const SELLER_KEY = fromHex('02'.padStart(64, '0'));
export const BUYER_PUBKEY = fromHex('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798');
export const SELLER_PUBKEY = fromHex('02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5');

export const PREIMAGE = fromHex('11'.repeat(32));
export const PAYMENT_HASH = sha256(PREIMAGE);
export const HEIGHT = 2_500_000;
export const TIMELOCK = HEIGHT + 288;
export const FUNDING_TXID = 'aa'.repeat(32);
export const FUNDING_AMOUNT = 10_000n;
export const BUYER_ADDRESS = btc.p2wpkh(BUYER_PUBKEY, btc.TEST_NETWORK).address!;
export const SELLER_ADDRESS = btc.p2wpkh(SELLER_PUBKEY, btc.TEST_NETWORK).address!;
export function swapFixture(xOnly = false) {
  return createSparkleSwapAddress({
    paymentHash: PAYMENT_HASH,
    buyerPubkey: xOnly ? BUYER_PUBKEY.slice(1) : BUYER_PUBKEY,
    sellerPubkey: xOnly ? SELLER_PUBKEY.slice(1) : SELLER_PUBKEY,
    refundLocktime: TIMELOCK,
    network: 'testnet',
  });
}
export function claimFixture(xOnly = false) {
  return { swapAddress: swapFixture(xOnly), fundingTxid: FUNDING_TXID,
    fundingVout: 0, fundingAmount: FUNDING_AMOUNT, preimage: PREIMAGE,
    buyerPrivkey: BUYER_KEY, destinationAddress: BUYER_ADDRESS,
    feeRate: 2, network: 'testnet' as const };
}
export function refundFixture(xOnly = false) {
  return { swapAddress: swapFixture(xOnly), fundingTxid: FUNDING_TXID,
    fundingVout: 0, fundingAmount: FUNDING_AMOUNT, sellerPrivkey: SELLER_KEY,
    destinationAddress: SELLER_ADDRESS, feeRate: 2, network: 'testnet' as const };
}
