import { EncryptionType, KeyDerivationFunction } from "../CustomTypes.js";
import { getRandomBytes, getKeyHash, hash, encrypt, decrypt, algorithmBytes, algorithmIvBytes } from "./CryptoFunctions.js"; //useful functions
import { compareArrays, convertFromBase64, convertToBase64, log } from "../Functions.js";

/**
 * A slot that stores the master key.
 */
class Slot implements iJSON {
  locked = true;
  masterKey?: Uint8Array;
  keyDerivationFunction: KeyDerivationFunction;
  encryptionType: EncryptionType;
  rounds: number;
  roundsMemory: number | null; // Can be null since not all algorithms can scale with memory
  salt: Uint8Array;
  encryptedMasterKey: Uint8Array;
  iv: Uint8Array;
  dataHash: Uint8Array;

  constructor(JSONdata: string) {
    let data = JSON.parse(JSONdata);
    this.keyDerivationFunction = data["derivation"];
    this.encryptionType = data["enc"];
    this.rounds = data["enc_rounds"];
    this.roundsMemory = data["enc_memory"];
    this.encryptedMasterKey = convertFromBase64(data["masterKey"]);
    this.salt = convertFromBase64(data["salt"]);
    this.iv = convertFromBase64(data["iv"]);
    this.dataHash = convertFromBase64(data["dataHash"]);
  }

  /**
   * Lock the container. Delete the currently stored master key
   */
  lock() {
    this.locked = true;
    this.masterKey = undefined;
  }

  /**
   * Attempts to unlock this container given the password.
   * @param password password to unlock the container
   * @returns the master key of the container
   */
  async unlock(password: string) {
    let keyByteSize = this.encryptionType != "Blow" ? 32 : 56;
    let key = await getKeyHash(this.keyDerivationFunction, this.rounds, this.salt, keyByteSize, password, this.roundsMemory);

    let masterKey = decrypt(this.encryptionType, key, this.iv, this.encryptedMasterKey);
    let dataHash = decrypt(this.encryptionType, key, this.iv, this.dataHash); //decrypt HMAC
    log("decrypted...");
    log(masterKey);
    log(dataHash);

    let keyHash = hash(key)
    log(keyHash);

    if (!compareArrays(keyHash, dataHash)) throw "Bad key / HMAC missmatch";

    this.locked = false;
    this.masterKey = masterKey;

    return this.masterKey;
  }

  /**
   * @returns the master key to unlock the container
   */
  getMasterKey(): Uint8Array {
    if (this.locked || this.masterKey == null) throw "Slot is locked.";
    else return this.masterKey;
  }

  getJSON() {
    let data = {
      "derivation": this.keyDerivationFunction,
      "enc": this.encryptionType,
      "enc_rounds": this.rounds,
      "enc_memory": this.roundsMemory,
      "masterKey": convertToBase64(this.encryptedMasterKey),
      "salt": convertToBase64(this.salt),
      "iv": convertToBase64(this.iv),
      "dataHash": convertToBase64(this.dataHash),
    }
    return JSON.stringify(data);
  }

  /**
   * Changes the current password of this slot.
   * @param password the new password
   */
  async changePassword(password: string) {
    if(this.locked) throw "Slot needs to be open to change password";

    // Make a new salt
    let keyByteSize = algorithmBytes(this.encryptionType);
    this.salt = getRandomBytes(keyByteSize);

    // Make new IV
    let ivSize = algorithmIvBytes(this.encryptionType);
    this.iv = getRandomBytes(ivSize);

    // derive key
    let key = await getKeyHash(this.keyDerivationFunction, this.rounds, this.salt, keyByteSize, password, this.roundsMemory);
    this.encryptedMasterKey = encrypt(this.encryptionType, key, this.iv, this.getMasterKey());

    // make HMAC
    this.dataHash = encrypt(this.encryptionType, key, this.iv, hash(key));
  }
}

/**
 * Slot factory / Make a new slot
 * @param encryptionType slot encryption type 
 * @param rounds slot time cost
 * @param keyDerivationFunction slot key derivation function  
 * @param masterKey container master key
 * @param password password to unlock this slot with
 * @param roundsMemory memory cost (Argon 2 only)
 * @returns a new Slot ready to be inserted into a Container
 */
async function MakeNewSlot(encryptionType: EncryptionType, rounds: number, keyDerivationFunction: KeyDerivationFunction, masterKey: Uint8Array, password: string, roundsMemory: number | null) : Promise<Slot> {
  // Make a salt
  let keyByteSize = algorithmBytes(encryptionType);
  let salt = getRandomBytes(keyByteSize);

  // Derive key
  let key = await getKeyHash(keyDerivationFunction, rounds, salt, keyByteSize, password, roundsMemory);

  // make iv
  let ivSize = encryptionType != "Blow" ? 16 : 8;
  let iv = getRandomBytes(ivSize);

  // encrypt master key
  let encryptedMasterKey = encrypt(encryptionType, key, iv, masterKey);

  // make HMAC
  let dataHash = encrypt(encryptionType, key, iv, hash(key));

  //check
  if (!compareArrays(masterKey, decrypt(encryptionType, key, iv, encryptedMasterKey))) {
    log(masterKey);
    log(decrypt(encryptionType, key, iv, encryptedMasterKey));
    throw "Decryption mismatch!";
  } else console.log("Decryption works. Good.")

  // make slot data
  let slotData = JSON.stringify({
    "derivation": keyDerivationFunction,
    "enc": encryptionType,
    "enc_rounds": rounds,
    "enc_memory": roundsMemory,
    "masterKey": convertToBase64(encryptedMasterKey),
    "salt": convertToBase64(salt),
    "iv": convertToBase64(iv),
    "dataHash": convertToBase64(dataHash),
  });

  let slot = new Slot(slotData);

  // check slot with bad password
  await slot.unlock(password + ".").then((decryptedKey: Uint8Array) => { //success
    if (compareArrays(masterKey, decryptedKey)) {
      throw "Slot decryption with bad password!";
    }
    log("Success should not have been called.");
  }, (reason: string) => { // fail
    log("Failed because: '" + reason + "'. This is what we want. Lovely.");
  });

  // check slot actually works
  await slot.unlock(password).then((decryptedKey: Uint8Array) => {
    if (!compareArrays(masterKey, decryptedKey)) {
      throw "Slot decryption mismatch!";
    }
    log("Decryption for slot: match. Splendid.");
    log(masterKey);
    log(decryptedKey);
    log(slot.getMasterKey());

  });

  await slot.unlock(password);
  log("Finally unlocking slot without promises");
  log(masterKey);
  log(slot.getMasterKey());
  log("Unlocked successfully");
  
  return slot;
}


export { Slot, MakeNewSlot };
