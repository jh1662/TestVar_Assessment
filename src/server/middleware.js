//: imports
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
const crypto = require('crypto');
//^ built-in node.js module for random string generation and mixing

async function requestAuthenticate(username,password){
    //: generates token
    const random = crypto.randomBytes(16).toString('base64');
    //^ makes a random 16-byte sized string of ASCII characters
    const user = username+password
    //^ combines user ID and password incase 2 users have the same password
    const tokenCandidate =  user + random;
    //^ created token candidate by combining the random string and the username and password set
    const token = crypto.createHash('sha256').update(concatenatedString).digest('hex');
    //^ encrypts the candidate into a token, by using SHA256 algorithm, in hexadecimal form
    //: stores token

    return token
}
async function respondAuthenticate(){
    const id = 0;
    return id
}
