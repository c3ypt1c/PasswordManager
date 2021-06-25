import {storageHasContainer} from "./../crypto/Container.js";

class Login {
  constructor() {
    console.log("Login.ts inserted");
    // Check if container exists

    if(!storageHasContainer()) {
      // No data in container
      document.location.href = "CreateContainer.html";
      // Move to container creation to continue
    }

    // Container has data...

  }
}

export {Login};
