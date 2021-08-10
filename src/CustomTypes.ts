export type EncryptionType = "AES" | "Blow";
export type KeyDerivationFunction = "Argon2" | "PBKDF2";

export type JSONContainerData = {
    "slots" ?: string[],
    "encryptedData" ?: string,
    "iv" ?: string,
    "encryptionType" ?: EncryptionType,
    "dataHash" ?: string
}

export type DecryptedData = {
    "identities" : string,
    "settings" : string
}