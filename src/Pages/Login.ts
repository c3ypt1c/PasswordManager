import { storageHasContainer, getStoredContainer, deleteContainer, Container } from "./../crypto/Container.js";
import { $, $$, disableStatus, goTo } from "./../DOM/DOMHelper.js";
import { log } from "./../Functions.js";

let fields = $$(["password", "submit", "shared_recovery", "word_recovery", "restart"]) as HTMLInputElement[];

class Login {
  constructor() {
    log("Login.ts inserted");
    // Check if container exists

    if (!storageHasContainer()) {
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
  showLoader();

  // get password
  let password = ($("password") as HTMLInputElement).value;

  // attempt decryption
  let container = getStoredContainer() as Container;
  try {
    await container.unlock(password);
    log("Conatiner unlocked successfully");

    // save the password temporarily
    window.sessionStorage.setItem("InternetNomadPassword", password);

    goTo("PasswordManager.html");
  } catch (e) {
    // TODO: Throw error

    // restart password field
    ($("password") as HTMLInputElement).value = "";
    hideLoader();
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

function showLoader() {
  let loader = $("loader");
  loader.style.opacity = "0.5";
  loader.style.zIndex = "999";
}

function hideLoader() {
  let loader = $("loader");
  loader.style.opacity = "0";
  loader.style.zIndex = "-999";
}

export { Login };
