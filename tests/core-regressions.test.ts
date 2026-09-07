import { describe, it, expect } from 'vitest';
import * as btc from '@scure/btc-signer';
import { schnorr } from '@noble/curves/secp256k1';
import { bech32 } from '@scure/base';
import { buildClaimTransaction, buildRefundTransaction, buildClaimTransactionFromHex,
  buildRefundTransactionFromHex, decodeBolt11, verifyInvoiceMatchesSwap,
  verifyBeforePayment, toHex, fromHex } from '../src/core/index.js';
import { BUYER_KEY, SELLER_KEY, BUYER_PUBKEY, SELLER_PUBKEY, PREIMAGE,
  PAYMENT_HASH, TIMELOCK, FUNDING_TXID, FUNDING_AMOUNT, BUYER_ADDRESS,
  SELLER_ADDRESS, claimFixture, refundFixture } from './fixtures.js';

// Public, expired LND invoice from https://sparkleprotocol.com/tests/adversarial.mjs.
// Decoding this fixture is offline; it is never submitted for payment.
const INVOICE = 'lnbc50u1p5n6u7gpp5rwqjcer9t6w2tcqzc94xlyetdn54am3f5nmmwgnmxu0sqkczwcnqdpc2dgyz5jtf3zjqst5dakkjceq2dmkzupq95s9qunfweshgefq2fhh2ar9cqzzsxqyz5vqsp5c9kjwx473jvvk66lmjzseajak7x87937hnzs6jwk8kc4jujracwq9qxpqysgq28w6mux9axcylwjrlzhvytrwhz4zt0vu4ncx8g59dgagxu6q30jkgqmxptyqxgl8x2pf8f2vp9240qe4utzg9xmqj4eg3nm358y9hhspa3ksc0';
const INVOICE_HASH = '1b812c64655e9ca5e002c16a6f932b6ce95eee29a4f7b7227b371f005b027626';
const decodeTx = (hex: string) => btc.Transaction.fromRaw(fromHex(hex), {
  allowUnknownInputs: true, allowUnknownOutputs: true,
});

describe('Published 1.0.1 invoice regressions', () => {
  it('decodes a real non-byte-aligned invoice without the padding crash', () => {
    const invoice = decodeBolt11(INVOICE);
    expect(toHex(invoice.paymentHash)).toBe(INVOICE_HASH);
    expect(invoice.amountSat).toBe(5000n);
    expect(invoice.network).toBe('mainnet');
  });
  it('compares the invoice hash and rejects a different hash', () => {
    expect(verifyInvoiceMatchesSwap(INVOICE, fromHex(INVOICE_HASH))).toBe(true);
    expect(verifyInvoiceMatchesSwap(INVOICE, PAYMENT_HASH)).toBe(false);
  });
  it('rejects checksum corruption', () => {
    const last = INVOICE.endsWith('q') ? 'p' : 'q';
    expect(() => decodeBolt11(INVOICE.slice(0, -1) + last)).toThrow('encoding');
  });
  it('recognizes the longer regtest prefix before mainnet', () => {
    const { words } = bech32.decode(INVOICE as `${string}1${string}`, 2000);
    // Parser-only fixture: this re-encoding intentionally has no valid signature.
    const regtest = bech32.encode('lnbcrt50u', words, 2000);
    expect(decodeBolt11(regtest).network).toBe('regtest');
  });
  it('rejects a mismatched offer hash for the correct reason', () => {
    const offer = { id: 'offline', sellerPubkeyHex: toHex(SELLER_PUBKEY),
      buyerPubkeyHex: toHex(BUYER_PUBKEY), ordinalId: 'bb'.repeat(32) + 'i0',
      priceSats: '5000', paymentHashHex: toHex(PAYMENT_HASH),
      swapAddress: claimFixture().swapAddress.address, refundLocktime: TIMELOCK,
      network: 'mainnet' as const };
    const result = verifyBeforePayment(offer, FUNDING_TXID, 0, INVOICE);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/hash/i);
    expect(result.error).not.toMatch(/padding/i);
  });
});

describe('Claim and refund key checks', () => {
  for (const xOnly of [false, true]) {
    it('rejects the seller key for a claim (' + (xOnly ? 'x-only' : 'compressed') + ')', () => {
      expect(() => buildClaimTransaction({ ...claimFixture(xOnly), buyerPrivkey: SELLER_KEY }))
        .toThrow('buyerPrivkey does not correspond');
    });
    it('rejects the buyer key for a refund (' + (xOnly ? 'x-only' : 'compressed') + ')', () => {
      expect(() => buildRefundTransaction({ ...refundFixture(xOnly), sellerPrivkey: BUYER_KEY }))
        .toThrow('sellerPrivkey does not correspond');
    });
    it('builds verifiable Schnorr signatures for both paths (' + (xOnly ? 'x-only' : 'compressed') + ')', () => {
      const claim = claimFixture(xOnly);
      const refund = refundFixture(xOnly);
      for (const [result, script, pubkey] of [
        [buildClaimTransaction(claim), claim.swapAddress.hashlockScript, BUYER_PUBKEY],
        [buildRefundTransaction(refund), refund.swapAddress.timelockScript, SELLER_PUBKEY],
      ] as const) {
        const tx = decodeTx(result.txHex);
        const signature = tx.getInput(0).finalScriptWitness![0];
        const digest = tx.preimageWitnessV1(0, [claim.swapAddress.outputScript], 0,
          [FUNDING_AMOUNT], undefined, script, 0xc0);
        expect(schnorr.verify(signature, digest, pubkey.slice(1))).toBe(true);
        const tampered = Uint8Array.from(digest);
        tampered[0] ^= 1;
        expect(schnorr.verify(signature, tampered, pubkey.slice(1))).toBe(false);
        expect(tx.getOutput(0).amount).toBe(FUNDING_AMOUNT - result.fee);
      }
    });
  }
  it('rejects a wrong preimage before constructing a claim', () => {
    expect(() => buildClaimTransaction({ ...claimFixture(), preimage: new Uint8Array(32) }))
      .toThrow('Preimage does not match');
  });
  it('preserves witness order, refund locktime, and enabled sequence', () => {
    const claim = decodeTx(buildClaimTransaction(claimFixture()).txHex);
    const refund = decodeTx(buildRefundTransaction(refundFixture()).txHex);
    expect(claim.getInput(0).finalScriptWitness!.map(x => x.length)).toEqual([64, 32, 69, 65]);
    expect(toHex(claim.getInput(0).finalScriptWitness![1])).toBe(toHex(PREIMAGE));
    expect(refund.getInput(0).finalScriptWitness!.map(x => x.length)).toEqual([64, 40, 65]);
    expect(refund.lockTime).toBe(TIMELOCK);
    expect(refund.getInput(0).sequence).toBe(0xfffffffe);
  });
  it('runs both hex convenience wrappers in ESM', () => {
    const common = { fundingTxid: FUNDING_TXID, fundingVout: 0, fundingAmountSats: 10000,
      feeRateSatsPerVbyte: 2, paymentHashHex: toHex(PAYMENT_HASH),
      buyerPubkeyHex: toHex(BUYER_PUBKEY), sellerPubkeyHex: toHex(SELLER_PUBKEY),
      refundLocktime: TIMELOCK, network: 'testnet' as const };
    const claim = buildClaimTransactionFromHex({ ...common, preimageHex: toHex(PREIMAGE),
      buyerPrivkeyHex: toHex(BUYER_KEY), destinationAddress: BUYER_ADDRESS });
    const refund = buildRefundTransactionFromHex({ ...common,
      sellerPrivkeyHex: toHex(SELLER_KEY), destinationAddress: SELLER_ADDRESS });
    expect(claim.txid).toBe(buildClaimTransaction(claimFixture()).txid);
    expect(refund.txid).toBe(buildRefundTransaction(refundFixture()).txid);
  });
});
