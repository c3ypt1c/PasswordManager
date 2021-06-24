class Identity implements iJSON {
  accounts : Account[];
  identityName : string;
  identityDesc : string;
  constructor(identityData : any) {
    let accounts = [];
    for(let index = 0; index < identityData["accounts"].length; index++) {
      new Account(identityData["accounts"][index]);
    }
  }

  getJSON() {
    return "";
  }
}
