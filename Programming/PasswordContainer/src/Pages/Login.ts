import {storageHasContainer, getStoredContainer, deleteContainer, Container} from "./../crypto/Container.js";
import {$, $$, disableStatus, goTo} from "./../DOMHelper.js";

let fields = $$(["password", "submit", "shared_recovery", "word_recovery", "restart"]) as HTMLInputElement[];

class Login {
  constructor() {
    console.log("Login.ts inserted");
    debugger;
    // Check if container exists

    if(!storageHasContainer()) {
      // No data in container
      goTo("CreateContainer.html");
      // Move to container creation to continue
    }

    // Container has data...
    try {
      getStoredContainer();
    } catch {
      // if corrupted
      goTo("CreateContainer.html");
    }

    // if not corrupted continue

    //assign listeners
    $("submit").addEventListener("click", submitButtonListener);
    $("word_recovery").addEventListener("click", wordRecoveryButtonListener);
    $("shared_recovery").addEventListener("click", sharedRecoveryButtonListener);
    $("restart").addEventListener("click", deleteDataButtonListener);
  }
}

async function submitButtonListener() {
  // disable everything
  disableStatus(fields, true);

  // get password
  let password = ($("password") as HTMLInputElement).value;

  // attempt decryption
  let container = getStoredContainer() as Container;
  try {
    await container.unlock(password);
    console.log("Conatiner unlocked successfully");
    goTo("PasswordManager.html");
  } catch(e) {
    // Throw error

    // restart password field
    ($("password") as HTMLInputElement).value = "";
    disableStatus(fields, false);
  }
}

function sharedRecoveryButtonListener() {
  goTo("SharedRecovery.html");
}

function wordRecoveryButtonListener() {
  goTo("WordRecovery.html");
}

function deleteDataButtonListener() {
  // TODO: show warning first.
  deleteContainer();
  goTo("CreateContainer.html");
}

export {Login};
