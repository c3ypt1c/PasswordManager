import {Slot} from "./Slot.js";

class Container implements iJSON {
  rawData : string | null;
  jsonData : any;
  data ?: JSON;
  slots : Slot[];

  constructor(JSONdata ?: string) {
    if(JSONdata) this.rawData = JSONdata;
    else {
      let storage = window.localStorage;
      this.rawData = storage.getItem("InternetNomad");
    }
    this.jsonData = this.rawData ? JSON.parse(this.rawData) : null;

    if(this.rawData == null) {
      this.slots = [];
    } else {
      let jsonSlots = this.jsonData["slots"] as any[];
      this.slots = [];
      for(let slot = 0; slot < jsonSlots.length; slot++) {
        this.slots.push(new Slot(jsonSlots[slot]));
      }
    }
  }

  get isEmpty() {
    return this.rawData == null;
  }

  unlock(password : string, successCallback : Function, failedCallback : Function) {


  }

  lock() {

  }

  update() {

  }

  private openSlots(password : string, successCallback : Function, failedCallback : Function, index ?: number) {
    index = index == null ? 0 : index;
    if(index < 0) throw "Index cannot be less than 0";
    if(index == this.slots.length) failedCallback("Could not unlock any slot");
    let slot = this.slots[index];
    slot.unlock(password, successCallback, () => {

    })
  }

  getJSON() {
    return "";
  }
}

// Function makes a container and saves it to memory
function makeContainer(algorithm : "Serp" | "Blow" | "AES", slot : Slot ) {
  // determine the number of bits
  let bytes = algorithm == "Blow" ? 56 : 32;

  // creating master key
  let masterKey = new Uint8Array(bytes);
  window.crypto.getRandomValues(masterKey);

  let jsonData = {"container_data": {"encrypted_data": {}, "algorithm": algorithm },
                  "slots": [slot.getJSON()],
                 }

}

export {Container, makeContainer};
