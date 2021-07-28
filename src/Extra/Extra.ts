class ExtraDataMapped extends Map<string, number> {
  constructor(data ?: string[][]) {
    super();
    if(data == null) return;

    for(let index = 0; index < data.length; index++) {
      this.set(data[index][0], index);
    }
  }
}


/**
 * Extra class 
 */
export class Extra implements iJSON {
  // Because we want to keep the order of the extra data we need to keep the order.
  // eg. data = [["visited", "today"], ["will visit?", "tomorrow"], ["order", "matters"], ... ];
  private data: string[][];
  private sortedData : ExtraDataMapped;
  constructor(extraData ?: string[][]) {
    this.data = extraData ? extraData : [];
    this.sortedData = new ExtraDataMapped(this.data);
  }

  /**
   * Sets or updates data. If data exists, it is updated. If not, it is created and added to the end of the list.
   * @param identifier extra identifier
   * @param data data to go along with identifier
   */
  setData(identifier: string, data: string) {
    let dataObject = [identifier, data];

    if(this.sortedData.has(identifier)) {
      // has data
      let index = this.sortedData.get(identifier);
      if(index == null) throw "index is null when this.sortedData has data?";

      this.data[index] = dataObject;

    } else {
      // no data
      this.data.push(dataObject);
      this.sortedData.set(identifier, this.data.length - 1);
    }
  }

  getData(identifier: string) {
    if(this.sortedData.has(identifier)) {
      let index = this.sortedData.get(identifier);
      if(index == null) throw "index is null when this.sortedData has data?";

      return this.data[index][1];
    } 
    
    throw "Data with identifier '" + identifier + "' does not exist";
  }

  hadData(identifier: string) {
    return this.sortedData.has(identifier);
  }

  getDataArray() {
    return this.data;
  }

  setDataArray(data : string[][]) {
    this.data = data;
    this.sortedData = new ExtraDataMapped(data);
  }

  getJSON() {
    return JSON.stringify(this.data);
  }
}
