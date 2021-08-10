import { log } from "./../../Functions.js";
import { Extra } from "./../Extra.js";

export class Theme extends Extra implements iJSON {
    themeName : string;

    themeURL = new Map<string, string>();
    constructor(jsonData?: string) {
        super(jsonData != null ? JSON.parse(jsonData) : undefined);
        this.themeName = this.getDataOrDefaultTo("themeName", "bootstrap");

        // mappings here
        this.addTheme("boostrap", "../css/bootstrap/css/bootstrap.css");

        this.addTheme("cyborg", "../css/themes/cyborg-bootstrap.min.css");
        this.addTheme("darkly", "../css/themes/darkly-bootstrap.min.css");
        this.addTheme("quartz", "../css/themes/quartz-bootstrap.min.css");
        this.addTheme("solar", "../css/themes/solar-bootstrap.min.css");
        this.addTheme("vapor", "../css/themes/vapor-bootstrap.min.css");
    }

    getBoostrapCSS() {
        log("Theme.ts: returing theme: " + this.themeURL.get(this.themeName));
        return this.themeURL.get(this.themeName);
    }

    private addTheme(name : string, url : string) {
        this.themeURL.set(name, url);
    }

    setTheme(theme: string) {
        this.themeName = theme;
        return this.getBoostrapCSS();
    }

    getJSON() {
        this.setData("themeName", this.themeName);
        return super.getJSON();
    }
}