import { Extra } from "./../Extra.js";
import { PasswordSettings } from "./PasswordSettings.js";

export class Settings extends Extra implements iJSON {
    darkMode : boolean;
    passwordSettings : PasswordSettings;
    constructor(jsonData ?: string) {
        super(jsonData != null ? JSON.parse(jsonData) : undefined);
        this.darkMode = this.hadData("darkMode") ? this.getData("darkMode") == "true" : false;
        this.passwordSettings = new PasswordSettings(this.hadData("passwordSettings") ? this.getData("passwordSettings") : undefined);
    }

    getJSON() {
        this.setData("darkMode", this.darkMode.toString());
        this.setData("passwordSettings", this.passwordSettings.getJSON());
        return super.getJSON();
    }
}
