import { stringToBoolean } from "./../ExtraFunctions.js";
import { Extra } from "./../Extra.js";

export class PasswordSettings extends Extra implements iJSON {
    passwordLength: number;
    includeNumbers: boolean;
    includeSymbols: boolean;
    includeLowercase: boolean;
    includeUppercase: boolean;

    numbers = "0123456789";
    symbols = "!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~";
    uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    lowercase = "abcdefghijklmnopqrstuvwxyz";

    defaultPasswordLength = 16;
    defaultIncludeNumbers = true;
    defaultIncludeSymbols = false;
    defaultIncludeLowercase = true;
    defaultIncludeUppercase = true;

    constructor(jsonData?: string) {
        super(jsonData != null ? JSON.parse(jsonData) : undefined);
        this.passwordLength = Number.parseInt(this.getDataOrDefaultTo("passwordLength", this.defaultPasswordLength.toString()));
        this.includeSymbols = stringToBoolean(this.getDataOrDefaultTo("includeSymbols", this.defaultIncludeSymbols.toString()));
        this.includeNumbers = stringToBoolean(this.getDataOrDefaultTo("includeNumbers", this.defaultIncludeNumbers.toString()));
        this.includeLowercase = stringToBoolean(this.getDataOrDefaultTo("includeLowercase", this.defaultIncludeLowercase.toString()));
        this.includeUppercase = stringToBoolean(this.getDataOrDefaultTo("includeUppercase", this.defaultIncludeUppercase.toString()));
    }

    getJSON() {
        super.setData("passwordLength", this.passwordLength.toString());
        super.setData("includeNumbers", this.includeNumbers.toString());
        super.setData("includeSymbols", this.includeSymbols.toString());
        super.setData("includeLowercase", this.includeLowercase.toString());
        super.setData("includeUppercase", this.includeUppercase.toString());
        return super.getJSON();
    }
}