import { getRandomBytes } from "../Crypto/CryptoFunctions.js";
import { compareArrays, log } from "../Functions.js";
import { BIP } from "../Recovery/BIP.js";
import { RunTest } from "./RunTest.js";

export class BIPTests extends RunTest {
    constructor() {
        super();
        let bip = new BIP();

        super.tests = [
            async function BIP_tests_recover_1() {
                let data = getRandomBytes(32);
                let bipData = bip.generateFromUint8Array(data);

                return compareArrays(bip.generateFromWords(bipData), data);
            },

            async function BIP_tests_recover_2() {
                let data = getRandomBytes(256);
                let bipData = bip.generateFromUint8Array(data);

                return compareArrays(bip.generateFromWords(bipData), data);
            },

            async function BIP_tests_recover_3() {
                let data = getRandomBytes(255);
                try {
                    let bipData = bip.generateFromUint8Array(data);
                    bip.generateFromWords(bipData)
                    return false;
                } catch (e) {
                    return true;
                }
            },

            async function BIP_tests_word() {
                return bip.isWordValid("test");
            },
        ];
    }
}