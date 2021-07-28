export function algorithmBytes(algorithm : "Blow" | "AES") {
    return algorithm != "Blow" ? 32 : 56; 
    //AES has 32 byte keys
    //Blowfish has 56 byte keys
}

const Argon2 = require("argon2");

export async function hashArgon2(memory: number, iterations: number, salt: any, keySize: number, password: string) {
    let optionals = {
        type: Argon2.argon2id,
        memoryCost: memory,
        timeCost: iterations,
        salt: salt,
        hashLength: keySize,
        raw: true,
        }

    return await Argon2.hash(password, optionals) as Uint8Array;
}

const Crypto = require("crypto");

export async function hashPBKDF2(iterations: number, salt: string | ArrayBuffer | Buffer | DataView, keySize: number, password: string | ArrayBuffer | Buffer | DataView) : Promise<Uint8Array> {
    iterations = iterations > 4294967296 ? 4294967295 : iterations; //keep to the limit
    return new Promise( (res, rej)  => {
        // This is stupid. Please fix node. 
        // https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2sync_password_salt_iterations_keylen_digest
        // https://stackoverflow.com/questions/49717731/error-no-callback-provided-to-pbkdf2-when-using-async-await#54032711
        Crypto.pbkdf2(password, salt, iterations, keySize, "sha512", (err : any, key : Buffer) => err ? rej(err) : res(Uint8Array.from(key)));
    });
}

const aesjs = require('aes-js');

export function encryptAES(key : Uint8Array, iv : Uint8Array, data : Uint8Array) {
    if(data.length == 0) throw "Data is empty...";

    // add padding to data (at least 16 is added for the sake of consistancy)
    let paddingRequired = 16 + (16 - (data.length % 16)) - 1;
    let randomBytes = getRandomBytes(paddingRequired);

    // make data something i can work with...
    let numberArray = Array.from(data);

    for(let index = 0; index < randomBytes.length; index++) {
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

export function decryptAES(key: Uint8Array, iv : Uint8Array, encryptedData : any) {
    let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    let decryptedData = Uint8Array.from(aesCbc.decrypt(encryptedData));

    // remove padding
    let paddingRequired = decryptedData[decryptedData.length - 1];
    return decryptedData.subarray(0, decryptedData.length - paddingRequired - 1);
}

const Blowfish = require('egoroof-blowfish');

export function encryptBlowfish(key: Uint8Array, iv: Uint8Array, data: Uint8Array | string) {
    let bf = new Blowfish(key, Blowfish.MODE.CBC);
    bf.setIv(iv);
    return bf.encode(data) as Uint8Array;
}

export function decryptBlowfish(key: Uint8Array, iv: Uint8Array, encryptedData: Uint8Array, getUint8Array=true) {
    let bf = new Blowfish(key, Blowfish.MODE.CBC);
    bf.setIv(iv);
    let type = getUint8Array ? Blowfish.TYPE.UINT8_ARRAY : Blowfish.TYPE.STRING;
    return bf.decode(encryptedData, type) as Uint8Array;
}

export function getRandomBytes(length : number) : Uint8Array {
    return Crypto.randomBytes(length) as Uint8Array;
}

export async function getKeyHash(keyDerivationFunction : "Argon2" | "PBKDF2", rounds: number, salt: Uint8Array, keyByteSize: number, password: string, roundsMemory : number | null) {
    let key : Uint8Array;
    switch(keyDerivationFunction) {
        case "Argon2":
        if(roundsMemory == null) throw "Argon2 NEEDS 'roundsMemory'. roundsMemory is null";
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

export function encrypt(encryptionType : "AES" | "Blow", key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
    let encryptedData : Uint8Array;
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

export function decrypt(encryptionType : "AES" | "Blow", key: Uint8Array, iv: Uint8Array, encryptedData: Uint8Array): Uint8Array {
    let decryptedData : Uint8Array;
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

export function hash(data : Uint8Array) {
    let hashElement = Crypto.createHash("sha512", data);
    hashElement.update(data);
    return Uint8Array.from(hashElement.digest());
}
