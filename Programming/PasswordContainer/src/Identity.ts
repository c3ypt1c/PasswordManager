export class Identity implements iJSON {
  public accounts : Account[];
  public identityName : string;
  public identityDesc : string;
  // TODO: implement Extra
  constructor(identityData : any) {
    let jsonIdentityData = JSON.parse(identityData);
    // add accounts
    this.accounts = [];
    for(let index = 0; index < jsonIdentityData["accounts"].length; index++) {
      this.accounts.push(new Account(jsonIdentityData["accounts"][index]));
    }

    // misc
    this.identityName = jsonIdentityData["identityName"];
    this.identityDesc = jsonIdentityData["identityDesc"];

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
