export type EncryptionType = "AES" | "Blow";
export type KeyDerivationFunction = "Argon2" | "PBKDF2";

export type JSONContainerData = {
    "slots" ?: string[],
    "encryptedIdentities" ?: string,
    "encryptedSettings" ?: string,
    "iv" ?: string,
    "encryptionType" ?: EncryptionType,
    "dataHash" ?: string
}