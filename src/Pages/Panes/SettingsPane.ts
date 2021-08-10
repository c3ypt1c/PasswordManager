import { log } from "../../Functions.js";
import { Container } from "./../../crypto/Container.js";
import { $, removeAllChildren } from "./../../DOM/DOMHelper.js";
import { Pane } from "./Pane.js";
import { DOMAlert } from "./../../DOM/DOMAlert.js";
import { Settings } from "../../Extra/Settings/Settings.js";

let container: Container;

export class SettingsPane extends Pane {
    constructor(container_: Container) {
        super("settings_pane", "settings_pane_button");
        container = container_;
        this.updatePane();
    }

    updatePane(data?: any): void {
        log("updateIdentityPane");
        let infoStrings = {
            "info_slot_open": "Slot open: {}",
        }

        let slot = container.openSlot == null ? "null" : container.openSlot.toString();
        $("info_slot_open").textContent = infoStrings["info_slot_open"].replace("{}", slot);

        // add containers for show_conatiners
        let show_slots = $("show_slots");

        //remove all children
        removeAllChildren(show_slots);

        // add new children
        for (let index = 0; index < container.getSlots().length; index++) {
            // make main div
            let containerElement = document.createElement("div");
            containerElement.classList.add(
                "d-flex", "badge", "border", "border-secondary", "bg-light", "flex-column",
                "justify-content-center", "p-4", "m-1", "text-center", "fs-4"
            );
            containerElement.addEventListener("click", () => this.removeSlot(index));

            // aesthetic
            if (index == container.openSlot) containerElement.classList.add("text-danger");
            else containerElement.classList.add("text-warning");

            // set title
            let containerTitle = document.createElement("p");
            containerTitle.textContent = "Slot " + index;
            containerTitle.classList.add("fs-1");
            containerElement.appendChild(containerTitle);

            // make icon
            let containerImage = document.createElement("i");
            containerImage.classList.add("bi-archive");
            containerElement.appendChild(containerImage)

            // add the container to show_conatiners
            show_slots.appendChild(containerElement);
        }

        // theme change
        let themeURL = container.settings == null ? new Settings().theme.getBoostrapCSS() : container.settings.theme.getBoostrapCSS();
        themeURL = themeURL == undefined ? "../css/bootstrap/css/bootstrap.css" : themeURL;
        ($("css") as HTMLLinkElement).href = themeURL;
    }

    removeSlot(slot: number) {
        try {
            container.removeSlot(slot);
            new DOMAlert("success", "Removed slot number {}!".replace("{}", slot.toString()), $("notification_container"));
        } catch (error) {
            new DOMAlert("warning", "Could not remove slot:\n" + error, $("notification_container"));
        }

        this.updatePane();
    }
} 