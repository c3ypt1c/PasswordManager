import {getStoredContainer, Container} from "./../crypto/Container.js";
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


      // hide loader
      containerUnlocked();
    }, (error) => {throw error});

    // Do other housekeeping...
    $("logout").addEventListener("click", this.logout);
    $("change_password").addEventListener("click", this.changePassword);
  }

  logout() {
    container.save(); // update and lock the container
    goTo("Login.html");
  }

  changePassword() {
    log("changing password");
    // get passwords
    let password_once = $("password_once") as HTMLInputElement;
    let password_twice = $("password_twice") as HTMLInputElement;

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

}

function containerUnlocked() {
  $("loader").style.opacity = "0";
  $("loader").style.zIndex = "-999";
}
