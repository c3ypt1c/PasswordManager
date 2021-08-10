import { log } from "./../../Functions.js";
import { Extra } from "./../Extra.js";

export class Theme extends Extra implements iJSON {
    themeName : string;

    themeURL = new Map<string, string>();
    themeFixURL = new Map<string, string>();
    themeList = [] as string[];
    constructor(jsonData?: string) {
        super(jsonData != null ? JSON.parse(jsonData) : undefined);
        this.themeName = this.getDataOrDefaultTo("themeName", "bootstrap");

        // mappings here
        this.addTheme("bootstrap", "../node_modules/bootstrap/dist/css/bootstrap.min.css", "../css/fixes/bootstrap.css"); 
        this.addTheme("cyborg", "../node_modules/bootswatch/dist/cyborg/bootstrap.min.css", "../css/fixes/cyborg.css");
        this.addTheme("darkly", "../node_modules/bootswatch/dist/darkly/bootstrap.min.css", "../css/fixes/darkly.css");
        this.addTheme("lux", "../node_modules/bootswatch/dist/lux/bootstrap.min.css", "../css/fixes/lux.css");
        this.addTheme("quartz", "../node_modules/bootswatch/dist/quartz/bootstrap.min.css", "../css/fixes/quartz.css");
        this.addTheme("solar", "../node_modules/bootswatch/dist/solar/bootstrap.min.css", "../css/fixes/solar.css");
        this.addTheme("vapor", "../node_modules/bootswatch/dist/vapor/bootstrap.min.css", "../css/fixes/vapor.css");
    }

    getBoostrapCSS() {
        log("Theme.ts: returning ('"+ this.themeName +"') theme: " + this.themeURL.get(this.themeName));
        log(this);
        return this.themeURL.get(this.themeName);
    }

    getBoostrapFixCSS() {
        log("Theme.ts: returning ('"+ this.themeName +"') theme: " + this.themeFixURL.get(this.themeName));
        log(this);
        return this.themeFixURL.get(this.themeName);
    }

    private addTheme(name : string, url : string, fixURL : string) {
        this.themeURL.set(name, url);
        this.themeFixURL.set(name, fixURL);
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