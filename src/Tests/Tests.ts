import { ExtraTests } from "./ExtraTests.js";
import { $, hideLoader } from "./../DOM/DOMHelper.js";
import { ContainerTests } from "./ContainerTests.js";
import { BIPTests } from "./BIPTests.js";
import { ShamirTests } from "./ShamirTests.js";
import { RunTest } from "./RunTest.js";

export class Tests {
    constructor() {
        // Get rid of loader
        hideLoader();

        window.addEventListener("load", () => setTimeout(() => new Promise( () => runTests() ), 1000));
    }
}

function runTests() {
    let tests_dom = $("tests");
    let tests : RunTest[];
    tests = [
        new ContainerTests(),
        new ExtraTests(),
        new BIPTests(),
        new ShamirTests(),
    ];

    //TODO: Slot
    //TODO: Account
    //TODO: Identity
    //TODO: Settings
    //TODO: CryptoFunctions

    for(let test = 0; test < tests.length; test++) {
        new Promise(() => tests[test].RunTests(tests_dom));
    }
}
