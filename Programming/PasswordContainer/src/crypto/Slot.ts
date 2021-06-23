// Settings

class Slot {
  locked = true;
  masterKey : any;
  keyDerivationFunction : "Argon2" | "PBKDF2";
  encryptionType : "AES" | "Blow";
  rounds : number;
  roundsMemory : number | null; // Can be null since not all algorithms can scale with memory
  salt : Uint8Array;
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
    let keyByteSize = this.encryptionType != "Blow" ? 32 : 56;
    let key = getKeyHash(this.keyDerivationFunction, this.rounds, this.salt, keyByteSize, password, this.roundsMemory);
    
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

import {generateSalt, compareArrays, getKeyHash} from "./../crypto/Functions.js"; //useful functions
import {encryptAES, decryptAES} from "./../crypto/Functions.js"; //aes
import {encryptBlowfish, decryptBlowfish} from "./../crypto/Functions.js"; //blowfish

/**
Serp = Serpant
Blow = Blowfish
*/
async function MakeNewSlot(
  encryptionType : "AES" | "Blow", rounds : number, keyDerivationFunction : "Argon2" | "PBKDF2", masterKey : Uint8Array, password : string, roundsMemory : number | null) {
  // Make a salt
  let keyByteSize = encryptionType != "Blow" ? 32 : 56;
  let salt = generateSalt(keyByteSize);

  // Derive key
  let key = await getKeyHash(keyDerivationFunction, rounds, salt, keyByteSize, password, roundsMemory);

  // Encrypt masterKey
  let encryptedMasterKey : Uint8Array;
  let iv : Uint8Array;
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

  // check slot masterKey
  slot.unlock(password); //unlock slot for convenience
  if(!compareArrays(masterKey, slot.getMasterKey())) throw "Slot decryption mismatch!";
  console.log("Decryption for slot: match. Good.");
  slot.lock();

  return slot;
}


export {Slot, MakeNewSlot};
