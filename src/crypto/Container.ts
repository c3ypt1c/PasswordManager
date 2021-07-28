import { encrypt, decrypt } from "./../crypto/CryptoFunctions.js";
import { log, convertToUint8Array, convertToBase64, convertFromBase64, convertUint8ArrayToNumberArray } from "./../Functions.js";
import { Identity } from "./../Identity.js";
import { Slot } from "./Slot.js";

const storageLocation = "InternetNomad";

export class Container implements iJSON {
  // external opening
  externalMasterKey = null as null | Uint8Array;

  // normal
  rawData: string | null;
  jsonData: any;
  identities?: Identity[];
  encryptedIdentities: string;
  encryptionType: "AES" | "Blow";
  openSlot?: number;
  slots: Slot[];
  iv: Uint8Array;
  constructor(JSONdata: string) {
    this.rawData = JSONdata;

    // if the data exists, do something with it
    this.jsonData = JSON.parse(this.rawData);
    this.slots = [];
    this.encryptedIdentities = this.jsonData["encryptedIdentities"];

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
    if (this.openSlot == null) throw "Container is already locked, can't lock";
    this.update();
    this.slots[this.openSlot].lock();
    this.openSlot = undefined;
    this.identities = undefined;
  }

  // Updates the encrypted identities
  private update() {
    if (this.iv == null) throw "Container needs iv";

    // encrypt identities
    let masterKey = this.getMasterKey();
    
    let currentIdentities = this.getIdentites();
    let identityList = []; // JSON the list, convert the list to Uint8Array, encrypt, convert to base64 
    for(let identity = 0; identity < currentIdentities.length; identity++) {
      identityList.push(currentIdentities[identity].getJSON());
    }

    let encrypted = encrypt(this.encryptionType, masterKey, this.iv, convertToUint8Array(JSON.stringify(identityList)));
    this.encryptedIdentities = convertToBase64(encrypted);
  }

  // saves container to storage
  save() {
    this.update();
    setStoredContainer(this);
  }

  private async unlockIdentites(key: Uint8Array) {
    log("unlocking identities");
    log(this.encryptionType);
    log(key);
    log(this.iv);

    if (this.encryptionType == null) throw "Cannot decrypt without encryptionType";
    if (this.iv == null) throw "Cannot decrypt without iv";

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
  }

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
      await this.unlockIdentites(slot.getMasterKey());

      return;
    }

    throw "Could not open any container";
  }

  async changePassword(password: string) {
    if (this.openSlot == null) throw "Container needs to be open";
    let slot = this.slots[this.openSlot];
    await slot.changePassword(password);
  }

  // btw this throws a load of garbage if wrong
  async externalUnlock(masterKey: Uint8Array) {
    this.externalMasterKey = masterKey;
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

    let containerData = JSON.stringify({
      "slots": allSlotsJson,
      "encryptedIdentities": this.encryptedIdentities,
      "iv": convertToBase64(this.iv),
      "encryptionType": this.encryptionType,
    });

    return containerData;
  }

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

  /*
  addSlot(password: string) {
    TODO: implement
  }*/

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