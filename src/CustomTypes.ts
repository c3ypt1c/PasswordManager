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

export type State = "login" | "password_manager" | "create_container";