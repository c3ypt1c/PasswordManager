import { log } from "./../../Functions.js";
import { Extra } from "./../Extra.js";

/**
 * This class is responsible for skinning and theme-ing the password manager as well as storing the theme data.
 */
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

    /**
     * Get the bootstrap theme URL
     * @returns Bootstrap theme URL
     */
    getBoostrapCSS() {
        log("Theme.ts: returning ('"+ this.themeName +"') theme: " + this.themeURL.get(this.themeName));
        log(this);
        return this.themeURL.get(this.themeName);
    }

    /**
     * Get the bootstrap theme fix URL
     * @returns Bootstrap theme fix URL
     */
    getBoostrapFixCSS() {
        log("Theme.ts: returning ('"+ this.themeName +"') theme: " + this.themeFixURL.get(this.themeName));
        log(this);
        return this.themeFixURL.get(this.themeName);
    }

    /**
     * Add a theme to mappings
     * @param name the name of the theme
     * @param url  the bootstrap theme URL
     * @param fixURL the bootstrap theme fix URL
     */
    private addTheme(name : string, url : string, fixURL : string) {
        this.themeURL.set(name, url);
        this.themeFixURL.set(name, fixURL);
        this.themeList.push(name);
    }

    /**
     * Sets the current theme
     * @param theme current theme.
     */
    setTheme(theme: string) {
        this.themeName = theme;
    }

    getJSON() {
        super.setData("themeName", this.themeName);
        return super.getJSON();
    }
}