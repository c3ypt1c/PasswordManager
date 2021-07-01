import {log} from "./../crypto/Functions.js";
const fs = require("fs");

export class BIP {
  words = [] as string[];
  wordToNumber = {} as any;
  constructor() {
    //load the words
    fs.readFile("wordlist.txt", "utf8", (error : any, data : string) => {
      log("BIP!");
      log(error);
      log(data);

      // check for errors
      if(data == null) throw "Data is null";

      // sort from smallest to biggest
      let basicWords = data.split("\r\n");
      basicWords.sort((a,b) => a.length - b.length);

      // prune bad words
      basicWords = basicWords.filter((word) => word.length > 2);
      log(basicWords);

      // display stats
      log("number of words: " + basicWords.length);

      let bitsPerWord = Math.floor(Math.log2(basicWords.length));
      let usefulWords = 2 ** bitsPerWord;
      let percent = Math.round(1000 * usefulWords / basicWords.length) / 10;

      log("bits per word: " + bitsPerWord);
      log("useful words:  " + usefulWords);
      log("percent used:  " + percent + "%");

      // select words and process words
      let averageWordLength = 0;
      for(let wordNumber = 0; wordNumber < usefulWords; wordNumber++) {
        let word = basicWords[wordNumber];
        averageWordLength += word.length / usefulWords;
        this.words.push(word);
        
        //memory/time tradeoff (hashmap O(1) / bin search O(logn))
        this.wordToNumber[word] = wordNumber;
      }

      log("made mappings");
      log(this.words);
      log(this.wordToNumber);
      log("average word length: " + (Math.round(10 * averageWordLength) / 10));
    });
  }
}
