import { $ } from "./DOMHelper.js";
let alertCounter = 0;

/**
 * Create an alert
 */
export class DOMAlert {
  height: number;
  alertID: string;
  fadeRunning = false;
  fadeTime = 500;
  idleTime = 4000;
  delete = () => $(this.alertID).remove();
  constructor(kind: "primary" | "secondary" | "success" | "danger" | "warning" | "info", text: string, insertionPoint?: HTMLElement) {
    // create <div class="alert alert-{kind} alert-dismissible fade show"></div>
    let alertBody = document.createElement("div");
    alertBody.classList.add("alert", "alert-dismissible", "my-animate", "my-alert-no-opacity", "alert-" + kind);
    alertBody.setAttribute("role", "alert");
    alertBody.style.zIndex = "1000"; //z index needs to be bigger because it needs to float
    this.alertID = alertBody.id = "alert-id-" + ++alertCounter;
    // ^ https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pikpng.com%2Fpngl%2Fm%2F18-182418_feelsgoodman-feels-good-meme-gif-clipart.png&f=1&nofb=1

    // make text element
    let textDiv = document.createElement("p");
    textDiv.textContent = text;

    // make close button
    let dismissButton = document.createElement("button");
    dismissButton.type = "button";
    dismissButton.classList.add("btn-close");
    dismissButton.addEventListener("click", () => this.fadeThenDelete(this.alertID));

    // combine elements
    alertBody.appendChild(textDiv);
    alertBody.appendChild(dismissButton);

    // add them to the page
    if (insertionPoint == null) insertionPoint = $("notification_container");
    insertionPoint.appendChild(alertBody);

    //set final height
    this.height = alertBody.offsetHeight;

    //for animation
    alertBody.style.height = this.height + "px";
    alertBody.style.opacity = "0";
    setTimeout(() => alertBody.style.opacity = "1", 33); //fade in effect

    // automatic kill
    setTimeout(() => this.fadeThenDelete(this.alertID), this.idleTime);
  }

  /**
   * function used to fade and then delete the id of the alert
   * @param id id of the alert
   */
  fadeThenDelete(id: string) {
    // check if fade is already running
    if (this.fadeRunning) return;
    this.fadeRunning = true;

    //start fade out animation
    let alertBody = $(id);
    alertBody.style.opacity = "0";

    setTimeout(() => {
      // after time is up
      alertBody.style.height = "0";
      alertBody.style.margin = "0";
      alertBody.style.padding = "0";

      // after invisible and not taking up space
      setTimeout(this.delete, this.fadeTime);

    }, this.fadeTime);
  }
}
