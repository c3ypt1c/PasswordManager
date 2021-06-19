import {Container} from "./../crypto/Container.js";

class Login {
  constructor() {
    console.log("Login.ts inserted");
    // Check if container exists

    let container = new Container();
    if(container.isEmpty) {
      // No data in container
      document.location.href = "CreateContainer.html";
      // Move to container creation to continue
    }

    // Container has data...

  }
}

export {Login};
