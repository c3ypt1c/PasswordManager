import { generateBIPs, generateScheme, recoverFromBIPs, recoverSecret } from "../Recovery/Shamir.js";
import { RunTest } from "./RunTest.js";
import { compareArrays, log } from "../Functions.js";
import { getRandomBytes } from "../Crypto/CryptoFunctions.js";

export class ShamirTests extends RunTest {
    constructor() {
        super();

        super.tests = [
            async function Shamir_test_default() {
                // conduct test
                let secret = getRandomBytes(80);
                log("testing shamir");
                log(secret);

                let shamir = generateScheme(secret, 5, 2);
                log(shamir);
                delete shamir["1"];
                delete shamir["2"];
                log(shamir);

                let recovered = recoverSecret(shamir);
                log(recovered);

                if (compareArrays(secret, recovered)) log("test complete");
                else log("test failed");

                log("testing shamir BIPs");
                log(secret);
                let chunks = generateBIPs(secret, 10, 8);
                log(chunks);
                chunks.splice(3, 2); //delete index 3 and 4
                log(chunks);

                let recovered2 = recoverFromBIPs(chunks);
                log(recovered2);

                return compareArrays(recovered2, secret);
            },

            async function Shamir_test_random_scheme_1() {
                let secret = getRandomBytes(256);
                let parts: number;
                let originalParts = parts = Math.floor(Math.random() * 30) + 5;
                let threshhold = Math.floor(Math.random() * 20) + 5;
                parts += threshhold > parts ? threshhold : 0;
                let takenParts = new Map<number, void>();

                let shamir = generateScheme(secret, parts, threshhold);

                // delete elements from the scheme
                while (threshhold < parts) {
                    let selectedPiece = Math.floor(Math.random() * originalParts) + 1;
                    if (takenParts.has(selectedPiece)) continue;

                    takenParts.set(selectedPiece);
                    delete shamir[selectedPiece.toString()];
                    parts--;
                }

                let newSecret = recoverSecret(shamir);
                return compareArrays(secret, newSecret);
            },

            async function Shamir_test_random_scheme_2() {
                let secret = getRandomBytes(2*11);
                let parts: number;
                let originalParts = parts = Math.floor(Math.random() * 100) + 5;
                let threshhold = Math.floor(Math.random() * 80) + 5;
                parts += threshhold > parts ? threshhold : 0;
                let takenParts = new Map<number, void>();

                let shamir = generateScheme(secret, parts, threshhold);

                // delete elements from the scheme
                while (threshhold < parts) {
                    let selectedPiece = Math.floor(Math.random() * originalParts) + 1;
                    if (takenParts.has(selectedPiece)) continue;

                    takenParts.set(selectedPiece);
                    delete shamir[selectedPiece.toString()];
                    parts--;
                }

                let newSecret = recoverSecret(shamir);
                return compareArrays(secret, newSecret);
            },

            async function Shamir_test_random_scheme_intensive_1() {
                let passed = true;
                for (let _ = 0; _ < 1000; _++) {
                    let secret = getRandomBytes(128);
                    let parts: number;
                    let originalParts = parts = Math.floor(Math.random() * 30) + 5;
                    let threshhold = Math.floor(Math.random() * 20) + 5;
                    parts += threshhold > parts ? threshhold : 0;
                    let takenParts = new Map<number, void>();

                    let shamir = generateScheme(secret, parts, threshhold);

                    // delete elements from the scheme
                    while (threshhold < parts) {
                        let selectedPiece = Math.floor(Math.random() * originalParts) + 1;
                        if (takenParts.has(selectedPiece)) continue;

                        takenParts.set(selectedPiece);
                        delete shamir[selectedPiece.toString()];
                        parts--;
                    }

                    let newSecret = recoverSecret(shamir);
                    passed = compareArrays(secret, newSecret);
                    if(!passed) {
                        debugger;
                        break;
                    }
                }

                return passed;
            }
        ]
    }
}