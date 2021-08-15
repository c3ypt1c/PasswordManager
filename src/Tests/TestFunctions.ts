import { log } from "../Functions.js";
import { Result } from "./iTest.js";

export function interTests(tests: Function[]) {
    let testResults = [];
    for (let test = 0; test < tests.length; test++) {
        let currentTest = tests[test];
        log("Running test: " + currentTest.name);
        let startTime = new Date().getTime();
        let result = false;
        let exception = "";
        try {
            result = currentTest();
        } catch (e) {
            exception = "Test " + currentTest.name + " exited with exception " + e;
            log(exception);
        }
        log("Took {}ms...".replace("{}", (new Date().getTime() - startTime).toString()))
        testResults.push(new Result(result ? "Passed" : "Failed", currentTest.name));
    }

    // print results
    console.table(testResults, ["function_name", "test_result"]);
}