import { $, $$, disableStatus, goTo } from "./../../DOM/DOMHelper.js";
import { Container, deleteContainer } from "../../crypto/Container.js";
import { log } from "../../Functions.js";
import { Pane } from "./Pane.js";


let login_fields = $$(["login_password", "login_submit", "login_shared_recovery", "login_word_recovery", "login_restart"]) as HTMLInputElement[];

let container : Container;

export class LoginPane extends Pane {
  constructor(container_ : Container) {
    super("login_pane", "login_pane_button");
    log("Login.ts inserted");

    // set container
    container = container_; 

    //assign listeners
    $("login_submit").addEventListener("click", login_submitButtonListener);
    $("login_word_recovery").addEventListener("click", login_wordRecoveryButtonListener);
    $("login_shared_recovery").addEventListener("click", login_sharedRecoveryButtonListener);
    $("login_restart").addEventListener("click", login_deleteDataButtonListener);
  }

  updatePane() {
    // restart password
    ($("login_password") as HTMLInputElement).value = "";
  }
  
}

async function login_submitButtonListener() {
  // disable everything
  disableStatus(login_fields, true);
  //showLoader();

  // get password
  let password = ($("login_password") as HTMLInputElement).value;

  // attempt decryption
  try {
    // password correct
    await container.unlock(password);
    log("Conatiner unlocked successfully");
  } catch (e) {
    // Invalid password
    ($("login_password") as HTMLInputElement).value = "";
    disableStatus(login_fields, false);
    throw e;
  }
}

function login_sharedRecoveryButtonListener() {
  goTo("SharedRecovery.html");
}

function login_wordRecoveryButtonListener() {
  goTo("WordRecovery.html");
}

function login_deleteDataButtonListener() {
  // TODO: show warning first.
  deleteContainer();
  goTo("CreateContainer.html");
}
