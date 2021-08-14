/**
 * Supported encryption type
 */
export type EncryptionType = "AES" | "Blow";

/**
 * Supported Key Derivation Function
 */
export type KeyDerivationFunction = "Argon2" | "PBKDF2";

/**
 * Structure of Container.getJSON().
 */
export type JSONContainerData = {
    "slots" ?: string[],
    "encryptedIdentities" ?: string,
    "encryptedSettings" ?: string,
    "iv" ?: string,
    "encryptionType" ?: EncryptionType,
    "dataHash" ?: string
}

/**
 * States used to manage the password manager.
 */
export type State = "login" | "password_manager" | "create_container";