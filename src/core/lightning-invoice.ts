/**
 * Sparkle Protocol - Lightning Invoice Module
 *
 * Creates and verifies Lightning invoices for atomic swaps.
 * The payment_hash in the invoice MUST match the hashlock in the Taproot script.
 *
 * Flow:
 * 1. Seller generates preimage (keeps secret)
 * 2. Seller creates swap address using SHA256(preimage)
 * 3. Seller creates Lightning invoice with same payment_hash
 * 4. Buyer verifies invoice payment_hash matches swap address
 * 5. Buyer pays invoice → preimage revealed → buyer claims Ordinal
 *
 * @module sparkle-protocol/core/lightning-invoice
 * @version 0.2.0
 */

import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils';
import { bech32 } from '@scure/base';

/**
 * Generate a cryptographically secure preimage for the atomic swap
 *
 * @returns 32-byte random preimage
 */
export function generatePreimage(): Uint8Array {
  return randomBytes(32);
}

/**
 * Compute payment hash from preimage
 *
 * @param preimage - 32-byte preimage
 * @returns 32-byte SHA256 hash (payment_hash)
 */
export function computePaymentHash(preimage: Uint8Array): Uint8Array {
  if (preimage.length !== 32) {
    throw new Error('Preimage must be 32 bytes');
  }
  return sha256(preimage);
}

/**
 * Verify that a preimage matches a payment hash
 *
 * @param preimage - The preimage to verify
 * @param paymentHash - The expected payment hash
 * @returns true if SHA256(preimage) === paymentHash
 */
export function verifyPreimage(preimage: Uint8Array, paymentHash: Uint8Array): boolean {
  const computed = sha256(preimage);
  if (computed.length !== paymentHash.length) return false;
  for (let i = 0; i < computed.length; i++) {
    if (computed[i] !== paymentHash[i]) return false;
  }
  return true;
}

/**
 * BOLT11 Invoice data structure
 */
export interface Bolt11Invoice {
  /** Human-readable part (network prefix) */
  hrp: string;
  /** Payment hash (32 bytes) */
  paymentHash: Uint8Array;
  /** Amount in millisatoshis (if specified) */
  amountMsat?: bigint;
  /** Amount in satoshis (if specified) */
  amountSat?: bigint;
  /** Invoice expiry timestamp */
  expiry?: number;
  /** Description or description hash */
  description?: string;
  /** Raw BOLT11 string */
  raw: string;
  /** Network (mainnet, testnet, regtest) */
  network: 'mainnet' | 'testnet' | 'regtest';
}

/**
 * Decode a BOLT11 invoice to extract payment_hash
 *
 * This is a minimal decoder focused on extracting the payment_hash
 * for verification purposes. For full BOLT11 parsing, use a
 * dedicated library like bolt11 or lightningpay.
 *
 * @param invoice - BOLT11 invoice string (lnbc... or lntb...)
 * @returns Decoded invoice data
 */
export function decodeBolt11(invoice: string): Bolt11Invoice {
  const lowerInvoice = invoice.toLowerCase();

  // Determine network from prefix
  let network: 'mainnet' | 'testnet' | 'regtest';
  if (lowerInvoice.startsWith('lnbcrt')) {
    network = 'regtest';
  } else if (lowerInvoice.startsWith('lnbc')) {
    network = 'mainnet';
  } else if (lowerInvoice.startsWith('lntb')) {
    network = 'testnet';
  } else {
    throw new Error('Invalid BOLT11 invoice prefix');
  }

  // Decode bech32
  let decoded;
  try {
    decoded = bech32.decode(lowerInvoice as `${string}1${string}`, 2000);
  } catch (e) {
    throw new Error('Invalid BOLT11 bech32 encoding');
  }

  const hrp = decoded.prefix;

  // Parse amount from HRP if present
  let amountMsat: bigint | undefined;
  const amountMatch = hrp.match(/ln[a-z]*(\d+)([munp])?/);
  if (amountMatch && amountMatch[1]) {
    const value = BigInt(amountMatch[1]);
    const multiplier = amountMatch[2];
    switch (multiplier) {
      case 'm': amountMsat = value * 100000000n; break; // milli-bitcoin
      case 'u': amountMsat = value * 100000n; break;    // micro-bitcoin
      case 'n': amountMsat = value * 100n; break;       // nano-bitcoin
      case 'p': amountMsat = value / 10n; break;        // pico-bitcoin
      default: amountMsat = value * 100000000000n;      // whole bitcoin
    }
  }

  // BOLT11 is a stream of 5-bit words. Converting the entire payload to
  // bytes rejects valid invoices with non-byte-aligned timestamp/tag data.
  // Decode only the payment-hash field (the npm 1.0.1 correction).
  let paymentHash: Uint8Array | undefined;

  let pos = 7; // Skip timestamp (7 5-bit chars)
  const words = decoded.words;

  while (pos < words.length - 104) {
    // 104 = signature (104 5-bit chars)
    const type = words[pos];
    const dataLen = (words[pos + 1] << 5) | words[pos + 2];
    pos += 3;

    if (type === 1 && dataLen === 52) {
      // Payment hash tag (type 1), 52 5-bit chars = 260 bits
      const hashWords = words.slice(pos, pos + 52);
      const hashBytes = bech32.fromWords(hashWords);
      paymentHash = new Uint8Array(hashBytes.slice(0, 32));
      break;
    }

    pos += dataLen;
  }

  if (!paymentHash) {
    throw new Error('Could not extract payment_hash from invoice');
  }

  return {
    hrp,
    paymentHash,
    amountMsat,
    amountSat: amountMsat ? amountMsat / 1000n : undefined,
    network,
    raw: invoice,
  };
}

/**
 * Verify that a Lightning invoice matches a swap address
 *
 * This ensures the payment_hash in the invoice is the same as
 * the hashlock in the Taproot script, guaranteeing atomicity.
 *
 * @param invoice - BOLT11 invoice string
 * @param swapPaymentHash - Payment hash used in the swap address
 * @returns true if invoice payment_hash matches swap payment_hash
 */
export function verifyInvoiceMatchesSwap(
  invoice: string,
  swapPaymentHash: Uint8Array
): boolean {
  const decoded = decodeBolt11(invoice);
  return verifyPreimage(decoded.paymentHash, swapPaymentHash) === false &&
    bytesToHex(decoded.paymentHash) === bytesToHex(swapPaymentHash);
}

/**
 * Parameters for creating an invoice request
 */
export interface CreateInvoiceParams {
  /** Payment hash (32 bytes) - MUST match swap address hashlock */
  paymentHash: Uint8Array;
  /** Amount in satoshis */
  amountSats: bigint;
  /** Invoice description */
  description: string;
  /** Expiry in seconds (default: 3600 = 1 hour) */
  expirySecs?: number;
  /** Network */
  network?: 'mainnet' | 'testnet' | 'regtest';
}

/**
 * Invoice creation result
 */
export interface InvoiceResult {
  /** BOLT11 invoice string */
  bolt11: string;
  /** Payment hash (hex) */
  paymentHashHex: string;
  /** Amount in satoshis */
  amountSats: bigint;
  /** Expiry timestamp */
  expiresAt: number;
}

/**
 * LND REST API invoice creation
 *
 * Creates an invoice using LND's REST API with a specific payment_hash.
 * This requires the invoice macaroon and TLS cert.
 *
 * @param params - Invoice parameters
 * @param lndConfig - LND connection configuration
 * @returns Created invoice
 */
export async function createInvoiceLND(
  params: CreateInvoiceParams,
  lndConfig: {
    host: string;
    port: number;
    macaroonHex: string;
    tlsCertPath?: string;
  }
): Promise<InvoiceResult> {
  const url = `https://${lndConfig.host}:${lndConfig.port}/v1/invoices`;

  const body = {
    hash: bytesToHex(params.paymentHash),
    value: params.amountSats.toString(),
    memo: params.description,
    expiry: (params.expirySecs || 3600).toString(),
  };

  // Note: In Node.js, you'd use the actual fetch with TLS cert
  // This is a reference implementation showing the API structure
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Grpc-Metadata-macaroon': lndConfig.macaroonHex,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LND invoice creation failed: ${error}`);
  }

  const result = await response.json() as { payment_request: string };

  return {
    bolt11: result.payment_request,
    paymentHashHex: bytesToHex(params.paymentHash),
    amountSats: params.amountSats,
    expiresAt: Date.now() + (params.expirySecs || 3600) * 1000,
  };
}

/**
 * Complete swap setup data
 *
 * Contains all information needed for both parties to execute the swap
 */
export interface SwapSetup {
  /** The preimage (seller keeps secret until claim) */
  preimage: Uint8Array;
  /** SHA256(preimage) - used in both Taproot script and Lightning invoice */
  paymentHash: Uint8Array;
  /** Hex representations for easy transport */
  preimageHex: string;
  paymentHashHex: string;
}

/**
 * Generate a complete swap setup
 *
 * Creates the cryptographic material needed to initiate an atomic swap.
 * The seller generates this, keeps preimage secret, shares paymentHash.
 *
 * @returns Swap setup with preimage and payment hash
 */
export function generateSwapSetup(): SwapSetup {
  const preimage = generatePreimage();
  const paymentHash = computePaymentHash(preimage);

  return {
    preimage,
    paymentHash,
    preimageHex: bytesToHex(preimage),
    paymentHashHex: bytesToHex(paymentHash),
  };
}

/**
 * Extract preimage from a settled Lightning payment
 *
 * When a Lightning invoice is paid, the preimage is revealed.
 * This function validates and extracts it.
 *
 * @param preimageHex - Preimage from Lightning payment (hex)
 * @param expectedPaymentHash - Expected payment hash
 * @returns Validated preimage as Uint8Array
 */
export function extractAndVerifyPreimage(
  preimageHex: string,
  expectedPaymentHash: Uint8Array
): Uint8Array {
  const preimage = hexToBytes(preimageHex);

  if (preimage.length !== 32) {
    throw new Error('Invalid preimage length');
  }

  if (!verifyPreimage(preimage, expectedPaymentHash)) {
    throw new Error('Preimage does not match expected payment hash');
  }

  return preimage;
}

// Re-export utilities
export { bytesToHex as toHex, hexToBytes as fromHex };
