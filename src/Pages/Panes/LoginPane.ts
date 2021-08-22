import { $, $$, disableStatus } from "./../../DOM/DOMHelper.js";
import { Container, deleteContainer } from "./../../Crypto/Container.js";
import { log } from "./../../Functions.js";
import { Pane } from "./Pane.js";
import { DOMConfirm } from "../../DOM/DOMConfirm.js";


let login_fields = $$(["login_password", "login_submit", "login_shared_recovery", "login_word_recovery", "login_restart"]) as HTMLInputElement[];

var container : Container;

/**
 * This pane acts as a login screen
 */
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

  /**
   * The password unlocks the container
   */
  unlocked() {
    this.onChange();
  }

  /**
   * Set start loading action
   * @param action action to run when loading
   */
  setOnLoadingStartedAction(action : Function) {
    this.onLoadingStartedAction = action;
  }

  /**
   * Set start stop loading action
   * @param action action to run when finished loading
   */
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

/**
 * listener for the login button
 * @param sender 
 */
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

/**
 * Delete the container listner
 */
function login_deleteDataButtonListener() {
  new DOMConfirm(() => {deleteContainer(); window.close();}, () => {}, "Delete container?", "Are you sure that you want to delete and recreate your container? This will remove all of your data! If you hit yes, the password manager will close. After the close, please reopen the Password Manager again.");
}
