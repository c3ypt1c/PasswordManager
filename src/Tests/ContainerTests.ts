import { Account } from "../Account.js";
import { Container } from "../Crypto/Container.js";
import { algorithmBytes, algorithmIvBytes, getRandomBytes, hash, encrypt } from "../Crypto/CryptoFunctions.js";
import { Identity } from "../Crypto/Identity.js";
import { EncryptionType, KeyDerivationFunction } from "../CustomTypes.js";
import { Extra } from "../Extra/Extra.js";
import { Settings } from "../Extra/Settings/Settings.js";
import { log, randomCharacters } from "../Functions.js";
import { RunTest } from "./RunTest.js";

export class ContainerTests extends RunTest {
    constructor() {
        super();

        super.tests = [
            async function Container_test_AES_PBKDF2_1() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "AES" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 100000;
                let kdf = "PBKDF2" as KeyDerivationFunction;
                let memory = 0;
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_AES_Argon2_1() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "AES" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 10;
                let kdf = "Argon2" as KeyDerivationFunction;
                let memory = 2 ** 16;
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_Blow_PBKDF2_1() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "Blow" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 100000;
                let kdf = "PBKDF2" as KeyDerivationFunction;
                let memory = 0;
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_Blow_Argon2_1() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "Blow" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 10;
                let kdf = "Argon2" as KeyDerivationFunction;
                let memory = 2 ** 16;
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            // Multi Passwords

            async function Container_test_AES_PBKDF2_2() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "AES" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 100000;
                let kdf = "PBKDF2" as KeyDerivationFunction;
                let memory = 0;
                await container.addSlot(randomCharacters(64) + "a", algorithm, iterations, kdf, memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_AES_Argon2_2() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "AES" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 10;
                let kdf = "Argon2" as KeyDerivationFunction;
                let memory = 2 ** 16;
                await container.addSlot(randomCharacters(64) + "a", algorithm, iterations, kdf, memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_Blow_PBKDF2_2() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "Blow" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 100000;
                let kdf = "PBKDF2" as KeyDerivationFunction;
                let memory = 0;
                await container.addSlot(randomCharacters(64) + "a", algorithm, iterations, kdf, memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_Blow_Argon2_2() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "Blow" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 10;
                let kdf = "Argon2" as KeyDerivationFunction;
                let memory = 2 ** 16;
                await container.addSlot(randomCharacters(64) + "a", algorithm, iterations, kdf, memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            // Multi Algo

            async function Container_test_AES_PBKDF2_3() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "AES" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 100000;
                let kdf = "PBKDF2" as KeyDerivationFunction;
                let memory = 2 ** 16;
                await container.addSlot(randomCharacters(64) + "a", algorithm, 10, "Argon2", memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_AES_Argon2_3() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "AES" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 10;
                let kdf = "Argon2" as KeyDerivationFunction;
                let memory = 2 ** 16;
                await container.addSlot(randomCharacters(64) + "a", algorithm, iterations, "PBKDF2", memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_Blow_PBKDF2_3() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "Blow" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 100000;
                let kdf = "PBKDF2" as KeyDerivationFunction;
                let memory = 2 ** 16;
                await container.addSlot(randomCharacters(64) + "a", algorithm, 10, "Argon2", memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_Blow_Argon2_3() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "Blow" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));

                let defaultIdentity = new Identity(identityData);

                container.identities = [defaultIdentity];
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 10;
                let kdf = "Argon2" as KeyDerivationFunction;
                let memory = 2 ** 16;
                await container.addSlot(randomCharacters(64) + "a", algorithm, iterations, "PBKDF2", memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                return container.identities == null ? false : container.identities[0].identityName == identityName;
            },

            async function Container_test_Blow_Argon2_Intensive_1() {
                let container = new Container();

                let password = randomCharacters(32);

                let identityName = randomCharacters(64);
                let identityData = JSON.stringify({
                    "accounts": [],
                    "identityDesc": randomCharacters(64),
                    "identityName": identityName,
                });

                let algorithm = "Blow" as EncryptionType;
                let masterKey = getRandomBytes(algorithmBytes(algorithm));
                let containerIv = getRandomBytes(algorithmIvBytes(algorithm));
                let testingIdentity = new Identity(identityData);

                let identities: Identity[] = [];
                // create 10 identities
                for (let i = 0; i < 100; i++) {
                    // create identity
                    let iData = JSON.stringify(
                        {
                            "accounts": [],
                            "identityDesc": randomCharacters(64),
                            "identityName": randomCharacters(64),
                        }
                    );

                    let identity = new Identity(iData);

                    // create 100 accounts
                    for (let i = 0; i < 100; i++) {
                        let accountData = {
                            "website": randomCharacters(64),
                            "password": randomCharacters(64),
                            "login": randomCharacters(64),
                            "extra": new Extra().getJSON(),
                        };

                        identity.accounts.push(new Account(accountData));
                    }

                    identities.push(identity);
                }

                identities.push(testingIdentity);

                container.identities = identities;
                container.settings = new Settings();
                container.iv = containerIv;
                container.encryptionType = algorithm;
                container.dataHash = encrypt(algorithm, masterKey, containerIv, hash(masterKey));

                // create slot
                let iterations = 10;
                let kdf: KeyDerivationFunction = "Argon2";
                let memory = 2 ** 15;
                await container.addSlot(randomCharacters(64) + "a", algorithm, iterations, kdf, memory, masterKey);
                await container.addSlot(randomCharacters(64) + "b", algorithm, iterations, kdf, memory, masterKey);
                await container.addSlot(randomCharacters(64) + "c", algorithm, iterations, kdf, memory, masterKey);
                await container.addSlot(password, algorithm, iterations, kdf, memory, masterKey);
                await container.addSlot("password", algorithm, iterations, kdf, memory, masterKey);
                await container.lock();

                await container.unlock(password);

                let containerJSON = container.getJSON()
                log(containerJSON);
                log(containerJSON.length);

                container.save();

                return container.identities == null ? false : container.identities[100].identityName == identityName;
            },
        ];
    }
}