import { $ } from "../../DOM/DOMHelper.js";


/**
 * This class is an abstraction of a Pane. A pane can be defined as a sub-page in the password manager.
 * It is responsible for it's actions and it's constructor is always called from PasswordManager.
 * @todo change the constructor to map buttons. 
 */
export abstract class Pane {
    listeners = [] as Function[];
    paneID : string;
    paneButton : string;

    isSelected = false;
    isEnabled = true;

    constructor(paneID : string, paneButton : string) {
        this.paneID = paneID;
        this.paneButton = paneButton;
    }

    /**
     * This function reconstructs the pane
     * @param 
     */
    abstract updatePane(data ?: any): void;

    /**
     * Will add listener to list of functions to run when changed. 
     * @param listener function to run when data has changed.
     */
    addChangeListener(listener: Function): void {
        this.listeners.push(listener);
    }

    getPaneButton() {
        return $(this.paneButton);
    }

    getPane() {
        return $(this.paneID);
    }

    protected setEnabled(enabled : boolean) {
        this.isEnabled = enabled;
        if(enabled) {
            this.getPaneButton().classList.remove("disabled");
        } else {
            this.getPaneButton().classList.add("disabled");
        }
    }

    protected setSelected(selected : boolean) {
        
    }

    /**
     * Notify listeners
     * @param data data to notify listeners with.
     */
    onChange(data ?: any) {
        for (let listener = 0; listener < this.listeners.length; listener++) this.listeners[listener](data);
    }
}