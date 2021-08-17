let check = "✅"; //✔️
let cross = "❎"; //❌

export class Result {
    test_result: string;
    function_name: string;
    constructor(test_result: string, function_name: string) {
        this.test_result = test_result;
        this.function_name = function_name;
    }
    

}

export class RunTest {
    tests = [] as (() => Promise<boolean>)[];

    RunTests(resultObject : HTMLElement) {
        for(let test = 0; test < this.tests.length; test++) {
            let currentTest = this.tests[test];

            // create objects
            let domObject = document.createElement("div");
            let testName = document.createElement("div");
            let testResult = document.createElement("div");
            domObject.appendChild(testResult);
            domObject.appendChild(testName);
            resultObject.appendChild(domObject);

            // assign values
            domObject.classList.add("test");
            testName.classList.add("test-title");
            testResult.classList.add("test-result");

            testName.textContent = currentTest.name;
            testResult.textContent = "Waiting...";

            currentTest().then((res) => {
                testResult.textContent = res ? check : cross; 
            }, (reason) => {
                testResult.textContent = reason;
                testResult.textContent += " " + cross;
            });
        }
    }
}