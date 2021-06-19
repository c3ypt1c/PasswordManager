import {} from "./../crypto/Container.js";
import {$} from "./../DOMHelper.js";

class CreateContainer {
  constructor() {
    let button = $("submitButton");
    if(button != null) {
      button.addEventListener("click", this.submitListener);
    } else throw "Button is null";
  }

  submitListener() {
    // get ciphers
    let cipher_serpent = $("cipher_serpent");
    let cipher_blowfish = $("cipher_blowfish");
    let cipher_aes = $("cipher_aes");

    // Get KDFs
    let kdf_argon2 = $("kdf_argon2");
    let kdf_pbudf2 = $("kdf_pbudf2");

    // get passwords
    let password_once = $("password_once");
    let password_twice = $("password_twice");

    // Compare

    // if different throw error

    // Make keys and container

  }

}

export {CreateContainer};
