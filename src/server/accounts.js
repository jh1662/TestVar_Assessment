//: imports
const rs = require('./dBIsUniqueRecord');
//^ input validations functions
const env = require('./env')
//^ determine node environment
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config[env.env()]);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
const ps = require('./isValidInput');
//^ validate input data
const token = require('./middlewareFramework');
//^ middleware for user-to-server security

//* This file is the is the interface between the back-end and the middleware.
async function login(req, res) {
    //* POST request
    //: set up
    const info = {username: req.body.username, password: req.body.password};
    let check; let result;

    //: validate username
    check = ps.name(info.username)
    if (check != "0") { res.status(422).json({message: `no valid 'username' value in request's body: `+check+"  | Program error code: login-1"}); return; }

    //: validate password
    check = ps.name(info.password)
    if (check != "0") { res.status(422).json({message: `no valid 'password' value in request's body: `+check+"  | Program error code: login-2"}); return; }

    //: check user's existance
    check = await rs.user(info.username);
    if (check){ res.status(422).json({message: "Username does not exist"+"  | Program error code: login-3"}); return; }

    //: check corrosponding password
    try{ check = await db('Users').where({ username: info.username.trim(), password: info.password.trim()}).first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: login-4"}); return; }
    if (!check){ res.status(422).json({message: "Password does not match"+"  | Program error code: login-5"}); return; }

    result = {token: await token.requestAuthenticate(info.username.trim(),info.password.trim())};
    //^ generate and get token

    //: success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);

    /*
    try{ result = await db('Users').where({ username: info.username, password: info.password}).select('id').first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: login-6"}); return; }
    //^ fetch user id
    */
}
async function whichUserLogin(req, res){
    //: set up
    let userId;
    const userToken = req.body.token;

    if(userToken === undefined){ res.status(422).json({message: "error - invalid token input, input cannot be empty/undefined"}); return; }
    //^ validation
    //console.log("finging user id for client");
    userId = await token.respondAuthenticate(userToken);
    //^ integer above '0' for user id, negative integer if otherwise
    switch(userId){
        //* different errors
        case -1: res.status(401).json({userId: userId, message: "error - invalid token may mean that user's login session has timed out"}); return;
        case -2: res.status(500).json({userId: userId, message: "error - connection to database broke during operation"}); return;
    }
    //: found user id
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json({userId: userId});
}
async function logout(req, res, userToken){
    //* DELETE request
    let userId;
    //^ set up
    if(userToken === undefined){ res.status(422).json({message: "error - empty token input, user isn't logged in right now"}); return; }
    //^ validation
    userId = await token.dropToken(userToken);
    //^ integer above '0' for user id, negative integer if otherwise
    switch(userId){
        //* different errors
        case -1: res.status(401).json({message: "error - client has already logged out or login session has been expired"}); return;
        case -2: res.status(500).json({message: "error - connection to database broke during operation"}); return;
    }
    //: deleted token/login session
    res.status(204)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
}
module.exports = {login, whichUserLogin, logout};