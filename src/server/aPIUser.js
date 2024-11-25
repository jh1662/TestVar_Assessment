//: imports
const rs = require('./dBIsUniqueRecord');
//^ input validations functions
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
const ps = require('./isValidInput')

//#region GET requests
async function GetAllUsersDetails(req,res){
    //* no req body and no req params
    let result;
    //^ Set-up
    try{ result = await db('Users').select('id', 'username', 'admin', 'dailySets'); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: GetIDUserDetails"}); return; }
    //^ try statement to catch errors in-case connection to database is not possible
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    //^ This is neccessary otherwise the browser gets the "304" status for doing this before.
    .send(result);
}
async function GetIDUserDetails(req,res){
    //: set-up
    const id = req.params.id;
    //^ gets the varible's value from the URL
    let result; let check;

    //: validation
    //: validates id's format
    check = ps.intergerable(id)
    if (check != "0") { res.status(422).json({message: "no valid 'id' value in request's body: "+check+"  | Program error code: GetIDUserDetails-0"}); return; }
    //: validates if user exist
    check = rs.userId(id)
    if (check) { res.status(422).json({message: `no such user with id ${id} exists`+"  | Program error code: GetIDUserDetails-1"}); return; }
    
    try{ result = await db('Users').where({ id: id }).select('id', 'username', 'admin', 'dailySets').first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: GetIDUserDetails-2"}); return; }
    //^ get user's datails
    //: success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion
//#region POST requests
async function PostNewUser(req,res){
    //: set-up
    const user = {/*id: req.body.id,*/ username: req.body.username, password: req.body.password, admin: req.body.admin};
    let result; let check;

    //* validatation of new user
    /*
    //: validates id
    check = ps.intergerable(user.id)
    if (check != "0") { res.status(422).json({message: `no valid 'id' value in request's body: `+check+"  | Program error code: PostNewUser-0"}); return; }
    */
    //: validate username
    check = ps.name(user.username)
    if (check != "0") { res.status(422).json({message: `no valid 'username' value in request's body: `+check+"  | Program error code: PostNewUser-1"}); return; }

    //: validate password
    check = ps.name(user.password)
    if (check != "0") { res.status(422).json({message: `no valid 'password' value in request's body: `+check+"  | Program error code: PostNewUser-2"}); return; }

    //: check if unique fields are unique
    if (!(await rs.user(user.username))){ res.status(429).json({message: "User (by username) already exists"+"  | Program error code: PostNewUser-3"}); return; }
    //^ id has to be unique
    if (!(await rs.userId(user.id))){ res.status(429).json({message: "User (by id) already exists"+"  | Program error code: PostNewUser-4"}); return; }
    //^ cant use duplicate username
    
    if (user.id === undefined){ await db("Users").insert({username: user.username, password: user.password, admin: user.admin, dailySets: "0"}); }
    else { await db("Users").insert({id: user.id, username: user.username, password: user.password, admin: user.admin, dailySets: "0"}); }

    try{ result = await db("Users").insert({username: user.username, password: user.password, admin: user.admin, dailySets: "0"}); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: PostNewUser-5"}); return; }
    //^ upload new user
    result = result[0];
    //^ get new user's id
    try{ result = await db('Users').where({ username: user.username }).select('id', 'username', 'admin', 'dailySets').first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: PostNewUser-5"}); return; }
    //^ get new user's details

    //: success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion
//#region PUT requests
async function PutIDUserUpdate(req,res){
    const id = req.params.id;
    var result;
    if (parseInt(id).isNaN){ res.status(404).json({message: "no valid 'id' value in request's body"}); return; }
    try{
        //* try statement to catch errors in-case connection to database is not possible
        if (await rs.userId(id)){
            res.status(404)
            .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
            .json({message: "User does not exist as registered"}); return;
        }
        await db('Users').where({ id: id }).update({username: req.body.username, password: req.body.password, admin: req.body.admin});
        result = await db('Users').where({ id: id }).select('id', 'username', 'admin', 'dailySets').first();
    }
    catch (err){ res.status(404).json({message: err.message}); return; }
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion
//#region DELETE requests
async function DeleteIDUser(req,res){
    //: set-up
    const id = req.params.id;
    let result; let check;

    //: validates id's format
    check = ps.intergerable(id)
    if (check != "0") { res.status(422).json({message: "no valid 'id' value in request's body: "+check+"  | Program error code: DeleteIDUser-0"}); return; }

    if (await rs.userId(id)){ res.status(404).json({message: "User (by username) does not exist"+"  | Program error code: DeleteIDUser-1"}); return; }
    //^ check if user exists
    try { await db('Users').where({id: id}).delete()} catch(err){ res.status(500).json({message: err.message+"  | Program error code: DeleteIDUser-2"}); return;}
    //^ delete user

    //: success
    res.status(204)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion

module.exports = {GetAllUsersDetails, PostNewUser, GetIDUserDetails, PutIDUserUpdate, DeleteIDUser};

/*
    if (parseInt(id).isNaN){ res.status(404).json({message: "no valid 'id' value in request's body"}); return; }
    try{
        //* try statement to catch errors in-case connection to database is not possible
        if (await rs.userId(id)){
            res.status(404)
            .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
            .json({message: "User does not exist as registered"}); return;
        }
        // const username = await db('Users').where({ id: id }).select("username").first();
        await db('Users').where({ id: id }).delete();
        //^ Cannot chain ".first()"
        // result = {message: `SUCCESS - user ${username}, with id ${id} has been deleted successfully`};
        //^ Code 204 - explicitly indicates that there should be no content in the response body!
    }
    catch (err){ res.status(404).json({message: err.message}); return; }
*/
