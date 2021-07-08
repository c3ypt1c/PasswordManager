export class Extra implements iJSON {
  // Because we want to keep the order of the extra data we need to keep the order.
  // eg. data = [["visited", "today"], ["will visit?", "tomorrow"], ["order", "matters"], ... ];
  public data: string[][];
  constructor(extraData ?: string[][]) {
    if(extraData == null) this.data = [];
    else {
      this.data = extraData;
    }
  }

  getJSON() {
    return JSON.stringify(this.data);
  }
}
