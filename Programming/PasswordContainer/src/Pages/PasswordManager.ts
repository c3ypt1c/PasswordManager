import {getStoredContainer, Container} from "./../crypto/Container.js";
import {Slot, MakeNewSlot} from "./../crypto/Slot.js";
import {$, removeAllChildren, disableStatus, goTo} from "./../DOM/DOMHelper.js";
import {DOMAlert} from "./../DOM/DOMAlert.js";
import {Identity} from "./../Identity.js";
import {log} from "./../crypto/Functions.js";
import {PaneManager} from "./../DOM/PaneManager.js";
import {BIP} from "./../Recovery/BIP.js";
import {Shamir, ShamirChunk, generateBIPs} from "./../Recovery/Shamir.js";

// encrypted container and identity
var container : Container;
var currentIdentity = 0;

// a place for notifications
var notification_container = $("notification_container");

// recovery
var Bip = new BIP();
new Shamir();

export class PasswordManager {
  identities ?: Identity[];
  paneManager : PaneManager;
  constructor() {
    container = getStoredContainer();
    let masterKey = window.sessionStorage.getItem("InternetNomadMasterKey");
    if(masterKey == null) { // Master key not directly passed
      let password = window.sessionStorage.getItem("InternetNomadPassword");
      window.sessionStorage.removeItem("InternetNomadPassword"); //remove password from sessionStorage
    
      // should never happen
      if(password == null) {
        // return back to login
        goTo("Login.html");
        throw "Password is blank";
      }

      // Get and unlock Conatiner
      
      container.unlock(password).then(() => {
        // after container unlocks
        this.identities = container.getIdentites();
        log(this.identities);

        // update panes with details
        updateEverything()

        // hide loader
        containerUnlocked();
      }, (error) => {throw error});
    } else {
      // Master key directly passed in
      //window.sessionStorage.removeItem("InternetNomadMasterKey");
      log("external master key unlock");
      log(masterKey);
      let masterKeyArray = Uint8Array.from(JSON.parse(masterKey));
      container.externalUnlock(masterKeyArray).then(() => {
        // after container unlocks
        this.identities = container.getIdentites();
        log(this.identities);

        // update panes with details
        updateEverything()

        // hide loader
        containerUnlocked();
      }, (error) => {throw error});
    }

    // Do other light housekeeping...
    $("logout").addEventListener("click", this.logout);
    $("change_password").addEventListener("click", this.changePassword);
    $("add_container").addEventListener("click", this.addContainer);
    $("reveal_bip").addEventListener("click", revealBip);
    $("generate_shared_recovery").addEventListener("click", createSharedRecovery);

    // add pane manager
    let paneManagerMappings = {
      "home_pane_button": "home_pane",
      "identity_pane_button": "identity_pane",
      "settings_pane_button": "settings_pane",
      "recovery_pane_button": "recovery_pane",
    };

    this.paneManager = new PaneManager(paneManagerMappings);
    $("home_pane_button").click();

    // add creations
    createIdentityPane();
    createHomePane();
    createSharedRecoveryPane();
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
      passwordMissmatchAlert();
      return;
    }

    disableStatus([password_once, password_twice], true);

    let password = password_once.value;
    container.changePassword(password).then(() => {
      log("password changed");
      container.save();
      new DOMAlert("info", "Successfully changed passwords!", notification_container);
      disableStatus([password_once, password_twice], false);
    }, (error) => {
      new DOMAlert("danger", "Failed to change password:\n" + error, notification_container)
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
      passwordMissmatchAlert();
      return;
    }

    disableStatus([password_once, password_twice], true);
    if(container.openSlot == null) {
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

function updateEverything() {
  updateSettingsPane();
  updateIdentityPane();
}

function passwordMissmatchAlert() {
  new DOMAlert("danger", "Passwords don't match", notification_container);
}

function createHomePane() {

}

function updateSettingsPane() {
  log("updateIdentityPane");
  let infoStrings = {
    "info_slot_open": "Slot open: {}",
  }

  let slot = container.openSlot == null ? "null" : container.openSlot.toString();
  $("info_slot_open").textContent = infoStrings["info_slot_open"].replace("{}", slot);

  // add containers for show_conatiners
  let show_slots = $("show_slots");

  //remove all children
  removeAllChildren(show_slots);

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

function createIdentityPane() {
  log(createIdentityPane);
  $("identity_select").addEventListener("change", changeIdentity);
  $("add_identity_button").addEventListener("click", addIdentity);
  $("remove_identity_button").addEventListener("click", removeCurrentIdentity);
  $("edit_identity_form_name").addEventListener("input", identityUpdate);
  $("edit_identity_form_desc").addEventListener("input", identityUpdate);
}

function updateIdentityPane() {
  log("updateIdentityPane");
  //get identities
  let identities = container.getIdentites();
  let CurrentIdentity = identities[currentIdentity];

  // set identity data
  ($("edit_identity_form_name") as HTMLInputElement).value =
    $("pane_identity_field_name").textContent =
    CurrentIdentity.identityName;

  ($("edit_identity_form_desc") as HTMLInputElement).value =
    $("pane_identity_field_desc").textContent =
    CurrentIdentity.identityDesc;

  // remove old identities
  let identity_select = $("identity_select") as HTMLSelectElement;
  removeAllChildren(identity_select);

  // populate the select
  for(let index = 0; index < identities.length; index++) {
    let selectOption = document.createElement("option");
    selectOption.textContent = identities[index].identityName;
    selectOption.value = index.toString();
    identity_select.appendChild(selectOption);
  }

  identity_select.options[currentIdentity].selected = true;
}

function changeIdentity() {
  let identity_select = $("identity_select") as HTMLSelectElement;
  currentIdentity = Number.parseInt(identity_select.options[identity_select.selectedIndex].value);
  updateIdentityPane();
}

function addIdentity() {
  let identityName = ($("add_identity_form_name") as HTMLInputElement).value;
  let identityDesc = ($("add_identity_form_desc") as HTMLInputElement).value;

  let identityData = {
    "accounts": [],
    "identityName": identityName,
    "identityDesc": identityDesc,
  }

  let identityObject = new Identity(JSON.stringify(identityData));
  try{
    container.addIdentity(identityObject);
    new DOMAlert("success", "Added new identity: " + identityObject.identityName, notification_container);
  } catch(error) {
    new DOMAlert("warning", "Failed to add identity", notification_container);
  }

  updateIdentityPane();
}

function removeCurrentIdentity() {
  log("removeCurrentIdentity");
  try{
    if(container.identities == null) throw "Identities are null";
    if(container.identities.length == 1) throw "This is the only identity";
    container.removeIdentity(currentIdentity);
    currentIdentity = 0;
    new DOMAlert("success", "Removed current identity", notification_container);
  } catch(error) {
    new DOMAlert("danger", error, notification_container);
  }
  updateIdentityPane();
}

function identityUpdate() {
  log("identityUpdate");
  try{
    if(container.identities == null) throw "Container is null";
    container.identities[currentIdentity].identityName = ($("edit_identity_form_name") as HTMLInputElement).value;
    container.identities[currentIdentity].identityDesc = ($("edit_identity_form_desc") as HTMLInputElement).value;
    container.save();
  } catch(error) {
    new DOMAlert("warning", "Could not update container:\n"+error, notification_container);
  }

  updateIdentityPane();
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

var bipRevealed = false;
function revealBip() {
  if(bipRevealed) return;
  bipRevealed = true;

  let words = Bip.generateFromUint8Array(container.getMasterKey());
  let bip = $("bip");
  removeAllChildren(bip);

  for(let word = 0; word < words.length; word++) {
    let currentWord = words[word];

    let bipElement = document.createElement("p");
    bipElement.classList.add("mx-3");
    if(currentWord.underlined) bipElement.classList.add("text-decoration-underline");
    bipElement.textContent = (word + 1) + ". " + currentWord.text;

    bip.appendChild(bipElement);
  }

  $("reveal_bip").remove();
}

function sharedRecoveryUpDownEvent() {
  log("sharedRecoveryUpDownEvent");
  let pieces = $("recovery_pieces") as HTMLInputElement;
  let threshold = $("recovery_threshold") as HTMLInputElement;
  let piecesValue = Number.parseInt(pieces.value);
  let thresholdValue = Number.parseInt(threshold.value);

  // ensure minimum
  piecesValue = piecesValue < 2 ? 2 : piecesValue;
  thresholdValue = thresholdValue < 2 ? 2 : thresholdValue;
  
  // make sure that threshold is at least pieces
  thresholdValue = thresholdValue > piecesValue ? piecesValue : thresholdValue;
  
  // return values
  pieces.value = piecesValue.toString();
  threshold.value = thresholdValue.toString();
}

function createSharedRecoveryPane() {
  // up down change
  $("recovery_pieces").addEventListener("change", sharedRecoveryUpDownEvent);
  $("recovery_threshold").addEventListener("change", sharedRecoveryUpDownEvent);

  // previous next
  $("generate_shared_recovery_previous").addEventListener("click", sharedRecoveryPrevious);
  $("generate_shared_recovery_next").addEventListener("click", sharedRecoveryNext);
}

var shamirChunks = null as null | ShamirChunk[];
function createSharedRecovery() { 
  // get data and make
  log("createSharedRecovery");
  let pieces = $("recovery_pieces") as HTMLInputElement;
  let threshold = $("recovery_threshold") as HTMLInputElement;
  let piecesValue = Number.parseInt(pieces.value);
  let thresholdValue = Number.parseInt(threshold.value);
  let masterKey = container.getMasterKey();

  log("mk:");
  log(masterKey);
  log("pieces: " + piecesValue);
  log("thresh: " + thresholdValue);

  shamirChunks = generateBIPs(masterKey, piecesValue, thresholdValue);
  log(shamirChunks);

  // make fields visible
  $("generate_shared_recovery_screen").classList.remove("d-none");
  updateRecoveryScreen(); 
}

function updateRecoveryScreen() {
  checkRecoveryPage();
  if(shamirChunks == null) throw "shamirChunks are undefined";
  log("updateRecoveryScreen p:" + page);

  // make
  let shamirChunk = shamirChunks[page];
  let words = shamirChunk.makeBIP(Bip);

  // assign
  $("generate_shared_recovery_title").textContent = "Piece number: " + shamirChunk.part.toString();
  let bipDiv = $("generate_shared_recovery_bip");
  removeAllChildren(bipDiv);

  // display
  for(let word = 0; word < words.length; word++) {
    let currentWord = words[word];

    let bipElement = document.createElement("p");
    bipElement.classList.add("mx-3");
    if(currentWord.underlined) bipElement.classList.add("text-decoration-underline");
    bipElement.textContent = (word + 1) + ". " + currentWord.text;

    bipDiv.appendChild(bipElement);
  }
}

var page = 0;
function sharedRecoveryNext() {
  log("sharedRecoveryNext");
  page++;
  updateRecoveryScreen();
}

function sharedRecoveryPrevious() {
  log("sharedRecoveryNext");
  page--;
  updateRecoveryScreen();
}

function checkRecoveryPage() {
  let next = $("generate_shared_recovery_next") as HTMLInputElement;
  let previous = $("generate_shared_recovery_previous") as HTMLInputElement;
  previous.disabled = next.disabled = false;

  if(shamirChunks == null) page = 0;
  else {
    page = page < 0 ? 0 : page;
    page = page >= shamirChunks.length ? shamirChunks.length - 1 : page;

    next.disabled = page == shamirChunks.length - 1; // last page
    previous.disabled = page == 0; //first page
  }
}
