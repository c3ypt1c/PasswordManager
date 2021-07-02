const { split, join } = require("shamir");
const { randomBytes } = require('crypto');
import {log, generateSalt, compareArrays} from "./../crypto/Functions.js";

export class Shamir {
  constructor() {
    // conduct test
    let secret = generateSalt(80);
    log("testing shamir");
    log(secret);

    let shamir = this.generateScheme(secret, 5, 3);
    log(shamir);
    delete shamir["1"];
    delete shamir["2"];
    log(shamir);

    let recovered = this.recoverSecret(shamir);
    log(recovered);

    if(compareArrays(secret, recovered)) log("test complete");
    else log("test failed");
  }

  generateScheme(secret: Uint8Array, parts: number, threshold: number) {
    return split(randomBytes, parts, threshold, secret);
  }

  recoverSecret(data: any) {
    return join(data);
  }

}
