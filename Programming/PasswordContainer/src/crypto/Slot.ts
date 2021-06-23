import {generateSalt, compareArrays, getKeyHash, encrypt, decrypt} from "./../crypto/Functions.js"; //useful functions

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

  unlock(password : string, successFunction : Function, errorFunction ?: Function) {
    let keyByteSize = this.encryptionType != "Blow" ? 32 : 56;
    getKeyHash(this.keyDerivationFunction, this.rounds, this.salt, keyByteSize, password, this.roundsMemory).then((key) => {
      this.masterKey = decrypt(this.encryptionType, key, this.iv, this.encryptedMasterKey);
      this.locked = false;
      successFunction(this.masterKey);
    }, (errorReason) => {
      if(errorFunction) errorFunction(errorReason);
    });
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

  // make iv
  let ivSize = encryptionType != "Blow" ? 16 : 8;
  let iv = generateSalt(ivSize);

  // encrypt master key
  let encryptedMasterKey = encrypt(encryptionType, key, iv, masterKey);

  //check
  if(!compareArrays(masterKey, decrypt(encryptionType, key, iv, encryptedMasterKey))) {
    console.log(masterKey);
    console.log(decrypt(encryptionType, key, iv, encryptedMasterKey));
    throw "Decryption mismatch!";
  } else console.log("Decryption works. Good.")

  // make slot data
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
  slot.unlock(password, (decryptedKey : Uint8Array) => {
    if(!compareArrays(masterKey, decryptedKey)) {
      console.log(masterKey);
      console.log(decryptedKey);
      throw "Slot decryption mismatch!";
    }
    console.log("Decryption for slot: match. Splendid.");
    slot.lock();
  }); //unlock slot for convenience
  return slot;
}


export {Slot, MakeNewSlot};
