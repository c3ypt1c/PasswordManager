import { Account } from "./../../Account.js";
import { Container } from "./../../Crypto/Container.js";
import { Pane } from "./Pane.js"
import { $, $$, $$$, removeAllChildren, disableStatus } from "./../../DOM/DOMHelper.js";
import { log } from "../../Functions.js";
import { generatePassword } from "./../../Crypto/CryptoFunctions.js";
import { Settings } from "./../../Extra/Settings/Settings.js";
import { DOMConfirm } from "../../DOM/DOMConfirm.js";

let container: Container;
let account = 0;
let currentIdentity = 0;

export class HomePane extends Pane {
    account?: Account;

    constructor(container_: Container) {
        super("home_pane", "home_pane_button");
        container = container_;

        // Add listeners
        // add account
        $("add_account").addEventListener("click", createAccount);

        // add change listener
        $("account_website").addEventListener("input", saveAccountChanges);
        $("account_username").addEventListener("input", saveAccountChanges);
        $("account_password").addEventListener("input", saveAccountChanges);

        // Toggle to show password
        $("account_show_password").addEventListener("change", showHidePassword);

        // Delete account
        $("account_delete").addEventListener("click", () => new DOMConfirm(removeAccount, () => {}, "Delete account?", "Are you sure you want to remove this account?", "Remove account"));

        // Copy password
        $("account_copy_password").addEventListener("click", copyPassword);

        // Generate password
        $("account_generate_password").addEventListener("click", askGeneratePasswordForAccount);

        // add search
        $("search_home").addEventListener("input", () => { updateHomePane() });
    }

    updatePane(currentIdentity_: number): void {
        currentIdentity = currentIdentity_;
        updateHomePane();
    }
}

function showHidePassword() {
    ($("account_password") as HTMLInputElement).type = ($("account_show_password") as HTMLInputElement).checked ? "text" : "password";
}

function createAccount() {
    log("create account");
    // get data
    let identity = container.getIdentites()[currentIdentity];
    let accounts = identity.accounts;

    let newAccount = new Account();
    accounts.push(newAccount);

    account = accounts.length - 1;

    container.save(); // save new account

    updateHomePane();
}

function removeAccount() {
    let identity = container.getIdentites()[currentIdentity];
    log("deleted: ");
    log(identity.accounts.splice(account, 1));

    container.save() // save deleted account

    account--;
    updateHomePane();
}

function saveAccountChanges() {
    // get data
    let identity = container.getIdentites()[currentIdentity];
    let accounts = identity.accounts;
    let currentAccount = accounts[account];

    log("saving account number: " + account);

    let account_website = $("account_website") as HTMLInputElement;
    let account_username = $("account_username") as HTMLInputElement;
    let account_password = $("account_password") as HTMLInputElement;

    currentAccount.website = account_website.value;
    currentAccount.login = account_username.value;
    currentAccount.password = account_password.value;

    container.save();
    updateHomePane(false);
}

function updateAccountPane() {
    // get data
    let identity = container.getIdentites()[currentIdentity];
    log(identity);

    let accounts = identity.accounts;
    log(accounts);

    let currentAccount = accounts[account];
    log(currentAccount);

    let account_website = $("account_website") as HTMLInputElement;
    let account_username = $("account_username") as HTMLInputElement;
    let account_password = $("account_password") as HTMLInputElement;
    let account_generate_password = $("account_generate_password") as HTMLInputElement;
    let account_copy_password = $("account_copy_password") as HTMLInputElement;
    let account_show_password = $("account_show_password") as HTMLInputElement;
    let account_delete = $("account_delete") as HTMLInputElement;

    let toDisable = [account_website, account_username, account_password, account_generate_password, account_copy_password, account_show_password, account_delete];

    // make off by default
    account_show_password.checked = false;
    showHidePassword();

    if (accounts.length == 0) {
        // disable them and clear them
        disableStatus(toDisable, true);

    } else {
        // enable them 
        disableStatus(toDisable, false);

        // fill them with data
        account_website.value = currentAccount.website;
        account_username.value = currentAccount.login;
        account_password.value = currentAccount.password;
    }
}

/* account entry should look like this
<a href="#" class="list-group-item list-group-item-action py-3 lh-tight">
<div class="d-flex w-100 align-items-center justify-content-between">
  <strong class="mb-1">Website</strong>
  //<small class="text-muted">Tues</small>
</div>
<div class="col-10 mb-1 small">Email</div>
</a>
*/

/* empty field should look like this
<div class="d-block my-auto small text-center text-muted">No accounts in identity.</div>
*/
function updateHomePane(updateAccountToo = true) {
    log("update home page. ");
    let account_space = $("account_space");

    let searchString = ($("search_home") as HTMLInputElement).value;

    // clear
    removeAllChildren(account_space);

    // create entries
    let identity = container.getIdentites()[currentIdentity];
    let accounts = identity.accounts;

    // check data
    account = accounts.length <= account ? accounts.length - 1 : (account < 0 ? 0 : account);

    let validAccounts = [];
    let currentAccountInvalid = false;
    for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
        // get the account
        let accountObject = accounts[accountIndex];
        if (accountSearchMatch(accountObject, searchString)) validAccounts.push(accountIndex);
        else currentAccountInvalid = currentAccountInvalid || accountIndex == account;
    }

    log("valid accounts: ");
    log(validAccounts);

    if (currentAccountInvalid) {
        if (validAccounts.length > 0) account = validAccounts[0]; // if the current account is invalid, return the first instance of a valid account
        else account = 0; // or just 0 when there is nothing.
    }

    log("account number: " + account);

    if (validAccounts.length == 0 && currentAccountInvalid) {
        // there is nothing valid
        let emptyAccountNotif = document.createElement("div");
        emptyAccountNotif.classList.add("d-block", "my-auto", "small", "text-center", "text-muted");
        emptyAccountNotif.textContent = "No accounts matching search term '" + searchString + "' in identity '" + identity.identityName + "'";
        account_space.appendChild(emptyAccountNotif);

    } else if (accounts.length == 0) {
        // there is no accounts
        let emptyAccountNotif = document.createElement("div");
        emptyAccountNotif.classList.add("d-block", "my-auto", "small", "text-center", "text-muted");
        emptyAccountNotif.textContent = "No accounts in identity '" + identity.identityName + "'";
        account_space.appendChild(emptyAccountNotif);

    } else {
        // fill them with data
        for (let validAccountsIndex = 0; validAccountsIndex < validAccounts.length; validAccountsIndex++) {
            // get the account
            let accountIndex = validAccounts[validAccountsIndex];
            let accountObject = accounts[accountIndex];

            // make elements
            let a = document.createElement("a");
            a.href = "#";
            a.classList.add("list-group-item", "list-group-item-action", "py-3", "lh-tight");
            if (accountIndex == account) a.classList.add("active");

            let divTop = document.createElement("div");
            divTop.classList.add("d-flex", "w-100", "align-items-center", "justify-content-between");

            let divTopStrong = document.createElement("strong");
            divTopStrong.classList.add("mb-1");
            divTopStrong.textContent = accountObject.website;

            divTop.appendChild(divTopStrong);
            a.appendChild(divTop);

            let divBottom = document.createElement("div");
            divBottom.classList.add("col-10", "mb-1", "small");
            divBottom.textContent = accountObject.login;

            a.appendChild(divBottom);

            // add event listener
            a.addEventListener("click", () => {
                account = accountIndex;
                log("Changed account number to: " + account);
                updateHomePane();
            })

            account_space.appendChild(a);
        }
    }

    if (updateAccountToo) updateAccountPane();
}

function accountSearchMatch(accountObject: Account, searchString: string) {
    searchString = searchString.trim().toLocaleLowerCase();
    if (searchString == "") return true;

    let login = accountObject.login.trim().toLocaleLowerCase();
    let website = accountObject.website.trim().toLocaleLowerCase();
    return login.includes(searchString) || website.includes(searchString);
}

function askGeneratePasswordForAccount() {
    let account_password = $("account_password") as HTMLInputElement;
    if(account_password.value != "") new DOMConfirm(generatePasswordForAccount, () => {}, "Overwrite password?", "Do you want to overwrite the current password?");
    else generatePasswordForAccount();
}

function generatePasswordForAccount() {
    if(container.getIdentites()[currentIdentity].accounts.length == 0) return;

    let account_password = $("account_password") as HTMLInputElement;
    let password = generatePassword((container.settings == null ? new Settings() : container.settings).passwordSettings);
    account_password.value = password;

    saveAccountChanges();
}

async function copyPassword() {
    let account_password = $("account_password") as HTMLInputElement;
    await navigator.clipboard.writeText(account_password.value);
}