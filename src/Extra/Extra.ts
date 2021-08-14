class ExtraDataMapped extends Map<string, number> {
  constructor(data?: string[][]) {
    super();
    if (data == null) return;

    for (let index = 0; index < data.length; index++) {
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
  protected data: string[][];
  protected sortedData: ExtraDataMapped;
  constructor(extraData?: string[][]) {
    this.data = extraData != null ? extraData : [];
    this.sortedData = new ExtraDataMapped(this.data);
  }

  /**
   * Sets or updates data. If data exists, it is updated. If not, it is created and added to the end of the list.
   * @param identifier extra identifier
   * @param data data to go along with identifier
   */
  setData(identifier: string, data: string) {
    let dataObject = [identifier, data];

    if (this.sortedData.has(identifier)) {
      // has data
      let index = this.sortedData.get(identifier);
      if (index == null) throw "index is null when this.sortedData has data?";

      this.data[index] = dataObject;

    } else {
      // no data
      this.data.push(dataObject);
      this.sortedData.set(identifier, this.data.length - 1);
    }
  }

  /**
   * Get the data at the identifier
   * @param identifier idenftifier of the data
   * @returns the data at the identifier
   */
  getData(identifier: string) {
    if (this.sortedData.has(identifier)) {
      let index = this.sortedData.get(identifier);
      if (index == null) throw "index is null when this.sortedData has data?";

      return this.data[index][1];
    }

    throw "Data with identifier '" + identifier + "' does not exist";
  }

  /**
   * Check if data exists under identifier
   * @param identifier identifier of the data
   * @returns true if identifier exists
   */
  hadData(identifier: string) {
    return this.sortedData.has(identifier);
  }

  /**
   * Try to get data from identifier. If the identifier doesn't extst, default back to a parameter
   * @param identifier identifier to retrieve
   * @param defaultTo data to default to if identifier cannot be retrieved
   * @returns either the data from the identifier or the default data.
   */
  getDataOrDefaultTo(identifier : string, defaultTo : string) {
    return this.hadData(identifier) ? this.getData(identifier) : defaultTo;
  }

  /**
   * Sets the array of data.
   * @param data data to be set
   */
  setDataArray(data: string[][]) {
    this.data = data;
    this.sortedData = new ExtraDataMapped(data);
  }

  getJSON() {
    return JSON.stringify(this.data);
  }
}
