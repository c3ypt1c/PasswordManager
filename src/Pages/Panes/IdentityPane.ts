import { Container } from "../../Crypto/Container.js";
import { Identity } from "../../Crypto/Identity.js";
import { DOMAlert } from "../../DOM/DOMAlert.js";
import { DOMConfirm } from "../../DOM/DOMConfirm.js";
import { removeAllChildren, $ } from "../../DOM/DOMHelper.js";
import { log } from "../../Functions.js";
import { HomePane } from "./HomePane.js";
import { Pane } from "./Pane.js";

let container : Container;
let homePane : HomePane;
let currentIdentity = 0;

/**
 * This class is an abstraction of the identity pane. 
 * This pane is reponsible for switching and chaning information about the identities.
 */
export class IdentityPane extends Pane {
    
    constructor(container_ : Container, homePane_ : HomePane) {
        super("identity_pane", "identity_pane_button");
        container = container_;
        homePane = homePane_;

        log(this);
        $("identity_select").addEventListener("change", changeIdentity);
        $("add_identity_button").addEventListener("click", addIdentity);
        $("remove_identity_button").addEventListener("click", askToRemove);
        $("edit_identity_form_name").addEventListener("input", identityUpdate);
        $("edit_identity_form_desc").addEventListener("input", identityUpdate);

        this.updatePane();
    }

    updatePane(data?: any): void {
        updateIdentityPane();
    }
}

/**
 * Ask to remove current identity
 */
function askToRemove() {
  new DOMConfirm( () => removeCurrentIdentity(), () => {}, "Delete Identity?", "Are you sure you want to delete the current identity '{}'? All of the accounts and information stored in this identity will be deleted!".replace("{}", container.getIdentites()[currentIdentity].identityName), "Delete Identity", "Cancel");
}

/**
 * Update current screen
 */
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
    for (let index = 0; index < identities.length; index++) {
      let selectOption = document.createElement("option");
      selectOption.textContent = identities[index].identityName;
      selectOption.value = index.toString();
      identity_select.appendChild(selectOption);
    }
  
    identity_select.options[currentIdentity].selected = true;
  
    homePane.updatePane(currentIdentity);
  }
  
  /**
   * Identitiy has changed listener
   */
  function changeIdentity() {
    let identity_select = $("identity_select") as HTMLSelectElement;
    currentIdentity = Number.parseInt(identity_select.options[identity_select.selectedIndex].value);
    updateIdentityPane();
  }
  
  /**
   * Add new identity
   */
  function addIdentity() {
    let identityName = ($("add_identity_form_name") as HTMLInputElement).value;
    let identityDesc = ($("add_identity_form_desc") as HTMLInputElement).value;
  
    let identityData = {
      "accounts": [],
      "identityName": identityName,
      "identityDesc": identityDesc,
    }
  
    let identityObject = new Identity(JSON.stringify(identityData));
    try {
      container.addIdentity(identityObject);
      new DOMAlert("success", "Added new identity: " + identityObject.identityName);
    } catch (error) {
      new DOMAlert("warning", "Failed to add identity");
    }
  
    updateIdentityPane();
  }
  
  /**
   * Remove current identity
   */
  function removeCurrentIdentity() {
    log("removeCurrentIdentity");
    try {
      if (container.identities == null) throw "Identities are null";
      if (container.identities.length == 1) throw "This is the only identity";
      container.removeIdentity(currentIdentity);
      currentIdentity = 0;
      new DOMAlert("success", "Removed current identity");
    } catch (error) {
      new DOMAlert("danger", error);
    }
    updateIdentityPane();
  }
  
  /**
   * Update current identity with the info provided by the user
   */
  function identityUpdate() {
    log("identityUpdate");
    try {
      if (container.identities == null) throw "Container is null";
      container.identities[currentIdentity].identityName = ($("edit_identity_form_name") as HTMLInputElement).value;
      container.identities[currentIdentity].identityDesc = ($("edit_identity_form_desc") as HTMLInputElement).value;
      container.save();
    } catch (error) {
      new DOMAlert("warning", "Could not update container:\n" + error);
    }
  
    updateIdentityPane();
  }