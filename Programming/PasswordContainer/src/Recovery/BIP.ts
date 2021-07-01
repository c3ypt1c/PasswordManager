import {log} from "./../crypto/Functions.js";
const fs = require("fs");

export class BIP {
  words ?: string[];
  constructor() {
    //load the words
    fs.readFile("wordlist.txt", "utf8", (error : any, data : string) => {
      log("BIP!");
      log(error);
      log(data);
      // sort from smallest to biggest
      let basicWords = data.split("\r\n");
      basicWords.sort((a,b) => a.length - b.length);

      // prune bad words
      this.words = basicWords = basicWords.filter((word) => word.length > 2);
      log(basicWords);

      log("number of words: " + basicWords.length);

      let bitsPerWord = Math.floor(Math.log2(basicWords.length));
      let usefulWords = 2 ** bitsPerWord;
      let percent = Math.round(1000 * usefulWords / basicWords.length) / 10;

      log("bits per word: " + bitsPerWord);
      log("useful words:  " + usefulWords);
      log("percent used:  " + percent + "%");


    });
  }
}
