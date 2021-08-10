import { log } from "./../../Functions.js";
import { Extra } from "./../Extra.js";

export class Theme extends Extra implements iJSON {
    themeName : string;

    themeURL = new Map<string, string>();
    themeList = [] as string[];
    constructor(jsonData?: string) {
        super(jsonData != null ? JSON.parse(jsonData) : undefined);
        this.themeName = this.getDataOrDefaultTo("themeName", "bootstrap");

        // mappings here
        this.addTheme("bootstrap", "../css/bootstrap/css/bootstrap.css");

        this.addTheme("cyborg", "../css/themes/cyborg-bootstrap.min.css");
        this.addTheme("darkly", "../css/themes/darkly-bootstrap.min.css");
        this.addTheme("lux", "../css/themes/lux-bootstrap.min.css");
        this.addTheme("quartz", "../css/themes/quartz-bootstrap.min.css");
        this.addTheme("solar", "../css/themes/solar-bootstrap.min.css");
        this.addTheme("vapor", "../css/themes/vapor-bootstrap.min.css");
    }

    getBoostrapCSS() {
        log("Theme.ts: returning ('"+ this.themeName +"') theme: " + this.themeURL.get(this.themeName));
        log(this);
        return this.themeURL.get(this.themeName);
    }

    private addTheme(name : string, url : string) {
        this.themeURL.set(name, url);
        this.themeList.push(name);
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