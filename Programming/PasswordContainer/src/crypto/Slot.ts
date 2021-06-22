import {randomCharacterGenerator} from "./Functions.js";
const Crypto = require("crypto");
const CryptoJS = require("crypto-js");
//const CryptoTS = require("crypto-ts"); //TODO: CryptoTS currently breaks, please fix
const Argon2 = require("argon2");

// Settings
let defaultSaltSize = 16;

class Slot {
  locked = true;
  masterKey : any;
  keyDerivationFunction : string;
  encryptionType : string;
  rounds : number;
  roundsMemory : number | null; // Can be null since not all algorithms can scale with memory
  salt : string;
  encryptedMasterKey : any;

  constructor(data : any) {
    this.keyDerivationFunction = data["derivation"];
    this.encryptionType = data["enc"];
    this.rounds = data["enc_rounds"];
    this.roundsMemory = data["enc_memory"];
    this.encryptedMasterKey = data["masterKey"];
    this.salt = data["salt"];
  }

  lock() {
    this.locked = true;
    this.masterKey = undefined;
  }

  unlock(password : any) {

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
    }
    return JSON.stringify(data);
  }
}

  /**
  Serp = Serpant
  Blow = Blowfish
  */
async function MakeNewSlot(
  encryptionType : "Serp" | "AES" | "Blow", rounds : number, roundsMemory : number | null, keyDerivationFunction : "Argon2" | "PBUDF2", masterKey : any, password : string) {
  // Make a salt
  let salt = randomCharacterGenerator(defaultSaltSize);

  //let keyByteSize = encryptionType != "Blow" ? 32 : 56;
  //let masterKey = Crypto.randomBytes(keyByteSize);

  // Derive key
  let key;
  switch(keyDerivationFunction) {
    case "Argon2":
      //TODO: Derive Argon2
      break;

    case "PBUDF2":
      // TODO: derive PBUDF2
      break;

    default:
      throw keyDerivationFunction + " is not a supported derivation function";
  }

  let encryptedMasterKey;

  // Encrypt masterKey
  switch (encryptionType) {
    case "AES":
      // TODO: Encrypt with AES
      break;

    case "Blow":
      // TODO: Encrypt with Blowfish
      break;

    case "Serp":
      // TODO: Encrypt with Serpant
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
    "salt": salt
  };

  let slot = new Slot(slotData);
  slot.unlock(password); //unlock slot for convenience
  return slot;
}


export {Slot, MakeNewSlot};
