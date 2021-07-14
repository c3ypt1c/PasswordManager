// Test encryption
import { generateSalt, getKeyHash } from "./../crypto/CryptoFunctions.js";

const assert = require("assert");

function randomCharacters(length : number) { // from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

// test getKeyHash
async function test_getKeyHash_Argon2_0() {
  let password = randomCharacters(32);
  let randomSalt = generateSalt(16);
  let testHash1 = await getKeyHash("Argon2", 100, randomSalt, 32, password, 100);
  let testHash2 = await getKeyHash("Argon2", 100, randomSalt, 32, password, 100);

  assert.equal(testHash1, testHash2);
}

async function test_getKeyHash_Argon2_1() {
  let password = "randomCharacters(32)";
  let randomSalt = generateSalt(16);
  let testHash1 = await getKeyHash("Argon2", 100, randomSalt, 32, password, 100);
  let testHash2 = await getKeyHash("Argon2", 100, randomSalt, 32, password, 100);
}
