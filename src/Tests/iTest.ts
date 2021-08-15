export class Result {
    test_result: string;
    function_name: string;
    constructor(test_result: string, function_name: string) {
        this.test_result = test_result;
        this.function_name = function_name;
    }
}

export interface iTest {
    getResult() : Promise<Result>
}