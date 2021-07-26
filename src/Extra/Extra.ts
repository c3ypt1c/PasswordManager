/**
 * This class contains the details for the sorted object.
 */
class ExtraDataSortedObject {
  identifier : string;
  dataIndex: number;
  /**
   * 
   * @param identifier Identifier of the data
   * @param dataIndex  Index for the data
   */
  constructor(identifier: string, dataIndex: number) {
    this.identifier = identifier;
    this.dataIndex = dataIndex;
  }
}

/**
 * Sorted list class of the data
 */
export class ExtraDataSorted {
  private sortedData = [] as ExtraDataSortedObject[];
  constructor(data ?: string[][]) {
    if(data == null) return; // no data == empty array
    
    for(let index = 0; index < data.length; index++) {
      let dataObject = data[index]; // get identifier
      // put the data in a sorted order
      this.sortedData.push(new ExtraDataSortedObject(dataObject[0], index));
    }
  }

  /**
   * @param identifier identifier 
   * @returns the index of the data
   */
  getIndex(identifier: string) {
    let index = this.binarySearch(identifier);
    return index ? this.sortedData[index].dataIndex : null; 
  }

  /**
   * 
   * @param identifier identifier
   * @param index index of identifier
   */
  addIndex(identifier: string, index: number) {
    let object = new ExtraDataSortedObject(identifier, index);
    if(this.sortedData.length == 0) this.sortedData.push(object);

    let sortedIndex = this.bestGuessBinarySearch(identifier);
    if(sortedIndex == this.sortedData.length) this.sortedData.push(object);
    
    let bestGuessObjectIdentifier = this.sortedData[index].identifier;

    if(identifier > bestGuessObjectIdentifier) this.sortedData.splice(index + 1, 0, object); // insert 1 object to the right
    else if(identifier == bestGuessObjectIdentifier) throw "Cannot add an identifier that already exists";
    else this.sortedData.splice(index, 0, object);
  }

  /**
   * Recursive binary search.
   * @param identifier string to find
   * @param start start of search region
   * @param end end of search region
   * @returns null if string is not found in `this.sortedData`, otherwise returns the index of the data.
   */
   private binarySearch(identifier: string, start ?: number, end ?: number) : number | null {
    let bestGuess = this.bestGuessBinarySearch(identifier, start, end);
    return this.sortedData[bestGuess].identifier == identifier ? bestGuess : null;
  }

  /**
   * Recursive binary search. Best guess meaning it will return the closest entry 
   * @param identifier string to find
   * @param start start of search region
   * @param end end of search region
   * @returns the closest match to the identifier.
   */
   private bestGuessBinarySearch(identifier: string, start ?: number, end ?: number) : number {
    start = start ? start : 0;
    end = end ? end : this.sortedData.length;

    if(end < start) throw "Start is bigger than end";

    // perhaps found exit condition 
    if(start == end) return start; 

    let middle = Math.floor( (end - start) / 2);

    // bin search
    let currentIdentifier = this.sortedData[middle].identifier;
    if(currentIdentifier == identifier) return middle;
    else if(currentIdentifier > identifier) return this.bestGuessBinarySearch(identifier, start, middle - 1);
    else return this.bestGuessBinarySearch(identifier, middle + 1, end);
  }

}


/**
 * Extra class 
 */
export class Extra implements iJSON {
  // Because we want to keep the order of the extra data we need to keep the order.
  // eg. data = [["visited", "today"], ["will visit?", "tomorrow"], ["order", "matters"], ... ];
  public data: string[][];
  public sortedData : ExtraDataSorted;
  constructor(extraData ?: string[][]) {
    if(extraData == null) {
      this.data = [];
      this.sortedData = new ExtraDataSorted();
    }
    else {
      this.data = extraData;
      this.sortedData = new ExtraDataSorted(extraData);
    }
  }

  setData(identifier: string, data: string) {
    //let index = this.sortedData.binarySearch(identifier)
    //if(index) this.sortedData;
  }

  getData(identifier: string) {

  }

  getJSON() {
    return JSON.stringify(this.data);
  }
}
