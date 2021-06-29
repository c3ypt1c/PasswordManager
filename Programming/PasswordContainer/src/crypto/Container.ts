import {encrypt, decrypt, log, convertToUint8Array, convertFromUint8Array} from "./../crypto/Functions.js";
import {Identity} from "./../Identity.js";
import {Slot} from "./Slot.js";

const storageLocation = "InternetNomad";

function storageHasContainer() : boolean {
  let storage = window.localStorage;
  let rawData = storage.getItem(storageLocation);
  return rawData != null;
}

function getStoredContainer() {
  let storage = window.localStorage;
  let rawData = storage.getItem(storageLocation);

  if(rawData == null) throw "Container does not exist!";
  log(rawData);
  return new Container(rawData);
}

class Container implements iJSON {
  rawData : string | null;
  jsonData : any;
  identities ?: Identity[];
  encryptedIdentities : Uint8Array[];
  encryptionType : "AES" | "Blow";
  openSlot ?: number;
  slots : Slot[];
  iv ?: Uint8Array;
  constructor(JSONdata : string) {
    this.rawData = JSONdata;


    // if the data exists, do something with it
    this.jsonData = JSON.parse(this.rawData);
    this.slots = [];
    this.encryptedIdentities = [];

    // add slots
    let jsonSlots = this.jsonData["slots"] as any[];
    this.slots = [];
    for(let slot = 0; slot < jsonSlots.length; slot++) {
      this.slots.push(new Slot(jsonSlots[slot]));
    }

    // add identity
    this.encryptedIdentities = this.jsonData["encryptedIdentities"];

    // add encrypton iv
    this.iv = Uint8Array.from(this.jsonData["iv"]);
    this.encryptionType = this.jsonData["encryptionType"];

  }

  get isEmpty() {
    return this.rawData == null;
  }

  getIdentites() : Identity[] {
    if(this.locked) throw "Identities are locked!";
    else if(this.identities == null) throw "Identities are null!";
    else return this.identities;
  }

  get locked() {
    return this.openSlot == null;
  }

  private getOpenSlot() {
    if(this.locked) throw "Slot is locked";
    return this.openSlot as number; //always number because locked
  }

  lock() {
    if(this.locked || this.openSlot == null) throw "Container is open, can't lock";
    this.update();
    this.slots[this.getOpenSlot()].lock();
    this.openSlot = undefined;
    this.identities = undefined;
  }

  // Updates the encrypted identities
  private update() {
    if(this.locked || this.openSlot == null) throw "Container needs a slot unlocked";
    if(this.iv == null) throw "Container needs iv";

    // encrypt identities
    let masterKey = this.slots[this.openSlot].getMasterKey();
    let newEncryptedIdentities = [];
    let currentIdentities = this.getIdentites();
    if(currentIdentities == null) throw "currentIdentities are null";
    for(let identity = 0; identity < currentIdentities.length; identity++) {
      let identityJSON = currentIdentities[identity].getJSON();
      let encryptedJSON = encrypt(this.encryptionType, masterKey, this.iv, convertToUint8Array(identityJSON));
      let correctlyFormattedBytes = convertFromUint8Array(Uint8Array.from(encryptedJSON));
      newEncryptedIdentities.push(correctlyFormattedBytes);
    };

  }

  // saves container to storage
  save() {
    this.update();
    let storage = window.localStorage;

    this.rawData = this.getJSON();
    log("Putting data");
    log(this.rawData);
    storage.setItem(storageLocation, this.rawData);
  }

  private async unlockIdentites(key : Uint8Array) {
    log("unlocking identities");
    log(this.encryptionType);
    log(key);
    log(this.iv);
    log(this.encryptedIdentities);

    if(this.encryptionType == null) throw "Cannot decrypt without encryptionType";
    if(this.iv == null) throw "Cannot decrypt without iv";
    let identities = [];

    //decrypt(this.encryptionType, key, this.iv, this.encryptedIdentities);
    for(let index = 0; index < this.encryptedIdentities.length; index++) {
      let thisIdentity = Uint8Array.from(this.encryptedIdentities[index]);
      let decryptedIdentity = decrypt(this.encryptionType, key, this.iv, thisIdentity);
      let identityJson = Buffer.from(decryptedIdentity).toString('utf8');
      //String.fromCharCode.apply(null, decryptedIdentity as any); // Works too, but might fail with bigger texts
      log("identityJson");
      log(identityJson);

      let identityObject = new Identity(identityJson);
      identities.push(identityObject);
    }

    log(identities);
    this.identities = identities;
  }

  async unlock(password: string) {
    if(this.openSlot != null) {
      log("slot already opened");
      if(this.identities == null) {
        await this.unlockIdentites(this.slots[this.openSlot].getMasterKey());
      }
    }
    else for(let index = 0; index < this.slots.length; index++) {
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

  async changePassword(password : string) {
    if(this.locked || this.openSlot == null) throw "Container needs to be open";
    let slot = this.slots[this.openSlot];
    await slot.changePassword(password);
  }

  getJSON() {
    if(this.iv == null) throw "iv missing from Container.";

    //update identites
    this.update();

    //add slots
    let allSlotsJson = [];
    for(let slot = 0; slot < this.slots.length; slot++) {
      allSlotsJson.push(this.slots[slot].getJSON());
    }

    //add identities
    let encryptedIdentities = [];
    for(let encryptedIdentity = 0; encryptedIdentity < this.encryptedIdentities.length; encryptedIdentity++) {
      encryptedIdentities.push(convertFromUint8Array(Uint8Array.from(this.encryptedIdentities[encryptedIdentity])));
    }

    let containerData = JSON.stringify({
      "slots": allSlotsJson,
      "encryptedIdentities": encryptedIdentities,
      "iv": convertFromUint8Array(this.iv),
      "encryptionType" : this.encryptionType,
    });
    return containerData;
  }
}

function deleteContainer() {
  let storage = window.localStorage;
  storage.setItem(storageLocation, null as any);
}

export {Container, storageHasContainer, getStoredContainer, deleteContainer};
