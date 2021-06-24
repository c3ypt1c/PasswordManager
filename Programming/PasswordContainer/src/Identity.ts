class Identity implements iJSON {
  accounts : Account[];
  identityName : string;
  identityDesc : string;
  // TODO: implement Extra
  constructor(identityData : any) {
    // add accounts
    this.accounts = [];
    for(let index = 0; index < identityData["accounts"].length; index++) {
      this.accounts.push(new Account(identityData["accounts"][index]));
    }

    // misc
    this.identityName = identityData["identityName"];
    this.identityDesc = identityData["identityData"];

  }

  getJSON() {
    // gather accounts' JSON
    let accounts = [] as string[];
    for(let index = 0; index < this.accounts.length; index++) {
      accounts.push(this.accounts[index].getJSON());
    }

    return JSON.stringify({
      "accounts": accounts,
      "identityName": this.identityName,
      "identityDesc": this.identityDesc,
    });
  }
}
