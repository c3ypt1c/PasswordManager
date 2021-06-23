// Settings

class Slot {
  locked = true;
  masterKey : any;
  keyDerivationFunction : string;
  encryptionType : string;
  rounds : number;
  roundsMemory : number | null; // Can be null since not all algorithms can scale with memory
  salt : string;
  encryptedMasterKey : any;
  iv : any;

  constructor(data : any) {
    this.keyDerivationFunction = data["derivation"];
    this.encryptionType = data["enc"];
    this.rounds = data["enc_rounds"];
    this.roundsMemory = data["enc_memory"];
    this.encryptedMasterKey = data["masterKey"];
    this.salt = data["salt"];
    this.iv = data["iv"];
  }

  lock() {
    this.locked = true;
    this.masterKey = undefined;
  }

  unlock(password : string) {

  }

  getMasterKey() {
    if(this.locked) throw "Slot is locked.";
    else return this.masterKey;
  }

  getJSON() {
    let data = {
      "derivation" : this.keyDerivationFunction,
      "enc" : this.encryptionType,
      "enc_rounds" : this.rounds,
      "enc_memory" : this.roundsMemory,
      "masterKey" : this.encryptedMasterKey,
      "salt" : this.salt,
      "iv": this.iv,
    }
    return JSON.stringify(data);
  }
}

import {generateSalt, compareArrays} from "./../crypto/Functions.js"; //useful functions
import {hashArgon2, hashPBKDF2} from "./../crypto/Functions.js"; //useful hashes
import {encryptAES, decryptAES} from "./../crypto/Functions.js"; //aes
import {encryptBlowfish, decryptBlowfish} from "./../crypto/Functions.js"; //blowfish

/**
Serp = Serpant
Blow = Blowfish
*/
async function MakeNewSlot(
  encryptionType : "AES" | "Blow", rounds : number, keyDerivationFunction : "Argon2" | "PBKDF2", masterKey : any, password : string, roundsMemory : number | null) {
  // Make a salt
  let keyByteSize = encryptionType != "Blow" ? 32 : 56;
  let salt = generateSalt(keyByteSize);

  // Derive key
  let key;
  switch(keyDerivationFunction) {
    case "Argon2":
      if(roundsMemory == null) throw "Argon2 NEEDS 'roundsMemory'. roundsMemory is null";
      key = await hashArgon2(roundsMemory, rounds, salt, keyByteSize, password);
      break;

    case "PBKDF2":
      key = await hashPBKDF2(rounds, salt, keyByteSize, password);
      break;

    default:
      throw keyDerivationFunction + " is not a supported derivation function";
  }

  // Encrypt masterKey
  let encryptedMasterKey;
  let iv;
  switch (encryptionType) {
    case "AES":
      iv = generateSalt(16);
      encryptedMasterKey = encryptAES(key, iv, masterKey);

      //check it works
      if(!compareArrays(masterKey, decryptAES(key, iv, encryptedMasterKey))) throw "Decryption mismatch!";
      console.log("Decryption match. Good.");
      break;

    case "Blow":
      iv = generateSalt(8);
      encryptedMasterKey = encryptBlowfish(key, iv, masterKey);

      //Check it works
      if(!compareArrays(masterKey, decryptBlowfish(key, iv, encryptedMasterKey))) throw "Decryption mismatch!";
      console.log("Decryption match. Good.");
      break;

    default:
      throw encryptionType + " is not a supported encryption type";
  }

  let slotData = {
    "derivation": keyDerivationFunction,
    "enc": encryptionType,
    "enc_rounds": rounds,
    "enc_memory": roundsMemory,
    "masterKey": encryptedMasterKey,
    "salt": salt,
    "iv": iv,
  };

  let slot = new Slot(slotData);
  slot.unlock(password); //unlock slot for convenience
  return slot;
}


export {Slot, MakeNewSlot};
