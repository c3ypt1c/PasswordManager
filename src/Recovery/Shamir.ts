/**
 * @todo refactor with Types
 */
import { log, compareArrays } from "./../Functions.js";
import { getRandomBytes } from "../Crypto/CryptoFunctions.js";
import { BIP as _BIP } from "./../Recovery/BIP.js";
const { split, join } = require("shamir");
const { randomBytes } = require('crypto');

/**
 * This object simply tests the Shamir scheme. 
 * @todo move to Tests.
 */
export class Shamir {
  constructor() {
    // conduct test
    let secret = getRandomBytes(80);
    log("testing shamir");
    log(secret);

    let shamir = generateScheme(secret, 5, 2);
    log(shamir);
    delete shamir["1"];
    delete shamir["2"];
    log(shamir);

    let recovered = recoverSecret(shamir);
    log(recovered);

    if (compareArrays(secret, recovered)) log("test complete");
    else log("test failed");

    log("testing shamir BIPs");
    log(secret);
    let chunks = generateBIPs(secret, 10, 8);
    log(chunks);
    chunks.splice(3, 2); //delete index 3 and 4
    log(chunks);

    let recovered2 = recoverFromBIPs(chunks);
    log(recovered2);

    if (!compareArrays(recovered2, secret)) log("recovery failed");
    else log("recovery success!");
  }
}

/**
 * Generate the shamir scheme using 'shamir'.
 * - {@link https://www.npmjs.com/package/shamir npm}.
 * - {@link https://github.com/simbo1905/shamir GitHub}. 
 * - {@link https://codyplanteen.com/assets/rs/gf256_prim.pdf GF}.
 * @param secret the secret you want to share
 * @param parts the number of parts you want the scheme to generate
 * @param threshold the number of parts needed to recover the secret
 * @returns 
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

