import {} from "./../crypto/Container.js";
import {$, $$} from "./../DOMHelper.js";

class CreateContainer {
  constructor() {
    let button = $("submitButton");
    button.addEventListener("click", this.submitListener);

    // Add argon2 specific listeners
    let argonElements = $$(["kdf_argon2", "kdf_pbudf2", "argon2_auto_memory"]);
    for(let element = 0; element < argonElements.length; element++) {
      argonElements[element].addEventListener("click", this.argon2_options_listener);
    }
  }

  submitListener() {
    // get all inputs
    // get ciphers
    let cipher_serpent = $("cipher_serpent") as HTMLInputElement;
    let cipher_blowfish = $("cipher_blowfish") as HTMLInputElement;
    let cipher_aes = $("cipher_aes") as HTMLInputElement;

    // Get KDFs
    let kdf_argon2 = $("kdf_argon2") as HTMLInputElement;
    let kdf_pbudf2 = $("kdf_pbudf2") as HTMLInputElement;

    // get passwords
    let password_once = $("password_once") as HTMLInputElement;
    let password_twice = $("password_twice") as HTMLInputElement;

    // Compare

    // if different throw error

    // Make keys and container

  }

  argon2_options_listener() {
    let kdf_argon2 = $("kdf_argon2") as HTMLInputElement;
    let argon2_memory = $("argon2_memory") as HTMLInputElement;
    let argon2_auto_memory = $("argon2_auto_memory") as HTMLInputElement;

    if(kdf_argon2.checked) {
      // auto memory
      argon2_auto_memory.disabled = false;

      // memory slider
      argon2_memory.disabled = argon2_auto_memory.checked;
      if(argon2_memory.disabled) argon2_memory.value = "0";
      
    } else {
      // auto memory
      argon2_auto_memory.disabled = true;
      argon2_auto_memory.checked = false;

      // memory slider
      argon2_memory.value = "0";
      argon2_memory.disabled = true;
    }

  }

}

export {CreateContainer};
