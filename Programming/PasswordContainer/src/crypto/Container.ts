import {encrypt, decrypt} from "./../crypto/Functions.js";
import {Identity} from "./../Identity.js";
import {Slot} from "./Slot.js";

class Container implements iJSON {
  rawData : string | null;
  jsonData : any;
  identities ?: Identity[];
  encryptedIdentities : Uint8Array[];
  encryptionType ?: "AES" | "Blow";
  openSlot ?: number;
  slots : Slot[];
  iv ?: Uint8Array;
  constructor(JSONdata ?: string) {
    // get the data
    if(JSONdata) this.rawData = JSONdata;
    else {
      let storage = window.localStorage;
      this.rawData = storage.getItem("InternetNomad");
    }

    // if the data exists, do something with it
    this.jsonData = this.rawData ? JSON.parse(this.rawData) : null;
    this.slots = [];
    this.encryptedIdentities = [];

    if(this.rawData != null) {
      // add slots
      let jsonSlots = this.jsonData["slots"] as any[];
      this.slots = [];
      for(let slot = 0; slot < jsonSlots.length; slot++) {
        this.slots.push(new Slot(jsonSlots[slot]));
      }

      // add identity
      this.encryptedIdentities = this.jsonData["encryptedIdentities"];

      // add encrypton iv
      this.iv = this.jsonData["iv"];
    }
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
    console.log(this.encryptionType, key, this.iv, this.encryptedIdentities);
    if(this.encryptionType == null) throw "Cannot decrypt without encryptionType";
    if(this.iv == null) throw "Cannot decrypt without iv";
    let identities = [];
    //decrypt(this.encryptionType, key, this.iv, this.encryptedIdentities);
    for(let index = 0; index < this.encryptedIdentities.length; index++) {
      identities.push(decrypt(this.encryptionType, key, this.iv, this.encryptedIdentities[index]));
    }
    console.log(identities);
  }

  async unlock(password: string) {
    for(let index = 0; index < this.slots.length; index++) {
      let slot = this.slots[index];
      console.log("opening slot number " + index);
      console.log(slot);

      console.log("unlocking with password '{}'".replace("{}", password));
      await slot.unlock(password);

      console.log("unlocking identities");
      await this.unlockIdentites(slot.getMasterKey());

      this.openSlot = index;
    }
  }

  getJSON() {
    return "";
  }
}

export {Container};
