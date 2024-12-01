//: imports
const rs = require('./dBIsUniqueRecord');
//^ input validations functions
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
const ps = require('./isValidInput');
//^ validate input data

async function login(req, res) {
    //: set up
    const info = {username: req.body.username, password: req.body.password};
    let check; let result;

    //: validate username
    check = ps.name(info.username)
    if (check != "0") { res.status(422).json({message: `no valid 'username' value in request's body: `+check+"  | Program error code: login-1"}); return false; }

    //: validate password
    check = ps.name(info.password)
    if (check != "0") { res.status(422).json({message: `no valid 'password' value in request's body: `+check+"  | Program error code: login-2"}); return false; }

    //: check user's existance
    check = await rs.user(info.username);
    if (check){ res.status(422).json({message: "Username does not exist"+"  | Program error code: login-3"}); return false; }

    //: check corrosponding password
    try{ check = await db('Users').where({ username: info.username, password: info.password}).first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: login-4"}); return false; }
    if (!check){ res.status(422).json({message: "Password does not match"+"  | Program error code: login-5"}); return false; }

    try{ result = await db('Users').where({ username: info.username, password: info.password}).select(id).first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: login-6"}); return false; }
    //^ fetch user id

    //: success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
    return true;
}

module.exports = {login};