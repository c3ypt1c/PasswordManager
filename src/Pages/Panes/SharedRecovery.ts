import { Container } from "./../../Crypto/Container.js";
import { algorithmBytes } from "./../../Crypto/CryptoFunctions.js";
import { log } from "./../../Functions.js";
import { $, $$, $$$, disableStatus, removeAllChildren } from "./../../DOM/DOMHelper.js";
import { DOMAlert } from "./../../DOM/DOMAlert.js";
import { BIP, Word } from "./../../Recovery/BIP.js";
import { recoverFromBIPs, ShamirChunk } from "./../../Recovery/Shamir.js";
import { Pane } from "./Pane.js";

let bip : BIP;
let container : Container;

export class SharedRecovery extends Pane {
  constructor(container_ : Container, BIP_ : BIP) {
    super("shared_recovery_pane", "shared_recovery_button");
    container = container_;
    bip = BIP_;
    log("WordRecovery");

    generatePages();

    // action listners
    $("shared_submit").addEventListener("click", () => this.submit());
    $("recovery_pieces").addEventListener("change", generatePages);
  }

  updatePane() {}

  submit() {
    // make words
    let allWords = {} as { [page: number]: Word[] };
    let entries = []
    let valid = true;
    log(pageElements);
    log(pageCheckboxes);
    main: for (let page = 1; page <= numberOfPages; page++) {
      log("scanning page: " + page);
      let missing = pageCheckboxes[page];
  
      // check if missing
      if (($(missing) as HTMLInputElement).checked) continue;
  
      let textfields = pageElements[page].textfields;
      let checkboxes = pageElements[page].checkboxes;
      entries.push(page);
  
      // create words for every element
      let words = [];
      for (let i = 0; i < textfields.length; i++) {
        let textfield = $(textfields[i]) as HTMLInputElement;
        let checkbox = $(checkboxes[i]) as HTMLInputElement;
        let word = new Word(textfield.value, checkbox.checked);
        valid = valid && word.checkWord(bip);
        if (!valid) {
          log("failed to parse Word:");
          log(word);
          break main;
        }
        words.push(word);
      }
  
      // move created words
      allWords[page] = words;
    }
  
    if (!valid) {
      // throw gang sign
      new DOMAlert("warning", "One or more fields are invalid. Check them please.", $("notification_container"));
  
    } else {
      log("success");
  
      // lock everything
      setAllFieldDisabled(true);
  
      // make Shamir from words
      let shamirChunks = [];
      for (let pageIndex = 0; pageIndex < entries.length; pageIndex++) {
        let page = entries[pageIndex];
        let words = allWords[page];
        let shamirChunk = new ShamirChunk(bip.generateFromWords(words), page);
        log("made chunk");
        log(shamirChunk);
        shamirChunks.push(shamirChunk);
      }
  
      setAllFieldDisabled(false);

      let masterKey = recoverFromBIPs(shamirChunks);
      container.externalUnlock(masterKey).then(() => {
        this.onChange();
      }, (error) => {
        new DOMAlert("danger", "Could not open container externally because: " + error + ".\n\nPlease double check the recovery", $("notification_container"));
      });
    }
  
  }
}

function generatePage(into: HTMLElement, pageNumber: Number) {
  let encryptionType = container.encryptionType
  if(encryptionType == null) throw "SharedRecovery: Container encryption type is null";
  let blocksNeed = algorithmBytes(encryptionType) / 2;

  let checkboxes = [] as string[];
  let textfields = [] as string[];

  for (let i = 1; i <= blocksNeed; i++) {
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
      if (checkbox.checked) textfield.classList.add("text-decoration-underline");
      else textfield.classList.remove("text-decoration-underline");
    });

    textfield.addEventListener("input", () => {
      log("checking word: " + textfield.value);
      if(textfield.value.includes("*")) {
        checkbox.checked = true;
        textfield.value = textfield.value.replace("*", "");
      }
      
      if (bip.isWordValid(textfield.value)) {
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

  return { checkboxes, textfields };
}

let currentPage = 0;
let numberOfPages = 2;
let pageElements = {} as { [page: number]: { checkboxes: string[], textfields: string[] } };
let pageCheckboxes = {} as { [page: number]: string };
function generatePages() {
  log("generate pages");
  // make blocks
  let recovery_pieces = $("recovery_pieces") as HTMLInputElement;
  numberOfPages = Number.parseInt(recovery_pieces.value);

  let pages = $("pages");

  // remove children if any
  removeAllChildren(pages);

  for (let i = 1; i <= numberOfPages; i++) {
    console.log("making page {i} of {d}".replace("{i}", i.toString()).replace("{d}", numberOfPages.toString()));
    // make host element
    let page = document.createElement("div");
    page.classList.add("d-flex", "flex-row", "flex-wrap");

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
    pageCheckboxes[i] = missing.id = "miss_p_" + i;
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

function checkPage() {
  let next = $("generate_shared_recovery_next") as HTMLInputElement;
  let previous = $("generate_shared_recovery_previous") as HTMLInputElement;
  previous.disabled = next.disabled = false;

  currentPage = currentPage < 0 ? 0 : currentPage;
  currentPage = currentPage >= numberOfPages ? numberOfPages - 1 : currentPage;

  next.disabled = currentPage == numberOfPages - 1; // last page
  previous.disabled = currentPage == 0; //first page
}

function setAllFieldDisabled(disabled: boolean) {
  // for every textbox and textfield
  for (let page = 1; page <= numberOfPages; page++) {
    disableStatus(
      $$$(pageElements[page].checkboxes, pageElements[page].textfields) as HTMLInputElement[],
      disabled
    );
    disableStatus([$(pageCheckboxes[page])] as HTMLInputElement[], disabled);
  }

  // disable submit button
  disableStatus([$("shared_submit")] as HTMLInputElement[], disabled);
}

