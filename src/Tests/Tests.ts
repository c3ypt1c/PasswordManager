import {Extra} from "./../Extra/Extra.js";
import {log, randomCharacters} from "./../Functions.js";

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

let syncTests = [
    function Extra_test_1() {
        let extraData = new Extra();
        extraData.setData("test", "test");
        extraData.setData("teset", "test string");

        let pass = extraData.getData("test") == "test";
        pass &&= extraData.getData("teset") == "test string";
        pass &&= !extraData.hadData("not here");
        pass &&= extraData.hadData("test");

        return pass;
    },

    function Extra_test_simple_1() {
        let extraData = new Extra();
        extraData.setData("test", "test");

        return extraData.hadData("test");
    },

    function Extra_test_simple_2() {
        let extraData = new Extra();
        extraData.setData("test", "test");
        extraData.setData("teset", "test string");

        return !extraData.hadData("non existent");
    },

    function Extra_test_4() {
        let extraData = new Extra();
        extraData.setData("test", "test");
        extraData.setData("teset", "test string");

        return extraData.getData("test") == "test";
    },

    function Extra_test_5() {
        let extraData = new Extra();
        extraData.setData("test", "test");
        extraData.setData("teset", "test string");
        extraData.setData("test", "updated value");

        return extraData.getData("test") == "updated value";
    },

    function Extra_test_random_1() {
        let extraData = new Extra();
        const MAX_LOOPS = 1_000_000;
        const checkingIndex = Math.floor(Math.random() * (MAX_LOOPS - 1));

        let myIdentifier;
        let myData;
        for(let i = 0; i < 1_000_000; i++) {
            let identifier = randomCharacters(16);
            let data = randomCharacters(16);

            // Check for collisions now
            if(i > checkingIndex) {
                // while a collision exists
                while(myIdentifier == identifier) {
                    // reroll identifier 
                    identifier = randomCharacters(16);  
                }
            }

            // since this i is chosen, this will be the data
            if(i == checkingIndex) {
                myIdentifier = identifier;
                myData = data;
            }

            extraData.setData(identifier, data);
        }

        // As any because my identifier will always fall between the bounds.
        return extraData.getData(myIdentifier as any) == myData;
    }
];

let testResults = [];
for(let test = 0; test < syncTests.length; test++) {
    let currentTest = syncTests[test];
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
console.table(testResults, ["function_name", "test_result"]);

