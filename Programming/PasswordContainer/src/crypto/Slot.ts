import {generateSalt, compareArrays, convertFromUint8Array, getKeyHash, hash, encrypt, decrypt} from "./../crypto/Functions.js"; //useful functions

class Slot implements iJSON {
  locked = true;
  masterKey : any;
  keyDerivationFunction : "Argon2" | "PBKDF2";
  encryptionType : "AES" | "Blow";
  rounds : number;
  roundsMemory : number | null; // Can be null since not all algorithms can scale with memory
  salt : Uint8Array;
  encryptedMasterKey : Uint8Array;
  iv : Uint8Array;
  dataHash : Uint8Array;

  constructor(JSONdata : string) {
    let data = JSON.parse(JSONdata);
    this.keyDerivationFunction = data["derivation"];
    this.encryptionType = data["enc"];
    this.rounds = data["enc_rounds"];
    this.roundsMemory = data["enc_memory"];
    this.encryptedMasterKey = Uint8Array.from(data["masterKey"]);
    this.salt = Uint8Array.from(data["salt"]);
    this.iv = Uint8Array.from(data["iv"]);
    this.dataHash = Uint8Array.from(data["dataHash"]);
  }

  lock() {
    this.locked = true;
    this.masterKey = undefined;
  }

  unlock(password : string, successFunction : Function, errorFunction ?: Function) {
    let keyByteSize = this.encryptionType != "Blow" ? 32 : 56;
    getKeyHash(this.keyDerivationFunction, this.rounds, this.salt, keyByteSize, password, this.roundsMemory).then((key) => {

      let masterKey = decrypt(this.encryptionType, key, this.iv, this.encryptedMasterKey);
      let dataHash = decrypt(this.encryptionType, masterKey, this.iv, this.dataHash); //decrypt HMAC

      if(hash(masterKey) != dataHash && errorFunction) errorFunction("Bad key / HMAC missmatch");
      else {
        this.locked = false;
        this.masterKey = masterKey;
        successFunction(this.masterKey);
      }
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
      "masterKey" : convertFromUint8Array(Uint8Array.from(this.encryptedMasterKey)),
      "salt" : convertFromUint8Array(Uint8Array.from(this.salt)),
      "iv": convertFromUint8Array(Uint8Array.from(this.iv)),
      "dataHash": convertFromUint8Array(Uint8Array.from(this.dataHash)),
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

  // make HMAC
  let dataHash = encrypt(encryptionType, key, iv, hash(key));

  //check
  if(!compareArrays(masterKey, decrypt(encryptionType, key, iv, encryptedMasterKey))) {
    console.log(masterKey);
    console.log(decrypt(encryptionType, key, iv, encryptedMasterKey));
    throw "Decryption mismatch!";
  } else console.log("Decryption works. Good.")

  // make slot data
  let slotData =JSON.stringify({
    "derivation": keyDerivationFunction,
    "enc": encryptionType,
    "enc_rounds": rounds,
    "enc_memory": roundsMemory,
    "masterKey": convertFromUint8Array(Uint8Array.from(encryptedMasterKey)),
    "salt": convertFromUint8Array(Uint8Array.from(salt)),
    "iv": convertFromUint8Array(Uint8Array.from(iv)),
    "dataHash": convertFromUint8Array(Uint8Array.from(dataHash)),
  });

  let slot = new Slot(slotData);

  // check slot with bad password
  slot.unlock("password", (decryptedKey : Uint8Array) => { //success
    if(compareArrays(masterKey, decryptedKey)) {
      throw "Slot decryption with bad password!";
    }
    console.log("Success should not have been called.");
    slot.lock();
  }, (reason : string) => { // fail
    console.log("Failed because: '" + reason + "' . This is what we want. Lovely.");
  });

  // check slot actually works
  slot.unlock(password, (decryptedKey : Uint8Array) => {
    if(!compareArrays(masterKey, decryptedKey)) {
      throw "Slot decryption mismatch!";
    }
    console.log("Decryption for slot: match. Splendid.");
    slot.lock();
  }); //unlock slot for convenience
  return slot;
}


export {Slot, MakeNewSlot};
