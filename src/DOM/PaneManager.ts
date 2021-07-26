import {$} from "./../DOM/DOMHelper.js";
import {log} from "./../Functions.js";

var mapping = {} as any; // mapping between buttons and panes
var buttons = [] as string[]; //ids
var panes = [] as string[]; //ids

export class PaneManager {
  constructor(mapp : any) {
    mapping = mapp;

    log("making mappings");
    log(mapping);

    //Add event listeners
    for(let button in mapping) {
      log(button);
      buttons.push(button);
      panes.push(mapping[button]);
      $(button).addEventListener("click", () => this.buttonHit(button));
    }
  }

  buttonHit(button : string) {
    log("button hit");
    log(button);

    this.unselectAll();
    log("adding active to " + button);
    $(button).classList.add("active");

    log("adding active to " + mapping[button]);
    $(mapping[button]).classList.add("my-initial-pane-open");
  }

  unselectAllPanes() {
    log("removing panes");
    for(let pane = 0; pane < panes.length; pane++) $(panes[pane]).classList.remove("my-initial-pane-open");

  }

  unselectAllButtons() {
    log("removing buttons")
    for(let button = 0; button < buttons.length; button++) $(buttons[button]).classList.remove("active");
  }

  unselectAll() {
    this.unselectAllPanes();
    this.unselectAllButtons();
  }

}
