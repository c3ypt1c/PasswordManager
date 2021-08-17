import { ExtraTests } from "./ExtraTests.js";
import { $, hideLoader } from "./../DOM/DOMHelper.js";

export class Tests {
    constructor() {
        // Get rid of loader
        hideLoader();


        window.addEventListener("load", () => setTimeout(runTests, 1000));
    }
}

function runTests() {
    let tests_dom = $("tests");
    let tests = [new ExtraTests()];

    //TODO: Container
    //TODO: Slot
    //TODO: BIP
    //TODO: Shamir
    //TODO: Account
    //TODO: Identity
    //TODO: Settings
    //TODO: CryptoFunctions

    for(let test = 0; test < tests.length; test++) {
        tests[test].RunTests(tests_dom);
    }
}
