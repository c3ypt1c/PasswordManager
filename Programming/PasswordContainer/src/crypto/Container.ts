import {encrypt, decrypt, log} from "./../crypto/Functions.js";
import {Identity} from "./../Identity.js";
import {Slot} from "./Slot.js";

function storageHasContainer() : boolean {
  let storage = window.localStorage;
  let rawData = storage.getItem("InternetNomad");
  return rawData != null;
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

  getIdentites() {
    if(this.locked) throw "Identities are locked!";

  }

  get locked() {
    return this.openSlot == null;
  }

  private getOpenSlot() {
    if(this.locked) throw "Slot is locked";
    return this.openSlot as number; //always number because locked
  }

  lock() {
    this.update();
    this.slots[this.getOpenSlot()].lock();
    this.openSlot = undefined;
  }

  update() {
    let storage = window.localStorage;
    this.rawData = this.getJSON();
    storage.setItem("InternetNomad", this.rawData);
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
      identities.push(decrypt(this.encryptionType, key, this.iv, thisIdentity));
    }

    log(identities);
  }

  async unlock(password: string) {
    for(let index = 0; index < this.slots.length; index++) {
      let slot = this.slots[index];
      log("opening slot number " + index);
      log(slot);

      log("unlocking with password '{}'".replace("{}", password));
      await slot.unlock(password);

      log("unlocking identities");
      await this.unlockIdentites(slot.getMasterKey());

      this.openSlot = index;
    }
  }

  getJSON() {
    return "";
  }
}

export {Container, storageHasContainer};
