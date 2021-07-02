import {getStoredContainer, Container} from "./../crypto/Container.js";
import {log, algorithmBytes} from "./../crypto/Functions.js";
import {$} from "./../DOM/DOMHelper.js";
import {DOMAlert} from "./../DOM/DOMAlert.js";

let container = getStoredContainer();

export class WordRecovery {
  constructor() {
    log("WordRecovery");
    let encryptionType = container.encryptionType
    let blocksNeed = algorithmBytes(encryptionType) / 2;

    log(encryptionType);
    log(blocksNeed);

    // make blocks
    let recovery_fields = $("recovery_fields");
    
    for(let i = 1; i <= blocksNeed; i++) {
      let flexDiv = document.createElement("div");
      flexDiv.classList.add("d-flex", "flex-row", "flex-nowrap", "mx-auto", "mb-3");

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
      textfield.classList.add("d-inline", "mx-1", "mt-auto", "mb-auto");
      textfield.type = "text";
      textfield.id = "tx_id_" + i;

      // Add listeners
      checkbox.addEventListener("click", () => {
        if(checkbox.checked) textfield.classList.add("text-decoration-underline");
        else textfield.classList.remove("text-decoration-underline");
      });

      // Combine
      flexDiv.appendChild(label);
      flexDiv.appendChild(checkbox);
      flexDiv.appendChild(textfield);
      recovery_fields.appendChild(flexDiv);
    }
  }
}
