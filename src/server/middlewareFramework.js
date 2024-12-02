//: imports
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
const crypto = require('crypto');
//^ built-in node.js module for random string generation and mixing

//! All params are assumed to be already validated

async function initialise(){
    //: create or recreate the token storage for security purposes
    const existing = await db.schema.hasTable('Tokens');
    if(existing){ await db.schema.dropTable('Tokens'); }
    await db.schema.createTable('Tokens', function(table){
        table.increments('id').primary();
        table.integer('userId').notNullable().unique();
        table.string('token').notNullable().unique();
    }).catch((err) => {
        //^ You can chain 'catch' statments instead of using the 'try' and 'catch' blocks.
        console.log("initialising middleware framework security has failed: "+err.message);
    });
}
async function requestAuthenticate(username,password){
    let userId; let check;
    //: generates token
    const random = crypto.randomBytes(16).toString('base64');
    //^ makes a random 16-byte sized string of ASCII characters
    const user = username+password
    //^ combines user ID and password incase 2 users have the same password
    const tokenCandidate =  user + random;
    //^ created token candidate by combining the random string and the username and password set
    const token = crypto.createHash('sha256').update(tokenCandidate).digest('base64');
    //^ encrypts the candidate into a token, by using SHA256 algorithm, in ASCII form
    //: deletes previous token of user if found
    try{ userId = await db('Users').where({username: username}).select('id').first() } catch(err){ console.log("'requestAuthenticate' error - 1: "+err.message); return;}
    userId = userId.id;
    try{ check = await db('Tokens').where({userId: userId}).first()} catch(err){ console.log("'requestAuthenticate' error - 2: "+err.message); return;}
    if(check){
        try{ check = await db('Tokens').where({userId: userId}).delete()} catch(err){ console.log("'requestAuthenticate' error - 3: "+err.message); return;}
    }

    try{ await db('Tokens').insert({userId: userId, token: token})} catch(err){ console.log("'requestAuthenticate' error - 4: "+err.message); return;}
    //^ stores token
    return token;
}
async function respondAuthenticate(token){
    //* returned positive integer (excluding 0) - user id fetched.
    //* returned positive integer (excluding 0) - one of two errors ecnounted ('-1' or '-2')
    let userId;
    //^ set-up
    try{ userId = await db('Tokens').where({token: token}).select('userId').first()} catch(err){ console.log("'respondAuthenticate' error: "+err.message); return -2;}
    if(!userId) { return -1; }
    //^ if token does not match a logged-in user
    userId = userId.id
    return userId;
    //^ success
}
async function dropToken(token){
    let check;
    //^ set-up
    //* return 1 if logout successful, otherwise a negative integer (excluding 0)
    try{ check = await db('Tokens').where({token: token}).delete()} catch(err){ console.log("'dropToken' error: "+err.message); return -2; }
    if(!check){ console.log("'dropToken' error: client has already logged out or login session has been expired"); return -1; }
    //^ if client already logged out
    return 0;
    //^ success
}

module.exports = {initialise, requestAuthenticate, respondAuthenticate, dropToken};