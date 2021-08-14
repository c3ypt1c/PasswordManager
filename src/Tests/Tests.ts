import { Extra } from "./../Extra/Extra.js";
import { log, randomCharacters } from "./../Functions.js";

export class Tests {
    constructor() {
        // == Sync Tests == 
        log("Testing ExtraDataSorted");

        function Extra_test_random_1() {
            let extraData = new Extra();
            const MAX_LOOPS = 100_000;
            const checkingIndex = Math.floor(Math.random() * (MAX_LOOPS - 1));

            let myIdentifier;
            let myData;
            for (let i = 0; i < MAX_LOOPS; i++) {
                let identifier = randomCharacters(16);
                let data = randomCharacters(16);

                // Check for collisions now
                if (i > checkingIndex) {
                    // while a collision exists
                    while (myIdentifier == identifier) {
                        // reroll identifier 
                        identifier = randomCharacters(16);
                    }
                }

                // since this i is chosen, this will be the data
                if (i == checkingIndex) {
                    myIdentifier = identifier;
                    myData = data;
                }

                extraData.setData(identifier, data);
            }

            // As any because my identifier will always fall between the bounds.
            return extraData.getData(myIdentifier as any) == myData;
        }

        // Extra
        let syncTests_Extra = [
            function Extra_test_full_1() {
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

            function Extra_test_simple_3() {
                let extraData = new Extra();
                extraData.setData("test", "test");
                extraData.setData("teset", "test string");

                return extraData.getData("test") == "test";
            },

            function Extra_test_simple_4() {
                let extraData = new Extra();
                extraData.setData("test", "test");
                extraData.setData("teset", "test string");
                extraData.setData("test", "updated value");

                return extraData.getData("test") == "updated value";
            },

            Extra_test_random_1,

            function Extra_test_random_2() {
                // small brute force
                for (let i = 0; i < 5; i++) {
                    if (!Extra_test_random_1()) return false;
                }

                return true;
            }
        ];

        interTests(syncTests_Extra);

        //TODO: Container
        //TODO: Slot
        //TODO: BIP
        //TODO: Shamir
        //TODO: Account
        //TODO: Identity
        //TODO: Settings
        //TODO: CryptoFunctions
    }
}

class Result {
    test_result: string;
    function_name: string;
    constructor(test_result: string, function_name: string) {
        this.test_result = test_result;
        this.function_name = function_name;
    }
}

function interTests(tests: Function[]) {
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
