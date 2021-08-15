import { PasswordSettings } from "../Extra/Settings/PasswordSettings.js";
import { EncryptionType, KeyDerivationFunction } from "../CustomTypes.js";
import { Settings } from "../Extra/Settings/Settings.js";

/**
 * AES has 32 byte keys
 * Blowfish has 56 byte keys
 * @param algorithm the algorithm for bytes.
 * @returns Returns the correct length of bytes a key should be for different algorithms
 */
export function algorithmBytes(algorithm: EncryptionType) {
    return algorithm != "Blow" ? 32 : 56;
}

/**
 * Blowfish has 8 byte IVs
 * AES has 16 byte IVs
 * @param algorithm algorithm for iv bytes
 * @returns Returns the correct IV length in bytes for the different algorithms
 */
export function algorithmIvBytes(algorithm : EncryptionType) {
    return algorithm == "Blow" ? 8 : 16;
}

const Argon2 = require("argon2").hash;

/**
 * The function which hashes using Argon2. {@link https://www.npmjs.com/package/argon2}
 * @param memory memory costs
 * @param iterations time costs
 * @param salt salt
 * @param keySize key size to return
 * @param password password to hash
 * @returns Argon2 hash as {@link Uint8Array}
 */
export async function hashArgon2(memory: number, iterations: number, salt: any, keySize: number, password: string) {
    let optionals = {
        type: Argon2.argon2id,
        memoryCost: memory,
        timeCost: iterations,
        salt: salt,
        hashLength: keySize,
        raw: true,
    }

    return await Argon2(password, optionals) as Uint8Array;
}

const Crypto = require("crypto");

/**
 * Function hashing using PBKDF2-SHA512. {@link https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback}
 * @param iterations time costs
 * @param salt salt
 * @param keySize key size to return
 * @param password password to hash
 * @returns a PBKDF2-SHA512 hash. 
 */
export async function hashPBKDF2(iterations: number, salt: string | ArrayBuffer | Buffer | DataView, keySize: number, password: string | ArrayBuffer | Buffer | DataView): Promise<Uint8Array> {
    iterations = iterations > 4294967296 ? 4294967295 : iterations; //keep to the limit
    return new Promise((res, rej) => {
        // This is stupid. Please fix node. 
        // https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2sync_password_salt_iterations_keylen_digest
        // https://stackoverflow.com/questions/49717731/error-no-callback-provided-to-pbkdf2-when-using-async-await#54032711
        Crypto.pbkdf2(password, salt, iterations, keySize, "sha512", (err: any, key: Buffer) => err ? rej(err) : res(Uint8Array.from(key)));
    });
}

/**
 * Generates a password given the settings
 * @param The {@link PasswordSettings password settings} that will be used to generate the password. 
 * @returns a password that follows the rules in the {@link PasswordSettings password settings}. If a password cannot be generated, "" is returned. 
 */
export function generatePassword(passwordSettings ?: PasswordSettings) {
    passwordSettings = passwordSettings == null ? new Settings().passwordSettings : passwordSettings;
    let charactarPool = "";
    charactarPool += passwordSettings.includeLowercase ? passwordSettings.lowercase : "";
    charactarPool += passwordSettings.includeUppercase ? passwordSettings.uppercase : "";
    charactarPool += passwordSettings.includeNumbers ? passwordSettings.numbers : "";
    charactarPool += passwordSettings.includeSymbols ? passwordSettings.symbols : "";
    if(charactarPool == "") return "";

    let password = ""; 
    for(let i = 0; i < passwordSettings.passwordLength; i++) {
        // Using crypto for security
        password += charactarPool[Crypto.randomInt(charactarPool.length)];
    }

    return password;
}

const aesjs = require('aes-js');

/**
 * Encrypt data with key and iv. This function also padds the data to make it fit within 16 bytes. 
 * @param key key to encrypt with
 * @param iv iv to encrypt with
 * @param data data to encrypt
 * @returns encrypted data
 */
export function encryptAES(key: Uint8Array, iv: Uint8Array, data: Uint8Array) {
    if (data.length == 0) throw "Data is empty...";

    // add padding to data (at least 16 is added for the sake of consistancy)
    let paddingRequired = 16 + (16 - (data.length % 16)) - 1;
    let randomBytes = getRandomBytes(paddingRequired);

    // make data something i can work with...
    let numberArray = Array.from(data);

    for (let index = 0; index < randomBytes.length; index++) {
        numberArray.push(randomBytes[index]);
    }

    // add length...
    numberArray.push(paddingRequired);

    //convert back
    data = Uint8Array.from(numberArray);

    // must be block of 16 after conversion...
    let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    return aesCbc.encrypt(data);
}

/**
 * Decrypt encrypted data with key and iv. This function also removes the pad added to the data to make it fit within 16 bytes. 
 * @param key key to decrypt with
 * @param iv iv to decrypt with
 * @param data data to decrypt
 * @returns decrypted data
 */
export function decryptAES(key: Uint8Array, iv: Uint8Array, encryptedData: any) {
    let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    let decryptedData = Uint8Array.from(aesCbc.decrypt(encryptedData));

    // remove padding
    let paddingRequired = decryptedData[decryptedData.length - 1];
    return decryptedData.subarray(0, decryptedData.length - paddingRequired - 1);
}

const Blowfish = require('egoroof-blowfish');

/**
 * Encrypt with blowfish.
 * @param key key to encrypt with
 * @param iv iv to encrypt with
 * @param data data to encrypt
 * @returns encrypted data
 */
export function encryptBlowfish(key: Uint8Array, iv: Uint8Array, data: Uint8Array | string) {
    let bf = new Blowfish(key, Blowfish.MODE.CBC);
    bf.setIv(iv);
    return bf.encode(data) as Uint8Array;
}

/**
 * Decrypt with blowfish.
 * @param key key to decrypt with
 * @param iv iv to decrypt with
 * @param data data to decrypt
 * @returns decrypted data
 */
export function decryptBlowfish(key: Uint8Array, iv: Uint8Array, encryptedData: Uint8Array, getUint8Array = true) {
    let bf = new Blowfish(key, Blowfish.MODE.CBC);
    bf.setIv(iv);
    let type = getUint8Array ? Blowfish.TYPE.UINT8_ARRAY : Blowfish.TYPE.STRING;
    return bf.decode(encryptedData, type) as Uint8Array;
}

/**
 * Generates random bytes
 * @param length how many bytes to generate
 * @returns an array of random bytes the size specified.  
 */
export function getRandomBytes(length: number): Uint8Array {
    return Crypto.randomBytes(length) as Uint8Array;
}

/**
 * Get the hash given the function and settings
 * @param keyDerivationFunction the hash function to use
 * @param rounds time costs
 * @param salt salt
 * @param keyByteSize bytes to return 
 * @param password string to hash, usually a password
 * @param roundsMemory memory costs (Argon2 only)
 * @returns hashed represetation of the password parameter given the settings. 
 */
export async function getKeyHash(keyDerivationFunction: KeyDerivationFunction, rounds: number, salt: Uint8Array, keyByteSize: number, password: string, roundsMemory: number | null) {
    let key: Uint8Array;
    switch (keyDerivationFunction) {
        case "Argon2":
            if (roundsMemory == null) throw "Argon2 NEEDS 'roundsMemory'. roundsMemory is null";
            key = await hashArgon2(roundsMemory, rounds, salt, keyByteSize, password);
            break;

        case "PBKDF2":
            key = await hashPBKDF2(rounds, salt, keyByteSize, password);
            break;

        default:
            throw keyDerivationFunction + " is not a supported derivation function";
    }
    return key;
}

/**
 * Encrypt data
 * @param encryptionType the encrypton type to use 
 * @param key the key to use
 * @param iv the iv to use
 * @param data the data to encrypt
 * @returns encrypted data
 */
export function encrypt(encryptionType: EncryptionType, key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
    let encryptedData: Uint8Array;
    switch (encryptionType) {
        case "AES":
            encryptedData = encryptAES(key, iv, data);
            break;

        case "Blow":
            encryptedData = encryptBlowfish(key, iv, data);
            break;

        default:
            throw encryptionType + " is not a supported encryption type";
    }

    return encryptedData;
}

/**
 * Decrypt data
 * @param encryptionType the encrypton type to use to decrypt
 * @param key the key to use
 * @param iv the iv to use
 * @param data the data to decrypt
 * @returns plain decrypted data
 */
export function decrypt(encryptionType: EncryptionType, key: Uint8Array, iv: Uint8Array, encryptedData: Uint8Array): Uint8Array {
    let decryptedData: Uint8Array;
    switch (encryptionType) {
        case "AES":
            decryptedData = decryptAES(key, iv, encryptedData);
            break;

        case "Blow":
            decryptedData = decryptBlowfish(key, iv, encryptedData);
            break;

        default:
            throw encryptionType + " is not a supported encryption type";
    }

    return decryptedData;
}

/**
 * Fast hash with SHA512
 * @param data data to hash
 * @returns hashed representation
 */
export function hash(data: Uint8Array) {
    let hashElement = Crypto.createHash("sha512", data);
    hashElement.update(data);
    return Uint8Array.from(hashElement.digest());
}
