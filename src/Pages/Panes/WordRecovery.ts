import { Container } from "../../Crypto/Container.js";
import { log } from "./../../Functions.js";
import { algorithmBytes } from "../../Crypto/CryptoFunctions.js";
import { $, $$$, disableStatus, goTo } from "./../../DOM/DOMHelper.js";
import { DOMAlert } from "./../../DOM/DOMAlert.js";
import { BIP, Word } from "./../../Recovery/BIP.js";
import { Pane } from "./Pane.js";

let bip : BIP;
let container : Container;

let checkboxes = [] as string[];
let textfields = [] as string[];

export class WordRecovery extends Pane {
  constructor(container_ : Container, BIP_ : BIP) {
    super("word_recovery_pane", "word_recovery_button");
    
    container = container_;
    bip = BIP_;

    log("WordRecovery");
    let encryptionType = container.encryptionType;
    if(encryptionType == null) throw "WordRecovery: Container encryption type is null";
    let blocksNeed = algorithmBytes(encryptionType) / 2;

    log(encryptionType);
    log(blocksNeed);

    // make blocks
    let recovery_fields = $("recovery_fields");

    for (let i = 1; i <= blocksNeed; i++) {
      let flexDiv = document.createElement("div");
      flexDiv.classList.add("d-flex", "flex-row", "flex-nowrap", "mx-auto", "mb-3", "form-check", "needs-validation");

      // Main elements
      let label = document.createElement("label") as HTMLLabelElement;
      label.classList.add("text-center", "mx-1", "mt-auto", "mb-auto");
      label.setAttribute("for", "ch_id_" + i);
      label.textContent = i + ". ";

      let checkbox = document.createElement("input") as HTMLInputElement;
      checkbox.classList.add("d-inline", "mx-1", "mt-auto", "mb-auto");
      checkbox.type = "checkbox";
      checkbox.id = "ch_id_" + i;

      let textfield = document.createElement("input") as HTMLInputElement;
      textfield.classList.add("d-inline", "mx-1", "mt-auto", "mb-auto", "form-control", "is-invalid");
      textfield.type = "text";
      textfield.id = "tx_id_" + i;

      // Add listeners
      checkbox.addEventListener("click", () => {
        if (checkbox.checked) textfield.classList.add("text-decoration-underline");
        else textfield.classList.remove("text-decoration-underline");
      });

      textfield.addEventListener("input", () => {
        log("checking word: " + textfield.value);
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
      recovery_fields.appendChild(flexDiv);

      // add to the list
      checkboxes.push(checkbox.id);
      textfields.push(textfield.id);
    }

    // action listsner for button
    $("word_submit").addEventListener("click", () => {
      // make words
      let words = [];
      let valid = true;
      for (let i = 1; i <= textfields.length; i++) {
        let checkbox = $("ch_id_" + i) as HTMLInputElement;
        let textfield = $("tx_id_" + i) as HTMLInputElement;
        let word = new Word(textfield.value, checkbox.checked);
        valid = valid && word.checkWord(bip);
        if (!valid) break;
        words.push(word);
      }

      if (!valid) {
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
          this.onChange();
        }, (error) => {
          // fail
          disableStatus(lock as HTMLInputElement[], false);
          new DOMAlert("danger", "Could not open container externally because: " + error + ".\n\nPlease double check the recovery", $("notification_container"));
        });

      }
    });
  }

  updatePane() {}
}
