const isDebug = true;
const isTrace = true;

export function log(text: any) {
    if (isDebug) if (isTrace) console.trace(text);
    else console.log(text);
}

export function convertUint8ArrayToNumberArray(array: Uint8Array) {
    let arr = [];
    for (let item = 0; item < array.length; item++) arr.push(array[item]);
    return arr;
}

export function convertToUint8Array(text: string) {
    return Uint8Array.from(Buffer.from(text));
}

export function convertToBase64(array: Uint8Array) {
    return Buffer.from(array).toString("base64");
}

export function convertFromBase64(text: string) {
    return Uint8Array.from(Buffer.from(text, "base64"));
}

export function compareArrays(array1: any, array2: any) {
    if (array1.length != array2.length) return false;

    for (let i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) return false;
    }

    return true;
}

export function randomCharacters(length: number) { // from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}