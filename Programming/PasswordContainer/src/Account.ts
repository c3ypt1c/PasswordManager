class Account implements iJSON {
  website : string;
  password : string;
  login : string;
  extra : Extra; // Extra data added by user
  constructor(accountData : any) {
    this.website = accountData["website"];
    this.password = accountData["password"];
    this.login = accountData["login"];
    this.extra = new Extra(accountData["extra"]);
  }

  getJSON() {
    return JSON.stringify({
      "website": this.website,
      "password": this.password,
      "login": this.login,
      "extra": this.extra.getJSON(),
    });
  }

  getCsv() {
    throw "Not implemented error!";
  }
}
