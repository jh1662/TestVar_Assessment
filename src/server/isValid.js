//! for functions if result is '0', then it is valid, otherwise give a warning.

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

function len(input){
    switch( len ){
        case 0: return "Invalid - input is empty";
        case 1: return "Invalid - appropiate must atleast have 2 characters";
        //^I assuming there is no single char names nor no meaningful description/comment can be made with a single char.
    };
    return "0"
}

function name(input){
    //* didn't declare constant at start because function may end before the constant is used.
    //* declaring constants after function potentially terminates will potentially save memory (RAM storage)
    if ( input.length > 32 ){ return "Invalid - name is too long, keep it underneath 33 characters long"}
    const result = len(input)
    if (result == "0"){ return whiteSpace(input); }
    return result;
};

function text(input){
    //* didn't declare constant at start because function may end before the constant is used.
    //* declaring constants after function potentially terminates will potentially save memory (RAM storage)
    if ( input.length > 1024 ){ return "Invalid - name is too long, keep it underneath 33 characters long"}
    const result = len(input)
    if (result == "0"){ return whiteSpace(input); }
    return result;
}

module.exports = {name,text};