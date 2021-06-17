import {Slot} from "./Slot";

class Container {
  rawData : string | null;
  jsonData : JSON | any;
  slots : Slot[];
  constructor() {
    let storage = window.localStorage;
    this.rawData = storage.getItem("InterneNomad");

    if(this.rawData == null) {
      this.slots = [];
      this.jsonData = JSON.parse("{}"); //empty json object
    } else {
      this.jsonData = JSON.parse(this.rawData);
      let slots = this.jsonData["slots"] as any;
      this.slots = [];
      for(let slot = 0; slot < slots.length; slot++) {
        this.slots.push(new Slot(slots[slot]));
      }
    }
  }

  unlock(key : string) {
    // unlocking might be a bottle-neck
    let result = false;
    for(let slot = 0; slot < this.slots.length; slot++) {
      result = this.slots[slot].unlock(key) as any;
      if (result) return result; // if successfully unlocked
    }

    // none succeeded
    if (!result) return false;

    // unlock data

  }

}
