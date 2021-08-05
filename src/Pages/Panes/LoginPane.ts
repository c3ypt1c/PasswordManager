import { $, $$, disableStatus, goTo } from "./../../DOM/DOMHelper.js";
import { Container, deleteContainer } from "./../../crypto/Container.js";
import { log } from "./../../Functions.js";
import { Pane } from "./Pane.js";


let login_fields = $$(["login_password", "login_submit", "login_shared_recovery", "login_word_recovery", "login_restart"]) as HTMLInputElement[];

var container : Container;

export class LoginPane extends Pane {
  onLoadingStartedAction ?: Function;
  onLoadingFinishedAction ?: Function;
  constructor(container_ : Container) {
    super("login_pane", "login_pane_button");
    log("Login.ts inserted");

    // set container
    container = container_; 

    //assign listeners
    $("login_submit").addEventListener("click", () => login_submitButtonListener(this) );
    $("login_word_recovery").addEventListener("click", () => $("word_recovery_button").click());
    $("login_shared_recovery").addEventListener("click", () => $("shared_recovery_button").click());
    $("login_restart").addEventListener("click", login_deleteDataButtonListener);
  }

  updatePane() {
    // restart password
    ($("login_password") as HTMLInputElement).value = "";
  }

  unlocked() {
    this.onChange();
  }

  setOnLoadingStartedAction(action : Function) {
    this.onLoadingStartedAction = action;
  }

  setOnLoadingFinishedAction(action : Function) {
    this.onLoadingFinishedAction = action;
  }

  onLoadingStarted() {
    if(this.onLoadingStartedAction) this.onLoadingStartedAction();
  }

  onLoadingFinished() {
    if(this.onLoadingFinishedAction) this.onLoadingFinishedAction();
  }
}

async function login_submitButtonListener(sender : LoginPane) {
  // disable everything
  disableStatus(login_fields, true);
  sender.onLoadingStarted();

  // get password
  let password = ($("login_password") as HTMLInputElement).value;
  if(password == null) throw "Password is null";

  // attempt decryption
  try {
    // password correct
    await container.unlock(password);
    log("Conatiner unlocked successfully");
    disableStatus(login_fields, false);
    sender.onLoadingFinished(); // just in case
    sender.unlocked();
  } catch (e) {
    // Invalid password
    ($("login_password") as HTMLInputElement).value = "";
    disableStatus(login_fields, false);
    sender.onLoadingFinished();
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
