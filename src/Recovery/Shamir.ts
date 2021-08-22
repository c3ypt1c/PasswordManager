/**
 * @todo refactor with Types
 */
import { log } from "./../Functions.js";
import { BIP as _BIP } from "./../Recovery/BIP.js";
const { split, join } = require("shamir");
const { randomBytes } = require('crypto');

/**
 * Generate the shamir scheme using 'shamir'.
 * - {@link https://www.npmjs.com/package/shamir npm}.
 * - {@link https://github.com/simbo1905/shamir GitHub}. 
 * - {@link https://codyplanteen.com/assets/rs/gf256_prim.pdf GF}.
 * @param secret the secret you want to share
 * @param parts the number of parts you want the scheme to generate
 * @param threshold the number of parts needed to recover the secret
 * @returns Recovery pieces as an Object array of Uint8Arrays, __starting the count at 1__.
 */
export function generateScheme(secret: Uint8Array, parts: number, threshold: number) {
  if (threshold > parts) throw "Scheme will be unrecoverable";
  return split(randomBytes, parts, threshold, secret);
}

/**
 * reverses the operation done by {@link generateScheme}.
 * @param data 
 * @returns UInt8Array of secret
 */
export function recoverSecret(data: any) {
  return join(data);
}

/**
 * Generate sharmir chunks from secret
 * @param secret secret
 * @param parts number of parts
 * @param threshold threshhold
 * @returns shamir chunks
 */
export function generateBIPs(secret: Uint8Array, parts: number, threshold: number) {
  let shared = generateScheme(secret, parts, threshold);
  log(shared);
  let chunks = [];
  log("logging loop")
  for (let i = 1; i <= parts; i++) {
    log(i);
    chunks.push(new ShamirChunk(shared[i.toString()], i, parts));
  }

  return chunks;
}

/**
 * Use the sharmir chunks to recover the secret
 * @param chunks sharmir chunks
 * @returns secret
 */
export function recoverFromBIPs(chunks: ShamirChunk[]) {
  let shared = {} as any;
  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i];
    shared[chunk.part.toString()] = chunk.data;
  }

  log(shared);

  return recoverSecret(shared);
}

/**
 * This class is an abstraction of a piece of information in the Shamir Scheme. 
 * It contains the part number, the threshold and the data.
 */
export class ShamirChunk {
  part: number;
  threshold?: number;
  data: Uint8Array;
  constructor(data: Uint8Array, part: number, threshold?: number) {
    this.data = data;
    this.part = part;
    this.threshold = threshold;
  }

  /**
   * Returns a Word representation of the piece of information
   * @param BIP the bip object
   * @returns Word representation of the info.
   */
  makeBIP(BIP: _BIP) {
    return BIP.generateFromUint8Array(this.data);
  }
}

