import { Extra } from "./../Extra.js";
import { PasswordSettings } from "./PasswordSettings.js";
import { Theme } from "./Theme.js";

export class Settings extends Extra implements iJSON {
    theme : Theme;
    passwordSettings : PasswordSettings;
    constructor(jsonData ?: string) {
        super(jsonData != null ? JSON.parse(jsonData) : undefined);
        this.theme = new Theme(this.hadData("theme") ? this.getData("theme") : undefined);
        this.passwordSettings = new PasswordSettings(this.hadData("passwordSettings") ? this.getData("passwordSettings") : undefined);
    }

    getJSON() {
        super.setData("theme", this.theme.getJSON());
        super.setData("passwordSettings", this.passwordSettings.getJSON());
        return super.getJSON();
    }
}
