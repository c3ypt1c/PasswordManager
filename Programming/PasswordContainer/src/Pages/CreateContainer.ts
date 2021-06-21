import {} from "./../crypto/Container.js";
import {$, $$} from "./../DOMHelper.js";
const Crypto = require("crypto");
const CryptoJS = require("crypto-js");
//const CryptoTS = require("crypto-ts"); //TODO: CryptoTS currently breaks, please fix
const Argon2 = require("argon2");


function calculateMemoryFunction(x : number) { // slider to GB
  // Formula: https://www.desmos.com/calculator/pchhyi5zfu
  let a = 2 ** 0.25;
  return a ** (x - 9) / 5;
}

function calculateMemory() {
  // Find system memory
  let memory_amount_notifier = $("memory_amount_notifier");
  let argon2_memory = $("argon2_memory") as HTMLInputElement;
  let memory_label_string = "We will use {} of memory.";

  let memory_amount;

  if(!($("kdf_argon2") as HTMLInputElement).checked) {
    // not the argon2 algorithm
    memory_amount = 1 / 1024; //1MB
  } else if(($("argon2_auto_memory") as HTMLInputElement).checked) {
    // calculate memory automatically (25, 0.5, 1, 2, 4 & 8 gigabytes)
    let memoryInGB = (navigator as any).deviceMemory as number; // manual override for TS

    // get lowerbound
    memory_amount = memoryInGB / 2;

  } else {
    // get memory from slider
    memory_amount = Number.parseFloat(argon2_memory.value);
    memory_amount = calculateMemoryFunction(memory_amount);
  }

  memory_amount = memory_amount > calculateMemoryFunction(20) ? calculateMemoryFunction(20) : memory_amount;
  //let memory_amount_calculated = calculateMemoryFunction(memory_amount);

  console.log("Memory calculated: " + memory_amount);

  let memory_amount_formatted = memory_amount > 1 ?
   Math.round(memory_amount * 10) / 10 + "Gb" :
   Math.round(memory_amount * 1024) + "Mb";

  memory_amount_notifier.textContent = memory_label_string.replace("{}", memory_amount_formatted);

  return memory_amount * 1024;
}

class CreateContainer {
  constructor() {
    // submit button
    $("submitButton").addEventListener("click", this.submitListener);

    // Add argon2 specific listeners
    let argonElements = $$(["kdf_argon2", "kdf_PBKDF2", "argon2_auto_memory"]);
    for(let element = 0; element < argonElements.length; element++) {
      argonElements[element].addEventListener("click", this.argon2_options_listener);
    }

    // add time listener
    $("time").addEventListener("input", this.time_listener);

    // add calculator listener
    ($("argon2_memory") as HTMLInputElement).addEventListener("input", calculateMemory);

    // Fire some listeners
    this.argon2_options_listener();
    this.time_listener();
    calculateMemory();

    console.log(CryptoJS);
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
    let time_string = "{} second";
    let timeInSeconds = ($("time") as HTMLInputElement).value;
    time_string += timeInSeconds == "1" ? "." : "s."; //add the "s" to "second".
    $("time_label").textContent = time_string.replace("{}", timeInSeconds);
    return timeInSeconds;
  }

  async submitListener() {
    // get all inputs
    // get ciphers
    let cipher_serpent = $("cipher_serpent") as HTMLInputElement;
    let cipher_blowfish = $("cipher_blowfish") as HTMLInputElement;
    let cipher_aes = $("cipher_aes") as HTMLInputElement;

    // Get KDFs
    let kdf_argon2 = $("kdf_argon2") as HTMLInputElement;
    let kdf_PBKDF2 = $("kdf_PBKDF2") as HTMLInputElement;

    // Get memory and time
    let time = $("time") as HTMLInputElement;
    let memory = calculateMemory(); //memory in MB


    // get passwords
    let password_once = $("password_once") as HTMLInputElement;
    let password_twice = $("password_twice") as HTMLInputElement;

    // Compare
    if(password_once.value != password_twice.value) {
      // TODO: if different throw error

      return;
    }

    let password = password_once.value;
    let salt = Crypto.randomBytes(16);
    let kdf : "Argon2" | "PBKDF2";
    let iterations = 100_000;

    if(kdf_argon2.checked) kdf = "Argon2";
    else if(kdf_PBKDF2.checked) kdf = "PBKDF2"
    else throw "Could not find specificed algorithm";

    // Benchmark TODO: move to worker
    let start;
    let end;
    // console.log(CryptoJS);
    if(kdf == "Argon2") {
      // current memory is in MB, need to convert it to MiB
      memory = memory * 1024; // KB
      memory = memory * 1024; // Bytes
      memory = memory / 1000; // KiB
      memory = Math.round(memory);

      iterations = 100;
      let optionals = {
        type: Argon2.argon2id,
        memoryCost: memory,
        timeCost: iterations
      }

      console.log("will submit: ");
      console.log(optionals);

      start = performance.now();
      await Argon2.hash(password, optionals);
      end =  performance.now();

    } else if (kdf == "PBKDF2") {

      let optionals = {keySize: 16, iterations: iterations};
      console.log("will submit: ");
      console.log(password);
      console.log(salt.toString("base64")); //TODO: Convert to native instead of string
      console.log(optionals);
      start = performance.now();
      CryptoJS.PBKDF2(password, salt.toString("hex"), optionals); //https://github.com/brix/crypto-js/blob/develop/src/pbkdf2.js#L120
      end = performance.now();

    } else throw "Could not find specificed algorithm";

    // output result
    let timeTaken = end - start;
    let targetTime = Number.parseFloat(time.value) * 1000;
    let timeScale = targetTime / timeTaken;
    let timeScaledIterations = Math.round(timeScale * iterations);

    let result = "Took {time}ms to hash {its} iterations.";
    result += "\nAssuming {new} ({scale} scale) will take {new_time}ms";
    result = result.replace("{time}", (Math.round( (timeTaken) * 10) / 10).toString());
    result = result.replace("{its}", iterations.toString());
    result = result.replace("{new}", timeScaledIterations.toString());
    result = result.replace("{scale}", timeScale.toString());
    result = result.replace("{new_time}", targetTime.toString());

    console.log(result);

    // verify result
    if(kdf == "Argon2") {
      let optionals = {
        type: Argon2.argon2id,
        memoryCost: memory,
        timeCost: timeScaledIterations
      }

      console.log("will submit: ");
      console.log(optionals);

      start = performance.now();
      await Argon2.hash(password, optionals);
      end =  performance.now();

    } else if (kdf == "PBKDF2") {

      let optionals = {keySize: 16, iterations: timeScaledIterations};
      console.log("will submit: ");
      console.log(password);
      console.log(salt.toString("base64")); // TODO: Convert to native instead of string
      console.log(optionals);
      start = performance.now();
      CryptoJS.PBKDF2(password, salt.toString("hex"), optionals); // https://github.com/brix/crypto-js/blob/develop/src/pbkdf2.js#L120
      end = performance.now();

    } else throw "Could not find specificed algorithm";

    timeTaken = end - start;
    result = "It took {ms}ms to do {iter} iterations";
    result = result.replace("{ms}", timeTaken.toString());
    result = result.replace("{iter}", timeScaledIterations.toString());
    console.log(result);



  }

}

export {CreateContainer};
