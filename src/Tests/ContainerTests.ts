import { Account } from "../Account.js";
import { Container } from "../Crypto/Container.js";
import { algorithmBytes, algorithmIvBytes, getRandomBytes, hash, encrypt } from "../Crypto/CryptoFunctions.js";
import { Identity } from "../Crypto/Identity.js";
import { EncryptionType, KeyDerivationFunction } from "../CustomTypes.js";
import { Extra } from "../Extra/Extra.js";
import { Settings } from "../Extra/Settings/Settings.js";
import { log, randomCharacters } from "../Functions.js";
import { RunTest } from "./RunTest.js";

/**
 * Helper class designed to keep all data decrypted
 */
class InitialContainerData {
    // values
    algorithm: EncryptionType;
    masterKey: Uint8Array;
    containerIv: Uint8Array;

    defaultIdentity: Identity

    constructor(algorithm: EncryptionType, defaultIdentity?: Identity, masterKey?: Uint8Array, containerIV?: Uint8Array) {
        this.algorithm = algorithm;
        this.masterKey = masterKey == null ? getRandomBytes(algorithmBytes(algorithm)) : masterKey;
        this.containerIv = containerIV == null ? getRandomBytes(algorithmIvBytes(algorithm)) : containerIV;

        if (defaultIdentity == null) {
            let identityName = randomCharacters(64);
            let identityData = JSON.stringify({
                "accounts": [],
                "identityDesc": randomCharacters(64),
                "identityName": identityName,
            });

            this.defaultIdentity = new Identity(identityData);
        } else {
            this.defaultIdentity = defaultIdentity;
        }
    }
}

let slotNumber = 0;
class SlotData {
    // Settings
    DEFAULT_ARGON2_ITERATIONS = 20;
    DEFAULT_ARGON2_MEMORY_COSTS = 2 ** 16;
    DEFAULT_PBKDF2_ITERATIONS = 10000;
    DEFAULT_PASSWORD_LENGTH = 32;

    // values
    iterations: number;
    memory_cost = 0;
    kdf : KeyDerivationFunction;
    password : string; 

    constructor(kdf: KeyDerivationFunction, password ?: string) {
        this.kdf = kdf;
        this.iterations = kdf == "Argon2" ? this.DEFAULT_ARGON2_ITERATIONS : this.DEFAULT_PBKDF2_ITERATIONS;
        if (kdf == "Argon2") this.memory_cost = this.DEFAULT_ARGON2_MEMORY_COSTS;
        this.password = password == null ? randomCharacters(this.DEFAULT_PASSWORD_LENGTH) + slotNumber++ : password;
    }
}


async function makeStandardContainer(containerData: InitialContainerData, slotData?: SlotData) : Promise<Container> {
    let container = new Container();

    container.identities = [containerData.defaultIdentity];
    container.settings = new Settings();
    container.iv = containerData.containerIv;
    container.encryptionType = containerData.algorithm;
    container.dataHash = encrypt(containerData.algorithm, containerData.masterKey, containerData.containerIv, hash(containerData.masterKey));

    // Add slot if data exists
    if (slotData != null) {
        await container.addSlot(slotData.password, container.encryptionType, slotData.iterations, slotData.kdf, slotData.memory_cost, containerData.masterKey);
    }

    return container;
}

async function makeMultiSlotContainer(containerData: InitialContainerData, slotData : SlotData[]) : Promise<Container> {
    let container = await makeStandardContainer(containerData);

    for(let slot = 0; slot < slotData.length; slot++) {
        let currentSlot = slotData[slot];
        await container.addSlot(currentSlot.password, containerData.algorithm, currentSlot.iterations, currentSlot.kdf, currentSlot.memory_cost, containerData.masterKey);
    }

    return container;
}

export class ContainerTests extends RunTest {
    constructor() {
        super();

        super.tests = [
            async function Container_test_AES_PBKDF2_1() {
                let slotData = new SlotData("PBKDF2");
                let containerData = new InitialContainerData("AES");
                let container = await makeStandardContainer(containerData, slotData);
                container.lock();

                await container.unlock(slotData.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_AES_Argon2_1() {
                let slotData = new SlotData("Argon2");
                let containerData = new InitialContainerData("AES");
                let container = await makeStandardContainer(containerData, slotData);
                container.lock();

                await container.unlock(slotData.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_Blow_PBKDF2_1() {
                let slotData = new SlotData("PBKDF2");
                let containerData = new InitialContainerData("Blow");
                let container = await makeStandardContainer(containerData, slotData);
                container.lock();

                await container.unlock(slotData.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_Blow_Argon2_1() {
                let slotData = new SlotData("Argon2");
                let containerData = new InitialContainerData("Blow");
                let container = await makeStandardContainer(containerData, slotData);
                container.lock();

                await container.unlock(slotData.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            // Multi Passwords
            // TODO: Check all the passwords

            async function Container_test_AES_PBKDF2_2() {
                let kdf = "PBKDF2" as KeyDerivationFunction;
                let containerData = new InitialContainerData("AES");
                let slotData1 = new SlotData(kdf);
                let slotData2 = new SlotData(kdf);
                let container = await makeMultiSlotContainer(containerData, [slotData1, slotData2]);

                await container.lock();
                await container.unlock(slotData1.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_AES_Argon2_2() {
                let kdf = "Argon2" as KeyDerivationFunction;
                let containerData = new InitialContainerData("AES");
                let slotData1 = new SlotData(kdf);
                let slotData2 = new SlotData(kdf);
                let container = await makeMultiSlotContainer(containerData, [slotData1, slotData2]);

                await container.lock();
                await container.unlock(slotData1.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_Blow_PBKDF2_2() {
                let kdf = "PBKDF2" as KeyDerivationFunction;
                let containerData = new InitialContainerData("Blow");
                let slotData1 = new SlotData(kdf);
                let slotData2 = new SlotData(kdf);
                let container = await makeMultiSlotContainer(containerData, [slotData1, slotData2]);

                await container.lock();
                await container.unlock(slotData1.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_Blow_Argon2_2() {
                let kdf = "Argon2" as KeyDerivationFunction;
                let containerData = new InitialContainerData("Blow");
                let slotData1 = new SlotData(kdf);
                let slotData2 = new SlotData(kdf);
                let container = await makeMultiSlotContainer(containerData, [slotData1, slotData2]);

                await container.lock();
                await container.unlock(slotData1.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            // Multi Algo

            async function Container_test_AES_PBKDF2_3() {
                let containerData = new InitialContainerData("AES");
                let slotData1 = new SlotData("Argon2");
                let slotData2 = new SlotData("PBKDF2");
                let container = await makeMultiSlotContainer(containerData, [slotData1, slotData2]);

                await container.lock();
                await container.unlock(slotData1.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_AES_Argon2_3() {
                let containerData = new InitialContainerData("AES");
                let slotData1 = new SlotData("PBKDF2");
                let slotData2 = new SlotData("Argon2");
                let container = await makeMultiSlotContainer(containerData, [slotData1, slotData2]);

                await container.lock();
                await container.unlock(slotData1.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_Blow_PBKDF2_3() {
                let containerData = new InitialContainerData("Blow");
                let slotData1 = new SlotData("Argon2");
                let slotData2 = new SlotData("PBKDF2");
                let container = await makeMultiSlotContainer(containerData, [slotData1, slotData2]);

                await container.lock();
                await container.unlock(slotData1.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_Blow_Argon2_3() {
                let containerData = new InitialContainerData("Blow");
                let slotData1 = new SlotData("PBKDF2");
                let slotData2 = new SlotData("Argon2");
                let container = await makeMultiSlotContainer(containerData, [slotData1, slotData2]);

                await container.lock();
                await container.unlock(slotData1.password);

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },

            async function Container_test_Blow_Argon2_Intensive_1() {
                let kdf = "Argon2" as KeyDerivationFunction;

                let slotData = [
                    new SlotData(kdf), 
                    new SlotData(kdf), 
                    new SlotData(kdf), 
                    new SlotData(kdf), 
                    new SlotData(kdf), // selected for password
                    new SlotData(kdf, "password"), 
                ];

                let containerData = new InitialContainerData("Blow");
                let container = await makeMultiSlotContainer(containerData, slotData);

                if(container.identities == null) throw "Container had no identities";

                // create 100 identities
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

                    container.identities.push(identity);
                }

                await container.lock();

                await container.unlock(slotData[4].password);

                let containerJSON = container.getJSON()
                log(containerJSON);
                log(containerJSON.length);

                container.save();

                return container.identities == null ? false : container.identities[0].identityName == containerData.defaultIdentity.identityName;
            },
        ];
    }
}