import { log } from "../Functions.js";
import { $ } from "./DOMHelper.js";

/**
 * This class generates a pop up take asks the user to confirm or deny
 */
export class DOMConfirm {
    constructor(yesAction: Function, noAction: Function, title: string, paragraph?: string, yesText = "Yes", noText = "No") {
        // remove listeners
        let confirmation_main_yes_old = $("confirmation_main_yes");
        let confirmation_main_no_old = $("confirmation_main_no");

        let confirmation_main_yes = confirmation_main_yes_old.cloneNode(true);
        let confirmation_main_no = confirmation_main_no_old.cloneNode(true);

        confirmation_main_yes_old.parentNode?.replaceChild(confirmation_main_yes, confirmation_main_yes_old);
        confirmation_main_no_old.parentNode?.replaceChild(confirmation_main_no, confirmation_main_no_old);

        // set content
        $("confirmation_main_title").textContent = title;
        $("confirmation_main_paragraph").textContent = paragraph == null ? "" : paragraph;
        confirmation_main_yes.textContent = yesText;
        confirmation_main_no.textContent = noText;

        // Add listeners
        confirmation_main_yes.addEventListener("click", () => { hide(); yesAction() });
        confirmation_main_no.addEventListener("click", () => { hide(); noAction() });

        show();
    }
}

/**
 * Internal function to show the pop up and block the background
 */
function show() {
    $("confirmation_container").classList.add("show");
    let confirmation_main = $("confirmation_main");
    confirmation_main.classList.add("show");
}

/**
 * Internal function which hides the show the pop up and delays hiding the background
 */
function hide() {
    let confirmation_main = $("confirmation_main");
    confirmation_main.classList.remove("show");
    setTimeout(hidePt2, 200);
}

/**
 * hides the background body
 */
function hidePt2() {
    $("confirmation_container").classList.remove("show");
}

/**
 * Testing function
 */
const createNewDom = () => {
    setTimeout(() => {
        new DOMConfirm(() => createNewDom(), () => log("no"), "Title", "Paragraph stuff", "Yes text", "No text");
    }, 3000);
}
