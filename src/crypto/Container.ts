import { EncryptionType, JSONContainerData, KeyDerivationFunction } from "./../CustomTypes.js";
import { encrypt, decrypt, hash, getRandomBytes, algorithmIvBytes } from "./CryptoFunctions.js";
import { log, convertToUint8Array, convertToBase64, convertFromBase64, compareArrays } from "./../Functions.js";
import { Identity } from "./../Identity.js";
import { MakeNewSlot, Slot } from "./Slot.js";
import { Settings } from "../Extra/Settings/Settings.js";

const storageLocation = "InternetNomad";

export class Container implements iJSON {
  // external opening
  externalMasterKey = null as null | Uint8Array;

  // normal
  rawData?: string;
  jsonData?: any;
  identities?: Identity[];
  encryptedIdentities?: string;
  encryptionType?: EncryptionType;
  openSlot?: number;
  private slots = [] as Slot[];
  iv?: Uint8Array;
  dataHash?: Uint8Array;

  // settings
  settings?: Settings;
  encryptedSettings?: string;

  constructor(JSONdata?: string) {
    if (JSONdata == null) return;

    this.rawData = JSONdata;

    // if the data exists, do something with it
    this.jsonData = JSON.parse(this.rawData) as JSONContainerData;
    this.encryptedIdentities = this.jsonData["encryptedIdentities"];
    this.encryptedSettings = this.jsonData["encryptedSettings"];
    if(this.encryptedSettings == null) this.settings = new Settings();

    this.dataHash = convertFromBase64(this.jsonData["dataHash"]);

    // add slots
    let jsonSlots = this.jsonData["slots"] as any[];
    this.slots = [];
    for (let slot = 0; slot < jsonSlots.length; slot++) {
      this.slots.push(new Slot(jsonSlots[slot]));
    }

    // add encrypton iv
    this.iv = convertFromBase64(this.jsonData["iv"]);
    this.encryptionType = this.jsonData["encryptionType"];
  }

  get isEmpty() {
    return this.rawData == null;
  }

  getIdentites(): Identity[] {
    if (this.identities == null) throw "Identities are null!";
    else return this.identities;
  }

  lock() {
    this.update();
    // remove external key
    if (this.externalMasterKey != null) {
      this.externalMasterKey = null;
    }

    // remove opened slot
    if (this.openSlot != null) {
      this.slots[this.openSlot].lock();
      this.openSlot = undefined;
      this.identities = undefined;
    }
  }

  /**
   * Updates the encrypted identities 
   */
  private update() {
    if (this.encryptionType == null) throw "Update: Encryption type needed!";
    let ivSize = algorithmIvBytes(this.encryptionType);
    this.iv = getRandomBytes(ivSize);

    // encrypt identities
    let masterKey = this.getMasterKey();

    // changed iv means changed datahash
    this.dataHash = encrypt(this.encryptionType, masterKey, this.iv, hash(masterKey));

    let currentIdentities = this.getIdentites();
    let identityList = []; // JSON the list, convert the list to Uint8Array, encrypt, convert to base64 
    for (let identity = 0; identity < currentIdentities.length; identity++) {
      identityList.push(currentIdentities[identity].getJSON());
    }

    let encrypted = encrypt(this.encryptionType, masterKey, this.iv, convertToUint8Array(JSON.stringify(identityList)));
    this.encryptedIdentities = convertToBase64(encrypted);

    if (this.settings != null) this.encryptedSettings = convertToBase64(encrypt(this.encryptionType, masterKey, this.iv, convertToUint8Array(this.settings.getJSON())));
  }

  /** 
   * saves container to storage
   */
  save() {
    this.update();
    setStoredContainer(this);
  }

  private async unlockIdentites(key: Uint8Array) {
    if (this.dataHash == null) throw "No dataHash!";
    if (this.encryptedIdentities == null) throw "No encrypted identities!";

    log("unlocking identities");
    log(this.encryptionType);
    log(key);
    log(this.iv);

    if (this.encryptionType == null) throw "Cannot decrypt without encryptionType";
    if (this.iv == null) throw "Cannot decrypt without iv";

    // Test dataHash
    let decryptedHMAC = decrypt(this.encryptionType, key, this.iv, this.dataHash);
    let keyHash = hash(key);
    if (!compareArrays(decryptedHMAC, keyHash)) throw "HMAC Missmatch";

    // identities
    log("identities;");
    log(this.encryptedIdentities);
    log(convertFromBase64(this.encryptedIdentities));

    let decryptedIdentitiesArray = decrypt(this.encryptionType, key, this.iv, convertFromBase64(this.encryptedIdentities));
    let decryptedIdentities = JSON.parse(Buffer.from(decryptedIdentitiesArray).toString("utf-8")) as string[];

    this.identities = [];
    for (let index = 0; index < decryptedIdentities.length; index++) {
      this.identities.push(new Identity(decryptedIdentities[index]));
    }

    log(this.identities);

    // settings
    if (this.encryptedSettings != null) {
      let settingsArray = decrypt(this.encryptionType, key, this.iv, convertFromBase64(this.encryptedSettings));
      this.settings = new Settings(Buffer.from(settingsArray).toString("utf-8"));
      log("decrypted settings: ")
      log(this.settings);
    }
  }

  // TODO: Refactor
  async unlock(password: string) {
    if (this.openSlot != null) {
      log("slot already opened");
      if (this.identities == null) {
        await this.unlockIdentites(this.slots[this.openSlot].getMasterKey());
      }
    }
    else for (let index = 0; index < this.slots.length; index++) {
      let slot = this.slots[index];
      log("opening slot number " + index);
      log(slot);
      try {
        log("unlocking with password '{}'".replace("{}", password));
        await slot.unlock(password);
      } catch (e) {
        log("Failed to unlock slot " + index);
        log(e);
        continue;
      }

      log("unlocking identities");
      this.openSlot = index;
      try {
        await this.unlockIdentites(slot.getMasterKey());
        return; //success
      } catch (e) {
        log(e);
        continue;
      }
    }

    throw "Could not open any container";
  }

  async changePassword(password: string) {
    if (this.openSlot == null) throw "Container needs to be open";
    let slot = this.slots[this.openSlot];
    await slot.changePassword(password);
  }

  async externalUnlock(masterKey: Uint8Array) {
    this.externalMasterKey = masterKey;
    // This will throw HMAC missmatch if wrong
    await this.unlockIdentites(masterKey);
  }

  getJSON() {
    //update identites
    this.update();

    //add slots
    let allSlotsJson = [];
    for (let slot = 0; slot < this.slots.length; slot++) {
      allSlotsJson.push(this.slots[slot].getJSON());
    }

    let containerData = new Object() as JSONContainerData;
    containerData.slots = allSlotsJson;
    if (this.encryptedIdentities != null) containerData.encryptedIdentities = this.encryptedIdentities;
    if (this.iv != null) containerData.iv = convertToBase64(this.iv);
    if (this.encryptionType != null) containerData.encryptionType = this.encryptionType;
    if (this.dataHash != null) containerData.dataHash = convertToBase64(this.dataHash);
    if (this.encryptedSettings != null) containerData.encryptedSettings = this.encryptedSettings;

    return JSON.stringify(containerData);
  }

  // Make so that no slots need to exist
  removeSlot(slot: number) {
    if (this.openSlot == null) throw "No slot is open";

    if (this.slots.length == 1) {
      let error = "Cannot have less than 1 slot";
      throw error;
    }

    if (slot < 0 || slot >= this.slots.length) {
      let error = slot + " is not a valid range for a slot";
      throw error;
    }

    if (slot == this.openSlot) {
      // set the key to be external instead. 
      let error = slot + " is currently used to decrypt the container. Cannot remove.";
      throw error;
    }

    if (this.openSlot > slot) this.openSlot--; //move pointer to the left
    this.slots.splice(slot, 1);
    this.save(); // save changes
  }

  async addSlot(password: string, encryptionType?: EncryptionType | null, rounds?: number | null, keyDerivationFunction?: KeyDerivationFunction | null, roundsMemory?: number | null, masterKey?: Uint8Array | null) {
    let copySlot: number | null;
    if (this.openSlot != null) copySlot = this.openSlot;
    else copySlot = this.slots.length > 0 ? 0 : null;

    log("Will be copying data from slot: " + copySlot);
    if (copySlot != null) {
      let openSlotObject = this.slots[copySlot];
      encryptionType = encryptionType || openSlotObject.encryptionType;
      rounds = rounds || openSlotObject.rounds;
      keyDerivationFunction = keyDerivationFunction || openSlotObject.keyDerivationFunction;
      roundsMemory = roundsMemory || openSlotObject.roundsMemory;
      masterKey = masterKey || this.getMasterKey();
    }

    if (encryptionType == null) throw "addSlot: Missing parameters: encryptionType";
    if (rounds == null) throw "addSlot: Missing parameters: rounds";
    if (keyDerivationFunction == null) throw "addSlot: Missing parameters: keyDerivationFunction";
    if (roundsMemory == null) throw "addSlot: Missing parameters: roundsMemory";
    if (masterKey == null) throw "addSlot: Missing parameters: masterKey";

    let slot = await MakeNewSlot(encryptionType, rounds, keyDerivationFunction, masterKey, password, roundsMemory);
    this.slots.push(slot);
    slot.lock();
    if (copySlot == null) {
      this.externalMasterKey = masterKey;
    }
    this.save();
  }

  addIdentity(identity: Identity) {
    if (this.identities == null) throw "Identities are not defined";
    this.identities.push(identity);
    this.save();
  }

  removeIdentity(identity: number) {
    if (this.identities == null) throw "Identities are not defined";
    this.identities.splice(identity, 1);
    this.save();
  }

  getMasterKey() {
    if (this.externalMasterKey != null) return this.externalMasterKey;
    if (this.openSlot == null) throw "No slot is open";
    return this.slots[this.openSlot].getMasterKey();
  }

  getSlots() {
    return this.slots;
  }
}

function setStoredContainer(container: Container) {
  let storage = window.localStorage;
  if (storage == null) throw "Not running under Electron";
  let rawData = container.getJSON();
  log("Putting data");
  log(rawData);

  storage.setItem(storageLocation, rawData);
}

export function deleteContainer() {
  let storage = window.localStorage;
  if (storage == null) throw "Not running under Electron";
  storage.setItem(storageLocation, null as any);
}

export function storageHasContainer(): boolean {
  let storage = window.localStorage;
  if (storage == null) throw "Not running under Electron";
  let rawData = storage.getItem(storageLocation);
  return rawData != null;
}

export function getStoredContainer() {
  let storage = window.localStorage;
  if (storage == null) throw "Not running under Electron";

  let rawData = storage.getItem(storageLocation);
  if (rawData == null) throw "Container does not exist!";

  log(rawData);
  return new Container(rawData);
}