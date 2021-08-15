/**
 * Log to console
 * @param text text to log
 */
export function log(text: any) {
    const isDebug = true; // enable?
    const isTrace = true; // with trace?

    if (isDebug) if (isTrace) console.trace(text);
    else console.log(text);
}

/**
 * Convert {@link Uint8Array} into a {@link Number number} array.
 * @param array array to convert
 * @returns a number array
 */
export function convertUint8ArrayToNumberArray(array: Uint8Array) {
    let arr = [];
    for (let item = 0; item < array.length; item++) arr.push(array[item]);
    return arr;
}

/**
 * Convert text to {@link Uint8Array}.
 * @param text text to convert
 * @returns a {@link Uint8Array} representation of the text.
 */
export function convertToUint8Array(text: string) {
    return Uint8Array.from(Buffer.from(text));
}

/**
 * convert {@link Uint8Array} to base64
 * @param array {@link Uint8Array} to convert
 * @returns string of base64
 */
export function convertToBase64(array: Uint8Array) {
    return Buffer.from(array).toString("base64");
}

/**
 * Convert from base 64 to {@link Uint8Array}.
 * @param text base 64 text
 * @returns values to {@link Uint8Array} from base 64
 */
export function convertFromBase64(text: string) {
    return Uint8Array.from(Buffer.from(text, "base64"));
}

/**
 * Compare two arrays to see if they're the same
 * @param array1 first array
 * @param array2 second array
 * @returns true if arrays are the same.
 */
export function compareArrays(array1: any, array2: any) {
    if (array1.length != array2.length) return false;

    for (let i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) return false;
    }

    return true;
}

/**
 * Generate random characters. This is not a secure way to generate passwords. 
 * @param length length of characters to generate.
 * @returns random characters
 */
export function randomCharacters(length: number) { // from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}