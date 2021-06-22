// random character generator
const randomCharacterGenerator = (length : number) => {
    // Declare all characters
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Pick characers randomly
    let str = "";
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
};

const Argon2 = require("argon2");

async function hashArgon2(memory: number, iterations: number, salt: any, keySize: number, password: string) {
  let optionals = {
    type: Argon2.argon2id,
    memoryCost: memory,
    timeCost: iterations,
    salt: salt,
    hashLength: keySize,
  }

  return await Argon2.hash(password, optionals);
}

const Crypto = require("crypto");

async function hashPBKDF2(iterations: number, salt: any, keySize: number, password: string) {
  //https://www.geeksforgeeks.org/node-js-crypto-pbkdf2-method/
  return Crypto.pbkdf2Sync(password, salt, iterations, keySize, "sha512");
}


function encrypt(data : any, kdf : Function ) {

}

export {randomCharacterGenerator, hashArgon2, hashPBKDF2};
