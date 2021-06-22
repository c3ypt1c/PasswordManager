const Argon2 = require("argon2");

async function hashArgon2(memory: number, iterations: number, salt: any, keySize: number, password: string) {
  let optionals = {
    type: Argon2.argon2id,
    memoryCost: memory,
    timeCost: iterations,
    salt: salt,
    hashLength: keySize,
    raw: true,
    }

  return await Argon2.hash(password, optionals) as Uint8Array;
}

const Crypto = require("crypto");

async function hashPBKDF2(iterations: number, salt: any, keySize: number, password: string) {
  //https://www.geeksforgeeks.org/node-js-crypto-pbkdf2-method/
  return Crypto.pbkdf2Sync(password, salt, iterations, keySize, "sha512") as Uint8Array;
}

function generateSalt(length : number) {
  return Crypto.randomBytes(length);
}

const aesjs = require('aes-js');

function encryptAES(key : Uint8Array, iv : Uint8Array, data : string) {
  let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  return aesCbc.encrypt(data);
}

function decryptAES(key: Uint8Array, iv : Uint8Array, encryptedData : any) {
  let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  return aesCbc.decrypt(encryptedData);
}

const Blowfish = require('egoroof-blowfish');

function encryptBlowfish(key: Uint8Array, iv: Uint8Array, data: Uint8Array | string) {
  let bf = new Blowfish(key, Blowfish.MODE.CBC);
  bf.setIv(iv);
  return bf.encode(data) as Uint8Array;
}

function decryptBlowfish(key: Uint8Array, iv: Uint8Array, encryptedData: Uint8Array, getUint8Array=true) {
  let bf = new Blowfish(key, Blowfish.MODE.CBC);
  bf.setIv(iv);
  let type = getUint8Array ? Blowfish.TYPE.UINT8_ARRAY : Blowfish.TYPE.STRING;
  return bf.decode(encryptedData, type) as (Uint8Array | string);
}

function compareArrays(array1 : any, array2 : any) {
  if(array1.length != array2.length) return false;

  for(let i = 0; i < array1.length; i++) {
    if(array1[i] != array2[i]) return false;
  }

  return true;
}

export {generateSalt, compareArrays,
  hashArgon2, hashPBKDF2,
  encryptAES, decryptAES,
  encryptBlowfish, decryptBlowfish};
