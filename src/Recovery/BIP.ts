import { log, compareArrays } from "./../Functions.js";
import { getRandomBytes } from "../Crypto/CryptoFunctions.js";
import { Words1 } from "./WordLists.js";

const BITS8 = 2 ** 8;
const MINLENGTH = 3;

/**
 * A word has text and may be underlined
 */
export class Word {
  text: string;
  underlined: boolean
  constructor(text: string, underlined: boolean) {
    this.text = text;
    this.underlined = underlined;
  }

  /**
   * check if the word is valid
   * @param bip an instanciated BIP element. Resued to save resources
   */
  checkWord(bip: BIP) {
    return bip.isWordValid(this.text);
  }
}

/**
 * The BIP class is responsible for the most basic kind of recovery word => Uint8Array.
 * It must have words
 */
export class BIP {
  words = [] as string[];
  wordToNumber = new Map<string, number>();
  constructor() {

    // sort from smallest to biggest
    let basicWords = new Words1().words; //load the words
    basicWords.sort((a, b) => a.length - b.length);

    // prune bad words
    basicWords = basicWords.filter((word) => word.length >= MINLENGTH);
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

    for (let wordNumber = 0; wordNumber < usefulWords;) {
      let word = basicWords[wordNumber];

      if (this.wordToNumber.has(word)) {
        log("Skipping duplicate word: " + word);
        basicWords.splice(wordNumber, 1);
        continue;
      }

      averageWordLength += word.length / usefulWords;
      this.words.push(word);

      //memory/time tradeoff (hashmap O(1) / bin search O(logn))
      this.wordToNumber.set(word, wordNumber);
      wordNumber++;
    }

    percent = Math.round(1000 * usefulWords / basicWords.length) / 10;

    log("new bits per word: " + bitsPerWord);
    log("new useful words:  " + usefulWords);
    log("new percent used:  " + percent + "%");

    log("made mappings");
    log(this.words);
    log(this.wordToNumber);
    log("average word length: " + (Math.round(10 * averageWordLength) / 10));

    // run some small tests
    log("small self test");
    let randomBytes = getRandomBytes(80);
    log(randomBytes);

    let generatedWords = this.generateFromUint8Array(randomBytes);
    log(generatedWords);

    let recoveredBytes = this.generateFromWords(generatedWords);
    log(recoveredBytes);

    if (compareArrays(randomBytes, recoveredBytes)) {
      log("Self test success!");
    } else {
      log("Self test fail!");
      log(randomBytes);
      log(recoveredBytes);
      throw "Self test fail";
    }
  }

  /**
   * Generate {@link Word}s from an array. Array length must be divisible by 2. 
   * @param arr the array to convert to words
   * @returns word representation of the array
   */
  generateFromUint8Array(arr: Uint8Array) {
    if (arr.length % 2 == 1) throw "array length must be divisible by 2";

    // iterate array
    let words = [] as Word[];

    for (let i = 0; i < arr.length; i += 2) {
      let value = arr[i] * BITS8 + arr[i + 1];
      let underlined = value % 2 == 1;
      value = Math.floor(value / 2); // get rid of last bit
      let word = new Word(this.words[value], underlined);
      words.push(word);
    }

    return words;
  }

  /**
   * convert word into an unsigned integer respresentation
   * @param currentWord the word to convert
   * @returns unsigned integer respresentation of the word
   */
  generateFromWord(currentWord: Word) {
    let wordValue = this.wordToNumber.get(currentWord.text);
    if (wordValue == null) {
      debugger;
      throw "BIP: Word value '{}' is null".replace("{}", currentWord.text);
    }
    wordValue *= 2;
    wordValue += currentWord.underlined ? 1 : 0;
    return wordValue;
  }

  /**
   * generate a UInt8Array from a word array. Useful if you want to make an array human readable. Also reverses {@link BIP.generateFromUint8Array}.
   * @example  generateFromWords(generateFromUint8Array(Uint8Array.from([1, 2, 3, 4]))) => [1, 2, 3, 4]; // As Uint8Array
   * @param arr array of words
   * @returns a uint8array representation of the words. 
   */
  generateFromWords(arr: Word[]) {
    let intArr = [] as number[];
    for (let i = 0; i < arr.length; i++) {
      let currentWordValue = this.generateFromWord(arr[i]);
      let firstUint8 = Math.floor(currentWordValue / BITS8);
      let lastUint8 = currentWordValue - (firstUint8 * BITS8);
      intArr.push(firstUint8)
      intArr.push(lastUint8);
    }
    return Uint8Array.from(intArr);
  }

  /**
   * Check if the word exists in the currently used wordlist
   * @todo rewrite with binary search.
   * @param word word to check
   * @returns true if the word is in the wordlist
   */
  isWordValid(word: string) { // crude and wrong.
    return word.length >= MINLENGTH && -1 != this.words.indexOf(word);
  }
}
