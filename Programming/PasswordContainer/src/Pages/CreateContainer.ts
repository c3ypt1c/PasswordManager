import {} from "./../crypto/Container.js";
import {$, $$} from "./../DOMHelper.js";

function calculateMemoryFunction(x : number) { // slider to GB
  // Formula: https://www.desmos.com/calculator/prdhmckdzx
  let a = 2 ** 0.25;
  return a ** (x - 9);
}

function calculateMemory() {
  // Find system memory
  let memory_amount_notifier = $("memory_amount_notifier");
  let argon2_memory = $("argon2_memory") as HTMLInputElement;
  let memory_label_string = "We will use {} of memory";

  let memory_amount = Number.parseFloat(argon2_memory.value);
  let memory_amount_calculated = calculateMemoryFunction(memory_amount);

  //console.log("Memory amount: " + memory_amount);
  //console.log("Memory calculated: " + memory_amount_calculated);

  let memory_amount_formatted = memory_amount_calculated > 1 ?
   Math.round(memory_amount_calculated * 10) / 10 + "Gb" :
   Math.round(memory_amount_calculated * 1024) + "Mb";

  memory_amount_notifier.textContent = memory_label_string.replace("{}", memory_amount_formatted);

}

class CreateContainer {
  constructor() {
    // submit button
    $("submitButton").addEventListener("click", this.submitListener);

    // Add argon2 specific listeners
    let argonElements = $$(["kdf_argon2", "kdf_pbudf2", "argon2_auto_memory"]);
    for(let element = 0; element < argonElements.length; element++) {
      argonElements[element].addEventListener("click", this.argon2_options_listener);
    }

    // add time listener


    // add calculator listener
    ($("argon2_memory") as HTMLInputElement).addEventListener("input", calculateMemory);

    // Fire some listeners
    this.argon2_options_listener();
    calculateMemory();
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

    calculateMemory();
  }

  time_listener() {

  }

}

export {CreateContainer};
