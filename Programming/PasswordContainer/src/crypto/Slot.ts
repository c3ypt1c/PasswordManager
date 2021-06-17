class Slot {
  locked = true;
  masterKey : any;
  keyDerivationFunction : string;
  encryptionType : string;
  rounds : number;
  encryptedMasterKey : any;
  
  constructor(data : any) {
    this.keyDerivationFunction = data["derivation"];
    this.encryptionType = data["enc"];
    this.rounds = data["enc_rounds"];
    this.encryptedMasterKey = data["masterKey"];
  }

  lock() {
    this.locked = true;
    this.masterKey = undefined;
  }

  unlock(key : any) {

  }

  getMasterKey() {

  }
}

export {Slot};
