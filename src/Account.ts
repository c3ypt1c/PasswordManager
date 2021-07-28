import {Extra} from "./Extra/Extra.js";

export class Account implements iJSON {
  public website : string;
  public password : string;
  public login : string;
  public extra : Extra; // Extra data added by user
  constructor(accountData ?: any) {
    if(accountData == null) {
      this.website = this.password = this.login = "";
      this.extra = new Extra();
    } else {
      this.website = accountData["website"];
      this.password = accountData["password"];
      this.login = accountData["login"];
      this.extra = new Extra(JSON.parse(accountData["extra"]));
    }
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
