import { DOMAlert } from "./DOMAlert.js";

/**
 * Get element function that handles null
 * @param id id of the element
 * @returns the element from the document
 */
export function $(id: string) { 
  let element = document.getElementById(id)
  if (element == null) throw id + " is null!";
  return element;
};

/**
 * Get a list of elements
 * @param ids list of ids of elements
 * @returns a list of elements from the document
 */
export function $$(ids: string[]) { 
  let elementList = [];
  for (let element = 0; element < ids.length; element++) elementList.push($(ids[element]));
  return elementList;
}

/**
 * get lists of lists of elemenets
 * @param ids list of lists of element ids 
 * @returns a one dimentional array containing the elements from the document
 */
export function $$$(...ids: string[][]) { 
  let elementList = [];
  for (let i = 0; i < ids.length; i++) {
    let foundElements = $$(ids[i]);
    for (let element = 0; element < foundElements.length; element++) {
      elementList.push(foundElements[element]);
    }
  }

  return elementList;
}

/**
 * sets disabled on html input elements
 * @param l list of input elements
 * @param status set the disabled status
 */
export function disableStatus(l: HTMLInputElement[], status: boolean) {
  for (let i = 0; i < l.length; i++) l[i].disabled = status;
}

/**
 * removes all the children from an element
 * @param elem parent element to delete the children from
 */
export function removeAllChildren(elem: HTMLElement) {
  // remove existsing childen
  while (elem.children.length > 0) {
    let child = elem.children.item(0);
    if (child == null) break; //no more children anyway
    child.remove();
  }
}

/**
 * Shows an alert for passwords missmatching
 */
export function passwordMissmatchAlert() {
  new DOMAlert("danger", "Passwords don't match");
}

/**
 * Shows the loader
 */
export function showLoader() {
  $("loader").style.opacity = "1000";
  $("loader").style.zIndex = "999";
}

/**
 * Hides the loader
 */
export function hideLoader() {
  $("loader").style.opacity = "0";
  $("loader").style.zIndex = "-999";
}