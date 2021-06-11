const crypto = require("crypto");
var aesjs = require('aes-js');

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

// For AES
let iterations = 10_000;
let dataLength = 1024 * 300 //300 KB => Typical data size after 5 years of usage.

// For pbkdf2
let predefinedSalt = random(20);
let testRounds = 100_100; // LastPass back end => https://assets.cdngetgo.com/1d/ee/d051d8f743b08f83ee8f3449c15d/lastpass-technical-whitepaper.pdf
let keylen = 32; // 256 bits for AES, for example
let digest = "sha512"; // could be any digest

// An example 128-bit key (16 bytes * 8 bits/byte = 128 bits)
var key = crypto.pbkdf2Sync( random(20), predefinedSalt, iterations, keylen, digest);

for (; iterations >= 0; iterations--) {
  // The initialization vector (must be 16 bytes)
  let iv = Buffer.alloc(16); // Fill out the initialization vector
  crypto.randomFillSync(iv);

  // Convert text to bytes (text must be a multiple of 16 bytes)
  var text = random(dataLength);
  var textBytes = aesjs.utils.utf8.toBytes(text);

  var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  var encryptedBytes = aesCbc.encrypt(textBytes);

  // To print or store the binary data, you may convert it to hex
  var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

  // When ready to decrypt the hex string, convert it back to bytes
  var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

  // The cipher-block chaining mode of operation maintains internal
  // state, so to decrypt a new instance must be instantiated.
  var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  var decryptedBytes = aesCbc.decrypt(encryptedBytes);

  // Convert our bytes back into text
  var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
}
