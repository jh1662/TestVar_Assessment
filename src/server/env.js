function env(){
    if (process.env.NODE_ENV === 'test') { return 'test'; }
    else { return "development" }
}

module.exports = {env};