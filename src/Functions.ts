const isDebug = true;

export function log(text : any) {
    if(isDebug) console.log(text);
}

export function convertFromUint8Array(array : Uint8Array) {
    let arr = [];
    for(let item = 0; item < array.length; item++) arr.push(array[item]);
    return arr;
    }

export function convertToUint8Array(text : string) {
    return Uint8Array.from(Buffer.from(text));
}

export function compareArrays(array1 : any, array2 : any) {
    if(array1.length != array2.length) return false;

    for(let i = 0; i < array1.length; i++) {
        if(array1[i] != array2[i]) return false;
    }

    return true;
}
