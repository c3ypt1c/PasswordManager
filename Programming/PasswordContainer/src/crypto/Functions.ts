const isDebug = true;

function log(text : any) {
  if(isDebug) console.log(text);
}

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

function hashPBKDF2(iterations: number, salt: any, keySize: number, password: string) {
  //https://www.geeksforgeeks.org/node-js-crypto-pbkdf2-method/
  return Crypto.pbkdf2Sync(password, salt, iterations, keySize, "sha512") as Uint8Array;
}

const aesjs = require('aes-js');

function encryptAES(key : Uint8Array, iv : Uint8Array, data : Uint8Array | string) {
  let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  console.log("Data is: ");
  console.log(data);
  if(data.length == 0) throw "Data is empty...";
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
  return bf.decode(encryptedData, type) as Uint8Array;
}

function generateSalt(length : number) : Uint8Array {
  return Crypto.randomBytes(length) as Uint8Array;
}

async function getKeyHash(keyDerivationFunction : "Argon2" | "PBKDF2", rounds: number, salt: Uint8Array, keyByteSize: number, password: string, roundsMemory : number | null) {
  let key : Uint8Array;
  switch(keyDerivationFunction) {
    case "Argon2":
      if(roundsMemory == null) throw "Argon2 NEEDS 'roundsMemory'. roundsMemory is null";
      key = await hashArgon2(roundsMemory, rounds, salt, keyByteSize, password);
      break;

    case "PBKDF2":
      key = hashPBKDF2(rounds, salt, keyByteSize, password);
      break;

    default:
      throw keyDerivationFunction + " is not a supported derivation function";
  }
  return key;
}

function convertFromUint8Array(array : Uint8Array) {
  let arr = [];
  for(let item = 0; item < array.length; item++) arr.push(array[item]);
  return arr;
}

function compareArrays(array1 : any, array2 : any) {
  if(array1.length != array2.length) return false;

  for(let i = 0; i < array1.length; i++) {
    if(array1[i] != array2[i]) return false;
  }

  return true;
}

function encrypt(encryptionType : "AES" | "Blow", key: Uint8Array, iv: Uint8Array, data: Uint8Array | string): Uint8Array {
  let encryptedData : Uint8Array;
  switch (encryptionType) {
    case "AES":
      encryptedData = encryptAES(key, iv, data);
      break;

    case "Blow":
      encryptedData = encryptBlowfish(key, iv, data);
      break;

    default:
      throw encryptionType + " is not a supported encryption type";
  }

  return encryptedData;
}

function decrypt(encryptionType : "AES" | "Blow", key: Uint8Array, iv: Uint8Array, encryptedData: Uint8Array): Uint8Array {
  let decryptedData : Uint8Array;
  switch (encryptionType) {
    case "AES":
      decryptedData = decryptAES(key, iv, encryptedData);
      break;

    case "Blow":
      decryptedData = decryptBlowfish(key, iv, encryptedData);
      break;

    default:
      throw encryptionType + " is not a supported encryption type";
  }

  return decryptedData;
}

function hash(data : Uint8Array) {
  let hashElement = Crypto.createHash("sha512", data);
  hashElement.update(data);
  return Uint8Array.from(hashElement.digest());
}

export {
  convertFromUint8Array, compareArrays,
  generateSalt, getKeyHash, hash,
  hashArgon2, hashPBKDF2,
  encryptAES, decryptAES,
  encryptBlowfish, decryptBlowfish,
  encrypt, decrypt,
  log,
};
