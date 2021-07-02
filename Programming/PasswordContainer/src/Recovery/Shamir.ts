import { log, generateSalt, compareArrays} from "./../crypto/Functions.js";
import {BIP as _BIP} from "./../Recovery/BIP.js";
const { split, join } = require("shamir");
const { randomBytes } = require('crypto');


export class ShamirChunk {
  part: number;
  threshold: number;
  data: Uint8Array;
  constructor(data : Uint8Array, part : number, threshold: number) {
    this.data = data;
    this.part = part;
    this.threshold = threshold;
  }

  makeBIP(BIP : _BIP) {
    return BIP.generateFromUint8Array(this.data);
  }
}

export class Shamir {
  constructor() {
    // conduct test
    let secret = generateSalt(80);
    log("testing shamir");
    log(secret);

    let shamir = generateScheme(secret, 5, 2);
    log(shamir);
    delete shamir["1"];
    delete shamir["2"];
    log(shamir);

    let recovered = recoverSecret(shamir);
    log(recovered);

    if(compareArrays(secret, recovered)) log("test complete");
    else log("test failed");

    log("testing shamir BIPs");
    log(secret);
    let chunks = generateBIPs(secret, 10, 8);
    log(chunks);
    chunks.splice(3, 2); //delete index 3 and 4
    log(chunks);

    let recovered2 = recoverFromBIPs(chunks);
    log(recovered2);

    if(!compareArrays(recovered2, secret)) log("recovery failed");
    else log("recovery success!");
  }
}

export function generateScheme(secret: Uint8Array, parts: number, threshold: number) {
  if(threshold > parts) throw "Scheme will be unrecoverable";
  return split(randomBytes, parts, threshold, secret);
}

export function recoverSecret(data: any) {
  return join(data);
}

export function generateBIPs(secret: Uint8Array, parts: number, threshold: number) {
  let shared = generateScheme(secret, parts, threshold);
  log(shared);
  let chunks = [];
  log("logging loop")
  for(let i = 1; i <= parts; i++) {
    log(i);
    chunks.push(new ShamirChunk(shared[i.toString()], i, parts));
  }

  return chunks;
}

export function recoverFromBIPs(chunks : ShamirChunk[]) {
  let shared = {} as any;
  for(let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i];
    shared[chunk.part.toString()] = chunk.data;
  }

  log(shared);

  return recoverSecret(shared);
}

