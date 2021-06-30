import {getStoredContainer, Container} from "./../crypto/Container.js";
import {Slot, MakeNewSlot} from "./../crypto/Slot.js";
import {$, $$, disableStatus, goTo} from "./../DOMHelper.js";
import {Identity} from "./../Identity.js";
import {log} from "./../crypto/Functions.js";

var container : Container;

export class PasswordManager {
  identities ?: Identity[];
  constructor() {
    // Do things here
    let password = window.sessionStorage.getItem("InternetNomadPassword");
    window.sessionStorage.setItem("InternetNomadPassword", ""); //remove password from sessionStorage

    // should never happen
    if(password == null) throw "Password is null?!?!";

    // Get and unlock Conatiner
    container = getStoredContainer();
    container.unlock(password).then(() => {
      // after container unlocks
      this.identities = container.getIdentites();
      log(this.identities);

      // make elements

      // update settings pane with details
      updateSettingsPane();

      // hide loader
      containerUnlocked();
    }, (error) => {throw error});

    // Do other housekeeping...
    $("logout").addEventListener("click", this.logout);
    $("change_password").addEventListener("click", this.changePassword);
    $("add_container").addEventListener("click", this.addContainer);
  }

  logout() {
    container.save(); // update and lock the container
    goTo("Login.html");
  }

  changePassword() {
    log("changing password");
    // get passwords
    let password_once = $("password_change_once") as HTMLInputElement;
    let password_twice = $("password_change_twice") as HTMLInputElement;

    // Compare
    if(password_once.value != password_twice.value) {
      // TODO: if different throw error

      return;
    }

    disableStatus([password_once, password_twice], true);

    let password = password_once.value;
    container.changePassword(password).then(() => {
      //TODO: Show success
      log("password changed");
      disableStatus([password_once, password_twice], false);
    }, (error) => {
      //TODO: Show error
      log(error);
      disableStatus([password_once, password_twice], false);
    });
  }

  addContainer() {
    log("adding slot to container");
    // get passwords
    let password_once = $("password_new_slot_once") as HTMLInputElement;
    let password_twice = $("password_new_slot_twice") as HTMLInputElement;

    // Compare
    if(password_once.value != password_twice.value) {
      // TODO: if different throw error

      return;
    }

    disableStatus([password_once, password_twice], true);
    if(container.locked || container.openSlot == null) throw "Container is locked!";

    // get slot data for new slot
    let slot = container.slots[container.openSlot];

    // make the slot
    let newSlotPromise = MakeNewSlot(slot.encryptionType, slot.rounds, slot.keyDerivationFunction, slot.getMasterKey(), password_once.value, slot.roundsMemory);
    newSlotPromise.then((newSlot : Slot) => {
      // made slot
      container.slots.push(newSlot);
      log("Added new slot successfully");

      disableStatus([password_once, password_twice], false);
    }, (error) => {
      //failed to make slot
      //TODO: throw error

      log(error);

      disableStatus([password_once, password_twice], false);
    });
  }

}

function updateSettingsPane() {
  let infoStrings = {
    "info_slot_open": "Slot open: {}",
  }

  let slot = container.openSlot == null ? "null" : container.openSlot.toString();
  $("info_slot_open").textContent = infoStrings["info_slot_open"].replace("{}", slot);
}

function containerUnlocked() {
  $("loader").style.opacity = "0";
  $("loader").style.zIndex = "-999";
}
