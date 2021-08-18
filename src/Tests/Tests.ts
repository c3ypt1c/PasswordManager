import { ExtraTests } from "./ExtraTests.js";
import { $, hideLoader } from "./../DOM/DOMHelper.js";
import { ContainerTests } from "./ContainerTests.js";

export class Tests {
    constructor() {
        // Get rid of loader
        hideLoader();


        window.addEventListener("load", () => setTimeout(() => new Promise( () => runTests() ), 1000));
    }
}

function runTests() {
    let tests_dom = $("tests");
    let tests = [new ExtraTests(), new ContainerTests()];

    //TODO: Slot
    //TODO: BIP
    //TODO: Shamir
    //TODO: Account
    //TODO: Identity
    //TODO: Settings
    //TODO: CryptoFunctions

    for(let test = 0; test < tests.length; test++) {
        new Promise(() => tests[test].RunTests(tests_dom));
    }
}
