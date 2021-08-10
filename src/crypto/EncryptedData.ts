import { encrypt, decrypt, hash, getRandomBytes, algorithmIvBytes } from "./CryptoFunctions.js";
import { log, convertToUint8Array, convertToBase64, convertFromBase64, compareArrays } from "./../Functions.js";
import { DecryptedData, EncryptionType } from "../CustomTypes.js";
import { Settings } from "../Extra/Settings/Settings.js";
import { Identity } from "../Identity.js";

export class EncryptedData implements iJSON {
    private rawData : string;

    identities ?: Identity[];
    settings ?: Settings;
    /**
     * 
     * @param encryptedData Base64 encoded uint8array encrypted JSON. 
     */
    constructor(encryptedData : string) {
        this.rawData = encryptedData;
    }

    decrypt(encryptionType : EncryptionType, key : Uint8Array, iv : Uint8Array) {
        let decryptedDataArray = decrypt(encryptionType, key, iv, convertFromBase64(this.rawData));
        let decryptedData = JSON.parse(Buffer.from(decryptedDataArray).toString("utf-8")) as DecryptedData;
        let decryptedIdentities = decryptedData.identities;

        this.settings = new Settings(decryptedData.settings);

        this.identities = [];
        for (let index = 0; index < decryptedIdentities.length; index++) {
          this.identities.push(new Identity(decryptedIdentities[index]));
        }
    }

    encrypt(encryptionType : EncryptionType, key : Uint8Array, iv : Uint8Array) {
        
    }

    getJSON() {
        return "";
    }
}