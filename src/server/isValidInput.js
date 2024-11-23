//! for functions if result is '0', then it is valid, otherwise give a warning.
//! Does not uses any depdancy besides 'parse'.
//! Validation does not mean checking if it exists in the database.

const { parse } = require("path");

//#region checking strings
function lengthMin(input){
    //* REQUIREMENTS: 'input' arg must be a string and not undefined
    const charLength = input.trim().length
    //^ Set-up
    switch(charLength){
        case 0: return "Invalid - input is empty";
        case 1: return "Invalid - appropiate must atleast have 2 characters";
        //^ Im assuming there is no single char names nor no meaningful description/comment can be made with a single char.
    };
    return "0"
}

function checkInput(input, charLength){
    //* didn't declare constant at start because function may end before the constant is used.
    //* declaring constants after function potentially terminates will potentially save memory (RAM storage)
    if ( input === undefined ){ return "Invalid - text/name input is empty (as 'undefined')"}
    //^ Important this is done first as '.trim()' cannot do udefined values (causes runtime error)
    if ( (input.trim()).length > charLength ){ return `Invalid - input is too long, keep it at ${charLength} characters long or under (excluding ending whitespaces)`}
    const result = lengthMin(input.trim())
    if (result == "0"){ return "0"; }
    //^ is text valid?
    return result;
}

function name(input){ return checkInput(input, 32); };
function text(input){ return checkInput(input, 1024); };
//#endregion
//#region checking integers
function intergerable(input){
    if ( input === undefined ){ return "Invalid - numerical input is empty (as 'undefined')" };
    if (parseInt(input) === NaN){ return "Invalid - numerical input '${input}' is not a valid integer (as 'undefined')" };
    return "0";
}
//#endregion
//#region checking other data

//#endregion

module.exports = {name,text,intergerable};

/* DISABLED CODE:

function whiteSpace(input){
    //! input must not be an empty string.
    //* didn't declare constant at start because function may end before the constant is used.
    //* declaring constants after function potentially terminates will potentially save memory (RAM storage)
    if((input.charAt(0) === ' ') || (input.charAt(0) === '\t') || (input.charAt(0) === '\n')){
        //^ at first char
        return "Invalid - first input character is a whitespace";
    };
    const last = input.length - 1;
    if((input.charAt(last) === ' ') || (input.charAt(last) === '\t') || (input.charAt(last) === '\n')){
        //^ at last char
        return "Invalid - last input character is a whitespace";
    };
    return "0";
}
*/