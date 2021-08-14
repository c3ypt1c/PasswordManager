import { $ } from "./../DOM/DOMHelper.js";
import { log } from "./../Functions.js";

/**
 * Mapping between buttons and panes
 */
var mapping = {} as any;

/**
 * Id of the buttons
 */
var buttons = [] as string[]; 

/**
 * Id of the panes
 */
var panes = [] as string[];

/**
 * This class is responsible for mapping clicks between panes
 * @deprecated this will be removed soon as panes themselfs will be able to add event listeners themselfs
 */
export class PaneManager {
  constructor(mapp: any) {
    mapping = mapp;

    log("making mappings");
    log(mapping);

    //Add event listeners
    for (let button in mapping) {
      log(button);
      buttons.push(button);
      panes.push(mapping[button]);
      $(button).addEventListener("click", () => this.buttonHit(button));
    }
  }

  /**
   * Click on the button to chang ethe pane
   * @param button button id
   */
  buttonHit(button: string) {
    log("button hit");
    log(button);

    this.unselectAll();
    log("adding active to " + button);
    $(button).classList.add("active");

    log("adding active to " + mapping[button]);
    $(mapping[button]).classList.add("my-initial-pane-open");
  }

  /**
   * closes all of the panes
   */
  unselectAllPanes() {
    log("removing panes");
    for (let pane = 0; pane < panes.length; pane++) $(panes[pane]).classList.remove("my-initial-pane-open");

  }

  /**
   * deselects all of the buttons
   */
  unselectAllButtons() {
    log("removing buttons")
    for (let button = 0; button < buttons.length; button++) $(buttons[button]).classList.remove("active");
  }

  /**
   * closes all the panes and deselects all the buttons
   */
  unselectAll() {
    this.unselectAllPanes();
    this.unselectAllButtons();
  }

}
