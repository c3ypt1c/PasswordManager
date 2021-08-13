import { log } from "./../../Functions.js";
import { Container } from "./../../Crypto/Container.js";
import { $, removeAllChildren, disableStatus, passwordMissmatchAlert, $$, showLoader, hideLoader } from "./../../DOM/DOMHelper.js";
import { Pane } from "./Pane.js";
import { DOMAlert } from "./../../DOM/DOMAlert.js";
import { Settings } from "./../../Extra/Settings/Settings.js";
import { generatePassword } from "../../Crypto/CryptoFunctions.js";
import { DOMConfirm } from "../../DOM/DOMConfirm.js";

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

        // password change listeners
        let password_settings_changed = $$(["settings_password_length", "settings_password_include_numbers", "settings_password_include_symbols", "settings_password_include_lowercase", "settings_password_include_uppercase"]);
        for (let item = 0; item < password_settings_changed.length; item++) {
            password_settings_changed[item].addEventListener("change", updatePasswordSettings);
        }

        $("settings_generate_password").addEventListener("click", genPassword);

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

            let askString = "Are you certain that you want to delete slot {}? The person using slot {} will not be able to log in anymore.";
            containerElement.addEventListener("click", () => {
                new DOMConfirm(
                    () => this.removeSlot(index),
                    () => { }, "Are you sure?",
                    askString.replace("{}", index.toString()).replace("{}", index.toString()));
            });

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

        let containerSettings = container.settings == null ? new Settings() : container.settings;

        // Populate password defaults
        ($("settings_password_length") as HTMLInputElement).value = containerSettings.passwordSettings.passwordLength.toString();
        ($("settings_password_include_numbers") as HTMLInputElement).checked = containerSettings.passwordSettings.includeNumbers;
        ($("settings_password_include_symbols") as HTMLInputElement).checked = containerSettings.passwordSettings.includeSymbols;
        ($("settings_password_include_lowercase") as HTMLInputElement).checked = containerSettings.passwordSettings.includeLowercase;
        ($("settings_password_include_uppercase") as HTMLInputElement).checked = containerSettings.passwordSettings.includeUppercase;
        genPassword();
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
        showLoader();

        setTimeout(() => {
            let select = $("settings_select_theme") as HTMLSelectElement;
            container.settings?.theme.setTheme(select.options[select.selectedIndex].value);
            this.updateTheme();
            container.save();
            this.updatePane();
            this.onChange();

            setTimeout(hideLoader, 1500);
        }, 1000);
    }

    /**
     * Controls input elements on the SettingsPane.
     * @param disable If true, will disable elements specific to the settingsPane. Will also show loader if true and hide it otherwise.
     */
    disableEverything(disable: boolean) {
        let toDisable = [
            $("password_new_slot_once") as HTMLInputElement,
            $("password_new_slot_twice") as HTMLInputElement,
            $("password_change_once") as HTMLInputElement,
            $("password_change_twice") as HTMLInputElement,
            $("add_slot") as HTMLInputElement,
            $("change_password") as HTMLInputElement,
        ];

        // actually enable or disable the elements
        disableStatus(toDisable, disable);

        // show or hide loaders
        if (disable) showLoader();
        else hideLoader();

        // update interface
        this.updatePane();
    }

    addSlot() {
        log("adding slot to container");
        // get passwords
        let password_once = $("password_new_slot_once") as HTMLInputElement;
        let password_twice = $("password_new_slot_twice") as HTMLInputElement;

        // Compare
        if (password_once.value != password_twice.value) {
            passwordMissmatchAlert();
            return;
        }

        this.disableEverything(true);

        // make the slot
        container.addSlot(password_once.value).then(() => {
            new DOMAlert("success", "Added a new slot!");
        }, () => {
            new DOMAlert("danger", "Couldn't add a new slot.");
        }).finally(() => this.disableEverything(false));
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

        this.disableEverything(true);

        let password = password_once.value;
        container.changePassword(password).then(() => {
            log("password changed");
            container.save();
            new DOMAlert("info", "Successfully changed passwords!");
        }, (error) => {
            new DOMAlert("danger", "Failed to change password:\n" + error);
            log(error);
        }).finally(() => this.disableEverything(false));
    }

    updateTheme() {
        showLoader();

        setTimeout(() => {
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

            setTimeout(hideLoader, 1500);
        }, 1000);
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

function genPassword() {
    $("settings_password_example").textContent = generatePassword(container.settings?.passwordSettings);
}

function updatePasswordSettings() {
    if (container.settings == null) container.settings = new Settings();

    container.settings.passwordSettings.passwordLength = Number.parseInt(($("settings_password_length") as HTMLInputElement).value);
    container.settings.passwordSettings.includeNumbers = ($("settings_password_include_numbers") as HTMLInputElement).checked;
    container.settings.passwordSettings.includeSymbols = ($("settings_password_include_symbols") as HTMLInputElement).checked;
    container.settings.passwordSettings.includeLowercase = ($("settings_password_include_lowercase") as HTMLInputElement).checked;
    container.settings.passwordSettings.includeUppercase = ($("settings_password_include_uppercase") as HTMLInputElement).checked;

    log(container.settings.passwordSettings);

    container.save();
    genPassword();
}
