export type EncryptionType = "AES" | "Blow";
export type KeyDerivationFunction = "Argon2" | "PBKDF2";

export type JSONContainerData = {
    "slots" ?: string[],
    "encryptedIdentities" ?: string,
    "iv" ?: string,
    "encryptionType" ?: EncryptionType,
    "dataHash" ?: string
}