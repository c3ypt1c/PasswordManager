import { removeAllChildren, $ } from "../../DOM/DOMHelper.js";
import { log } from "../../Functions.js";
import { BIP } from "../../Recovery/BIP.js";
import { generateBIPs, ShamirChunk } from "../../Recovery/Shamir.js";
import { Container } from "./../../Crypto/Container.js";
import { Pane } from "./Pane.js";

let container: Container;
let Bip: BIP;

export class RecoveryPane extends Pane {
    constructor(container_: Container, Bip_: BIP) {
        super("recovery_pane", "recovery_pane_button");
        container = container_;
        Bip = Bip_;

        // Event Listeners
        $("reveal_bip").addEventListener("click", revealBip);
        $("recovery_pane_generate_shared_recovery").addEventListener("click", createSharedRecovery);

        // up down change
        $("recovery_pane_pieces").addEventListener("change", sharedRecoveryUpDownEvent);
        $("recovery_pane_threshold").addEventListener("change", sharedRecoveryUpDownEvent);

        // previous next
        $("recovery_pane_generate_shared_recovery_previous").addEventListener("click", sharedRecoveryPrevious);
        $("recovery_pane_generate_shared_recovery_next").addEventListener("click", sharedRecoveryNext);
    }

    updatePane(data?: any): void {
        throw new Error("Method not implemented.");
    }
}

var bipRevealed = false;
function revealBip() {
    if (bipRevealed) return;
    bipRevealed = true;

    let words = Bip.generateFromUint8Array(container.getMasterKey());
    let bip = $("bip");
    removeAllChildren(bip);

    for (let word = 0; word < words.length; word++) {
        let currentWord = words[word];

        let bipElement = document.createElement("p");
        bipElement.classList.add("mx-3");
        if (currentWord.underlined) bipElement.classList.add("text-decoration-underline");
        bipElement.textContent = (word + 1) + ". " + currentWord.text;

        bip.appendChild(bipElement);
    }

    $("reveal_bip").remove();
}

function sharedRecoveryUpDownEvent() {
    log("sharedRecoveryUpDownEvent");
    let pieces = $("recovery_pane_pieces") as HTMLInputElement;
    let threshold = $("recovery_pane_threshold") as HTMLInputElement;
    let piecesValue = Number.parseInt(pieces.value);
    let thresholdValue = Number.parseInt(threshold.value);

    // ensure minimum
    piecesValue = piecesValue < 2 ? 2 : piecesValue;
    thresholdValue = thresholdValue < 2 ? 2 : thresholdValue;

    // make sure that threshold is at least pieces
    thresholdValue = thresholdValue > piecesValue ? piecesValue : thresholdValue;

    // return values
    pieces.value = piecesValue.toString();
    threshold.value = thresholdValue.toString();
}

var shamirChunks = null as null | ShamirChunk[];
function createSharedRecovery() {
    // get data and make
    log("createSharedRecovery");
    let pieces = $("recovery_pane_pieces") as HTMLInputElement;
    let threshold = $("recovery_pane_threshold") as HTMLInputElement;
    let piecesValue = Number.parseInt(pieces.value);
    let thresholdValue = Number.parseInt(threshold.value);
    let masterKey = container.getMasterKey();

    log("mk:");
    log(masterKey);
    log("pieces: " + piecesValue);
    log("thresh: " + thresholdValue);

    shamirChunks = generateBIPs(masterKey, piecesValue, thresholdValue);
    log(shamirChunks);

    // make fields visible
    $("recovery_pane_generate_shared_recovery_screen").classList.remove("d-none");
    updateRecoveryScreen();
}

function updateRecoveryScreen() {
    checkRecoveryPage();
    if (shamirChunks == null) throw "shamirChunks are undefined";
    log("updateRecoveryScreen p:" + page);

    // make
    let shamirChunk = shamirChunks[page];
    let words = shamirChunk.makeBIP(Bip);

    // assign
    $("recovery_pane_generate_shared_recovery_title").textContent = "Piece number: " + shamirChunk.part.toString();
    let bipDiv = $("recovery_pane_generate_shared_recovery_bip");
    removeAllChildren(bipDiv);

    // display
    for (let word = 0; word < words.length; word++) {
        let currentWord = words[word];

        let bipElement = document.createElement("p");
        bipElement.classList.add("mx-3");
        if (currentWord.underlined) bipElement.classList.add("text-decoration-underline");
        bipElement.textContent = (word + 1) + ". " + currentWord.text;

        bipDiv.appendChild(bipElement);
    }
}

var page = 0;
function sharedRecoveryNext() {
    log("sharedRecoveryNext");
    page++;
    updateRecoveryScreen();
}

function sharedRecoveryPrevious() {
    log("sharedRecoveryNext");
    page--;
    updateRecoveryScreen();
}

function checkRecoveryPage() {
    let next = $("recovery_pane_generate_shared_recovery_next") as HTMLInputElement;
    let previous = $("recovery_pane_generate_shared_recovery_previous") as HTMLInputElement;
    previous.disabled = next.disabled = false;

    if (shamirChunks == null) page = 0;
    else {
        page = page < 0 ? 0 : page;
        page = page >= shamirChunks.length ? shamirChunks.length - 1 : page;

        next.disabled = page == shamirChunks.length - 1; // last page
        previous.disabled = page == 0; //first page
    }
}

