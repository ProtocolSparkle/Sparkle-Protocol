/** Offline address derivation only. Run: npm run example. */
import { createSparkleSwapAddress, generatePreimage, fromHex } from '@sparkleprotocol/core/core';

// Public demonstration keys. Never send funds to this example's address.
const buyerPubkey = fromHex('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798');
const sellerPubkey = fromHex('02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5');
const { paymentHash } = generatePreimage();
const swap = createSparkleSwapAddress({
  paymentHash, buyerPubkey, sellerPubkey,
  refundLocktime: 2_500_288, // Fixed fixture height; not a live timelock recommendation.
  network: 'testnet',
});
if (!swap.address.startsWith('tb1p')) throw new Error('Expected a testnet Taproot address');
console.log('Offline testnet address:', swap.address);
console.log('No invoice, payment, wallet connection, or transaction broadcast occurred.');
