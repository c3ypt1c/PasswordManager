import { log } from "./../../Functions.js";
import { Container } from "./../../Crypto/Container.js";
import { $, removeAllChildren, disableStatus, passwordMissmatchAlert } from "./../../DOM/DOMHelper.js";
import { Pane } from "./Pane.js";
import { DOMAlert } from "./../../DOM/DOMAlert.js";
import { Settings } from "./../../Extra/Settings/Settings.js";

let container: Container;

export class SettingsPane extends Pane {
    constructor(container_: Container) {
        super("settings_pane", "settings_pane_button");
        container = container_;

        // Add listeners
        let select = $("settings_select_theme") as HTMLSelectElement;
        select.addEventListener("change", () => this.onThemeChanged());

        // event listeners
        $("add_slot").addEventListener("click", () => this.addSlot());
        $("change_password").addEventListener("click", () => this.changePassword());

        this.updateTheme();
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

        createThemeSelect();
    }

    removeSlot(slot: number) {
        try {
            container.removeSlot(slot);
            new DOMAlert("success", "Removed slot number {}!".replace("{}", slot.toString()), $("notification_container"));
        } catch (error) {
            new DOMAlert("warning", "Could not remove slot:\n" + error, $("notification_container"));
        }

        this.updatePane();
        this.onChange();
    }

    onThemeChanged() {
        let select = $("settings_select_theme") as HTMLSelectElement;
        container.settings?.theme.setTheme(select.options[select.selectedIndex].value);
        this.updateTheme();
        this.updatePane();
        this.onChange();
    }

    async addSlot() {
        log("adding slot to container");
        // get passwords
        let password_once = $("password_new_slot_once") as HTMLInputElement;
        let password_twice = $("password_new_slot_twice") as HTMLInputElement;

        // Compare
        if (password_once.value != password_twice.value) {
            passwordMissmatchAlert();
            return;
        }

        disableStatus([password_once, password_twice], true);

        // make the slot
        await container.addSlot(password_once.value);

        disableStatus([password_once, password_twice], false);
        this.updatePane();
    }

    changePassword() {
        log("changing password");
        // get passwords
        let password_once = $("password_change_once") as HTMLInputElement;
        let password_twice = $("password_change_twice") as HTMLInputElement;

        // Compare
        if (password_once.value != password_twice.value) {
            passwordMissmatchAlert();
            return;
        }

        disableStatus([password_once, password_twice], true);

        let password = password_once.value;
        container.changePassword(password).then(() => {
            log("password changed");
            container.save();
            new DOMAlert("info", "Successfully changed passwords!");
            disableStatus([password_once, password_twice], false);
        }, (error) => {
            new DOMAlert("danger", "Failed to change password:\n" + error);
            log(error);
            disableStatus([password_once, password_twice], false);
        });
    }

    updateTheme() {
        // theme change
        let settingsObject = container.settings == null ? new Settings() : container.settings;
    
        // bootstrap theme
        let themeURL = settingsObject.theme.getBoostrapCSS();
        themeURL = themeURL == undefined ? "../css/bootstrap/css/bootstrap.css" : themeURL;
        ($("css") as HTMLLinkElement).href = themeURL;
    
        // fix for theme 
        let themeFixURL = settingsObject.theme.getBoostrapFixCSS();
        themeFixURL = themeFixURL == undefined ? "../css/fixes/bootstrap.css" : themeFixURL;
        ($("css_fix") as HTMLLinkElement).href = themeFixURL;
    }
}

function createThemeSelect() {
    if (container.settings == null) {
        log(container);
        log("SettingsPane.ts: No settings");
        return;
    }

    let select = $("settings_select_theme") as HTMLSelectElement;
    removeAllChildren(select);
    for (let theme = 0; theme < container.settings.theme.themeList.length; theme++) {
        let option = document.createElement("option") as HTMLOptionElement;
        option.value = option.textContent = container.settings.theme.themeList[theme];

        if (option.value == container.settings.theme.themeName) option.selected = true;

        select.add(option);
    }
}
