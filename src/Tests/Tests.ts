import {ExtraDataSorted} from "./../Extra/Extra.js";
import {log} from "./../Functions.js";

class Result {
    test_result: string;
    function_name: string;
    constructor(test_result : string, function_name : string) {
        this.test_result = test_result;
        this.function_name = function_name;
    }
}

// == Async Tests == 

log("Testing ExtraDataSorted");

function ExtraDataSorted_test_1() {
    let extraData = new ExtraDataSorted();
    extraData.addIndex("a", 1);
    extraData.addIndex("b", 2);
    log(extraData);
    return true;
}

let tests = [
    ExtraDataSorted_test_1,

] as Function[];

let testResults = [];
for(let test = 0; test < tests.length; test++) {
    let currentTest = tests[test];
    let result = false;
    let exception = "";
    try {
        result = currentTest();
    } catch (e) {
        exception = "Test " + currentTest.name + " exited with exception " + e;
        log(exception);
    }

    testResults.push(new Result(result ? "Passed" : "Failed", currentTest.name));
}

// print results
console.table(testResults);

