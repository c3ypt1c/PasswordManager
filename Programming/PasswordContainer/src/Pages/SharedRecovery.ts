import {getStoredContainer} from "./../crypto/Container.js";
import {log, algorithmBytes, convertFromUint8Array} from "./../crypto/Functions.js";
import {$, $$, $$$, disableStatus, goTo} from "./../DOM/DOMHelper.js";
import {DOMAlert} from "./../DOM/DOMAlert.js";
import { BIP, Word } from "../Recovery/BIP.js";

const bip = new BIP();

let container = getStoredContainer();
let encryptionType = container.encryptionType
let blocksNeed = algorithmBytes(encryptionType) / 2;

export class SharedRecovery {
constructor() {
    log("WordRecovery");
    log(encryptionType);
    log(blocksNeed);

    generatePages();

    // action listsner for button
    $("submit").addEventListener("click", submit);
  }
}

function generatePage(into: HTMLElement, pageNumber : Number) {
  let checkboxes = [] as string[];
  let textfields = [] as string[];

  for(let i = 1; i <= blocksNeed; i++) {
    let flexDiv = document.createElement("div");
    flexDiv.classList.add("d-flex", "flex-row", "flex-nowrap", "mx-auto", "mb-3", "form-check", "needs-validation");

    // Main elements
    let label = document.createElement("label") as HTMLLabelElement;
    label.classList.add("text-center", "mx-1", "mt-auto", "mb-auto");
    label.textContent = i + ". ";

    let checkbox = document.createElement("input") as HTMLInputElement;
    checkbox.classList.add("d-inline", "mx-1", "mt-auto", "mb-auto");
    checkbox.id = "ch_p_" + pageNumber + "_n_" + i;
    checkbox.type = "checkbox";

    let textfield = document.createElement("input") as HTMLInputElement;
    textfield.classList.add("d-inline", "mx-1", "mt-auto", "mb-auto", "form-control", "is-invalid");
    textfield.id = "tf_p_" + pageNumber + "_n_" + i;
    textfield.type = "text";

    // Add listeners
    checkbox.addEventListener("click", () => {
      if(checkbox.checked) textfield.classList.add("text-decoration-underline");
      else textfield.classList.remove("text-decoration-underline");
    });

    textfield.addEventListener("input", () => {
      log("checking word: " + textfield.value);
      if(bip.isWordValid(textfield.value)) {
        textfield.classList.add("is-valid");
        textfield.classList.remove("is-invalid");
      } else {
        textfield.classList.remove("is-valid");
        textfield.classList.add("is-invalid");
      }
    });

    // Combine
    flexDiv.appendChild(label);
    flexDiv.appendChild(checkbox);
    flexDiv.appendChild(textfield);
    into.appendChild(flexDiv);

    // add to the list
    checkboxes.push(checkbox.id);
    textfields.push(textfield.id);
  }

  return {checkboxes, textfields};
}

let currentPage = 0;
let numberOfPages = 2;
let pageElements = {} as { [page : number] : {checkboxes : string[], textfields : string[]}};
function generatePages() {
  log("generate pages");
  // make blocks
  let recovery_pieces = $("recovery_pieces") as HTMLInputElement;
  numberOfPages = Number.parseInt(recovery_pieces.value);

  let pages = $("pages");

  for(let i = 1; i <= numberOfPages; i++) {
    console.log("making page {i} of {d}".replace("{i}", i.toString()).replace("{d}", numberOfPages.toString()));
    // make host element
    let page = document.createElement("div");
    page.classList.add("d-flex","flex-row","flex-wrap");

    // make title
    let title = document.createElement("h3");
    title.textContent = "Page number: " + i;
    title.classList.add("w-100");
    page.appendChild(title);

    // make div for missing option
    let missingDiv = document.createElement("div");
    missingDiv.classList.add("w-100", "mb-3");

    // make the missing label
    let missingLabel = document.createElement("label") as HTMLLabelElement;
    missingLabel.textContent = "Is this piece missing?: "
    missingLabel.classList.add("d-inline-block", "my-auto");
    missingDiv.appendChild(missingLabel);

    // make the missing option
    let missing = document.createElement("input") as HTMLInputElement;
    missing.type = "checkbox";
    missing.classList.add("d-inline-block", "my-auto", "ms-3");
    
    missingDiv.appendChild(missing);
    page.appendChild(missingDiv);

    // make form
    pageElements[i] = generatePage(page, i);

    // handle missing click event
    missing.addEventListener("click", () => {
      log("changed");
      log(pageElements[i].checkboxes);
      log(pageElements[i].textfields);
      disableStatus($$(pageElements[i].checkboxes) as HTMLInputElement[], missing.checked); 
      disableStatus($$(pageElements[i].textfields) as HTMLInputElement[], missing.checked); 
    })

    // add host
    pages.appendChild(page);
    log("made.");
  }

}

function updatePageScreen() {
  checkPage()
}

// Page controls
function sharedRecoveryNext() {
  log("sharedRecoveryNext");
  currentPage++;
  updatePageScreen();
}

function sharedRecoveryPrevious() {
  log("sharedRecoveryNext");
  currentPage--;
  updatePageScreen();
}

function checkPage() {
  let next = $("generate_shared_recovery_next") as HTMLInputElement;
  let previous = $("generate_shared_recovery_previous") as HTMLInputElement;
  previous.disabled = next.disabled = false;

  currentPage = currentPage < 0 ? 0 : currentPage;
  currentPage = currentPage >= numberOfPages ? numberOfPages - 1 : currentPage;

  next.disabled = currentPage == numberOfPages - 1; // last page
  previous.disabled = currentPage == 0; //first page
}

function submit() {
  /*
  // make words
  let words = [];
  let valid = true;
  for(let i = 1; i <= textfields.length; i++) {
    let checkbox = $("ch_id_" + i) as HTMLInputElement;
    let textfield = $("tx_id_" + i) as HTMLInputElement;
    let word = new Word(textfield.value, checkbox.checked);
    valid = valid && word.checkWord(bip);
    if(!valid) break;
    words.push(word);
  }

  if(!valid) {
    // throw gang sign
    new DOMAlert("warning", "One or more fields are invalid. Check them please.", $("notification_container"));
  } else {
    log("success");

    // lock everything
    let lock = $$$(checkboxes, textfields); 
    lock.push($("submit"));
    disableStatus(lock as HTMLInputElement[], true);

    // make bip from words
    let masterKey = bip.generateFromWords(words);
    container.externalUnlock(masterKey).then(() => {
      // success
      let jsonMasterKey = JSON.stringify(convertFromUint8Array(masterKey));
      log("sending: ");
      log(jsonMasterKey);
      window.sessionStorage.setItem("InternetNomadMasterKey", jsonMasterKey)
      goTo("PasswordManager.html");
    }, (error) => {
      // fail
      disableStatus(lock as HTMLInputElement[], false);
      new DOMAlert("danger", "Could not open container externally because: " + error + ".\n\nPlease double check the recovery", $("notification_container"));
    });
  }
  */
}

