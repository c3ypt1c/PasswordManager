const crypto = require("crypto");

// random character generator
const random = (length) => {
    // Declare all characters
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Pick characers randomly
    let str = "";
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
};

let predefinedSalt = random(20);
let testRounds = 100_100; // LastPass back end => https://assets.cdngetgo.com/1d/ee/d051d8f743b08f83ee8f3449c15d/lastpass-technical-whitepaper.pdf
let iterations = 10_000; // Iterations
let keylen = 16; // 256 bits for AES, for example
let digest = "sha512"; // could be any digest

for(; testRounds >= 0; testRounds--) {
  // Derive a key
  let returnedKey = crypto.pbkdf2Sync( random(20), predefinedSalt, iterations, keylen, digest);
  //console.log(returnedKey.toString('hex'));
}
