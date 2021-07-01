import {getStoredContainer, Container} from "./../crypto/Container.js";
import {Slot, MakeNewSlot} from "./../crypto/Slot.js";
import {$, $$, disableStatus, goTo} from "./../DOM/DOMHelper.js";
import {DOMAlert} from "./../DOM/DOMAlert.js";
import {Identity} from "./../Identity.js";
import {log} from "./../crypto/Functions.js";
import {PaneManager} from "./../DOM/PaneManager.js";

// encrypted container
var container : Container;

// a place for notifications
var notification_container = $("notification_container");

// location of icons
let icon_location = "../css/bootstrap/icons/"

export class PasswordManager {
  identities ?: Identity[];
  paneManager : PaneManager;
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

    let paneManagerMappings = {
      "home_pane_button": "home_pane",
      "identity_pane_button": "identity_pane",
      "settings_pane_button": "settings_pane",
      "recovery_pane_button": "recovery_pane",
    };

    this.paneManager = new PaneManager(paneManagerMappings);
    $("home_pane_button").click();
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
      this.passwordMissmatchAlert();
      return;
    }

    disableStatus([password_once, password_twice], true);

    let password = password_once.value;
    container.changePassword(password).then(() => {
      log("password changed");
      new DOMAlert("info", "Successfully changed passwords!", notification_container);
      disableStatus([password_once, password_twice], false);
    }, (error) => {
      new DOMAlert("danger", "Failed to change password:\n" + error, notification_container)
      log(error);
      disableStatus([password_once, password_twice], false);
    });
  }

  passwordMissmatchAlert() {
    new DOMAlert("danger", "Passwords don't match", notification_container);
  }

  addContainer() {
    log("adding slot to container");
    // get passwords
    let password_once = $("password_new_slot_once") as HTMLInputElement;
    let password_twice = $("password_new_slot_twice") as HTMLInputElement;

    // Compare
    if(password_once.value != password_twice.value) {
      this.passwordMissmatchAlert();
      return;
    }

    disableStatus([password_once, password_twice], true);
    if(container.locked || container.openSlot == null) {
      new DOMAlert("danger", "Conatiner is locked!", notification_container);
      throw "Container is locked!";
    }

    // get slot data for new slot
    let slot = container.slots[container.openSlot];

    // make the slot
    let newSlotPromise = MakeNewSlot(slot.encryptionType, slot.rounds, slot.keyDerivationFunction, slot.getMasterKey(), password_once.value, slot.roundsMemory);
    newSlotPromise.then((newSlot : Slot) => {
      // made slot
      container.slots.push(newSlot);
      container.save();
      log("Added new slot successfully");
      new DOMAlert("success", "Added new slot!", notification_container);
      disableStatus([password_once, password_twice], false);
      updateSettingsPane();
    }, (error) => {
      //failed to make slot
      new DOMAlert("danger", "Could not add slot:\n" + error, notification_container);
      log(error);
      disableStatus([password_once, password_twice], false);
      updateSettingsPane();
    });
  }
}

function updateSettingsPane() {
  let infoStrings = {
    "info_slot_open": "Slot open: {}",
  }

  let slot = container.openSlot == null ? "null" : container.openSlot.toString();
  $("info_slot_open").textContent = infoStrings["info_slot_open"].replace("{}", slot);

  // add containers for show_conatiners
  let show_slots = $("show_slots");

  // remove existsing childen
  while(show_slots.children.length > 0) {
    let child = show_slots.children.item(0);
    if(child == null) break; //no more children anyway
    child.remove();
  }

  // add new children
  for(let index = 0; index < container.slots.length; index++) {
    // make main div
    let containerElement = document.createElement("div");
    containerElement.classList.add(
      "d-flex", "badge", "border", "border-secondary", "bg-light", "flex-column",
      "justify-content-center", "p-4", "m-1", "text-center", "fs-4"
    );
    containerElement.addEventListener("click", () => removeSlot(index));

    // aesthetic
    if(index == container.openSlot) containerElement.classList.add("text-danger");
    else containerElement.classList.add("text-warning");

    // set title
    let containerTitle = document.createElement("p");
    containerTitle.textContent = "Slot " + index;
    containerTitle.classList.add("fs-1");
    containerElement.appendChild(containerTitle);

    // make icon
    let containerImage = document.createElement("i");
    containerImage.classList.add("bi-archive");
    containerElement.appendChild(containerImage)

    // add the container to show_conatiners
    show_slots.appendChild(containerElement);
  }

}

function containerUnlocked() {
  $("loader").style.opacity = "0";
  $("loader").style.zIndex = "-999";
}

function removeSlot(slot : number) {
  try {
    container.removeSlot(slot);
    new DOMAlert("success", "Removed slot number {}!".replace("{}", slot.toString()), notification_container);
  } catch(error) {
    new DOMAlert("warning", "Could not remove slot:\n" + error, notification_container);
  }
  updateSettingsPane();
}
