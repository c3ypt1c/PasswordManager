import {storageHasContainer, getStoredContainer, Container} from "./../crypto/Container.js";
import {$, $$} from "./../DOMHelper.js";

let fields = $$(["password", "button"]);

class Login {
  container : Container;
  constructor() {
    console.log("Login.ts inserted");
    debugger;
    // Check if container exists

    if(!storageHasContainer()) {
      // No data in container
      document.location.href = "CreateContainer.html";
      // Move to container creation to continue
    }

    // Container has data...
    try {
      getStoredContainer();
    } catch {
      document.location.href = "CreateContainer.html";
    }

    this.container = getStoredContainer();

    //
  }

  async submitButtonListener() {
    //disable everything

  }
}

export {Login};
