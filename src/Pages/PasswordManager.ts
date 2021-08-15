import { Container, getStoredContainer, storageHasContainer } from "../Crypto/Container.js";
import { $, $$, $$$, hideLoader, showLoader } from "../DOM/DOMHelper.js";
import { Identity } from "../Crypto/Identity.js";
import { PaneManager } from "../DOM/PaneManager.js";
import { BIP } from "../Recovery/BIP.js";
import { LoginPane } from "./Panes/LoginPane.js";
import { WordRecovery } from "./Panes/WordRecovery.js";
import { SharedRecovery } from "./Panes/SharedRecovery.js";
import { CreateContainer } from "./Panes/CreateContainer.js";
import { SettingsPane } from "./Panes/SettingsPane.js";
import { State } from "./../CustomTypes.js";
import { HomePane } from "./Panes/HomePane.js";
import { IdentityPane } from "./Panes/IdentityPane.js";
import { RecoveryPane } from "./Panes/RecoveryPane.js";

// state
let state = "login" as State;

// panes
let settingsPane: SettingsPane;

// encrypted container and identity
var container: Container;
if (!storageHasContainer()) {
  state = "create_container";
  container = new Container();
}
else {
  try {
    container = getStoredContainer();
    //TODO: Warn user of new container or data loss. Save it somewhere maybe.
  } catch {
    state = "create_container";
    container = new Container();
  }
}

// recovery
var Bip = new BIP();

// buttons
let create_pane_buttons = ["create_container_button"];
let login_pane_buttons = ["login_pane_button", "word_recovery_button", "shared_recovery_button"];
let password_manager_pane_buttons = ["home_pane_button", "identity_pane_button", "settings_pane_button", "recovery_pane_button"];

/**
 * Disable all buttons at login
 */
function setAllButtonsDisabled() {
  let everything = $$$(login_pane_buttons, password_manager_pane_buttons, create_pane_buttons);

  // add disabled to groups
  for (let index = 0; index < everything.length; index++) {
    everything[index].classList.add("disabled");
    everything[index].parentElement?.classList.add("disabled");
  }
}

/**
 * removed disabled from list
 * @param element element list
 */
function removeDisabledFromButtons(element: HTMLElement[]) {
  for (let index = 0; index < element.length; index++) {
    element[index].classList.remove("disabled");
    element[index].parentElement?.classList.remove("disabled");
  }
}

/**
 * Update the state to the correct one
 */
function updateState() {
  setAllButtonsDisabled();
  switch (state) {
    case "create_container": {
      removeDisabledFromButtons($$(create_pane_buttons));
      return;
    }
    case "login": {
      // remove disabled from groups
      removeDisabledFromButtons($$(login_pane_buttons));
      return;
    }
    case "password_manager": {
      removeDisabledFromButtons($$(password_manager_pane_buttons));
      return;
    }
  }
}

/**
 * This class has a responsibility of generating all of the other classes and also performing other misc operations
 */
export class PasswordManager {
  identities?: Identity[];
  paneManager: PaneManager;
  constructor() {
    // Assign listeners...
    $("logout").addEventListener("click", this.logout);

    // add pane manager
    let paneManagerMappings = {
      "login_pane_button": "login_pane",
      "home_pane_button": "home_pane",
      "word_recovery_button": "word_recovery_pane",
      "shared_recovery_button": "shared_recovery_pane",
      "create_container_button": "create_container_pane",
      "identity_pane_button": "identity_pane",
      "settings_pane_button": "settings_pane",
      "recovery_pane_button": "recovery_pane",
    };

    this.paneManager = new PaneManager(paneManagerMappings);

    // start extenral panes
    let createContainerPane = new CreateContainer(container);
    createContainerPane.addChangeListener((container_: Container) => containerCreated(container_));

    if (state != "create_container") {
      createPanes();
      $("login_pane_button").click();
    } else {
      $("create_container_button").click();
    }

    updateState();
  }

  /**
   * Log the user out
   */
  logout() {
    // close electron
    if (state == "login" || state == "create_container") {
      window.close();
    }

    // move to login state
    container.save(); // update and lock the container
    container.lock();
    settingsPane.updateTheme();

    // change state
    state = "login";
    updateState();

    // show login
    $("login_pane_button").click();
  }
}

/**
 * a new container is created
 * @param container_ initilised container
 */
function containerCreated(container_: Container) {
  container = container_;
  createPanes();
  containerUnlocked();
}

/**
 * Create all of the panes that don't need the container to be unlocked. 
 */
function createPanes() {
  let loginPane = new LoginPane(container);
  loginPane.addChangeListener(containerUnlocked);
  loginPane.setOnLoadingFinishedAction(hideLoader);
  loginPane.setOnLoadingStartedAction(showLoader);

  let wordRecoveryPane = new WordRecovery(container, Bip);
  wordRecoveryPane.addChangeListener(containerUnlocked);

  let sharedRecoveryPane = new SharedRecovery(container, Bip);
  sharedRecoveryPane.addChangeListener(containerUnlocked);

  settingsPane = new SettingsPane(container);
}

/**
 * Start panes that require the container to be unlocked.
 */
function containerUnlocked() {
  // hide the loading spinner
  hideLoader();

  // set the state to be the password manager state
  state = "password_manager";
  updateState();

  settingsPane.updatePane();
  settingsPane.updateTheme();

  // load panes that need open container
  let homePane = new HomePane(container);
  new IdentityPane(container, homePane);
  new RecoveryPane(container, Bip);

  // open the home pane
  $("home_pane_button").click();
}

