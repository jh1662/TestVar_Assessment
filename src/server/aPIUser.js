/*
try { await db() } catch(err){ res.status().json({message: err.message+"  | Program error code: "}); return; }
*/

//* '.first()' cannot be chained for DBMS delete, insert, nor update but can for select
//* dispite it looking logical to chain for all...

//: imports
const rs = require('./dBIsUniqueRecord');
//^ input validations functions
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
const ps = require('./isValidInput');

//#region other functions
async function validateUserByInfo(req,res,user){
    //* returns true if valid, otherwise send error responce then retrun false
    //* does NOT include id
    //: validate admin power
    if(user.admin === undefined){ res.status(422).json({message: "did not specify if user should be admin or not"+"  | Program error code: validateUserByInfo-1"}); return false; }
    if( (user.admin !== true)&&(user.admin !== false) ){ res.status(422).json({message: "admin powers should be either true or false; neither was detected"+"  | Program error code: validateUserByInfo-2"}); return; }

    //: validate username
    check = ps.name(user.username)
    if (check != "0") { res.status(422).json({message: `no valid 'username' value in request's body: `+check+"  | Program error code: validateUserByInfo-3"}); return false; }

    //: validate password
    check = ps.name(user.password)
    if (check != "0") { res.status(422).json({message: `no valid 'password' value in request's body: `+check+"  | Program error code: validateUserByInfo-4"}); return false; }

    //: check if unique fields are unique
    try{ check = await rs.user(user.username) } catch(err){ res.status(500).json({message: err.message+"  | Program error code: validateUserByInfo-5"}); return false; }
    if (!check){ res.status(429).json({message: "User (by username) already exists"+"  | Program error code: validateUserByInfo-6"}); return false; }
    //^ username has to be unique

    return true;
    //^ User is valid
}
async function validUserById(req,res,id){
    //* returns true if valid, otherwise send error responce then retrun false
    //: validates id's format
    check = ps.intergerable(id)
    if (check != "0") { res.status(422).json({message: "no valid 'id' value in request's body: "+check+"  | Program error code: validUserById-0"}); return false; }

    //: validates if user exist
    check = await rs.userId(id)
    if (check) { res.status(422).json({message: `no such user with id '${id}' exists`+"  | Program error code: validUserById-1"}); return false; }

    return true;
    //^ User is valid
}
//#endregion
//#region GET requests
async function GetAllUsersDetails(req,res){
    //* no req body and no req params
    let result;
    //^ Set-up
    try{ result = await db('Users').select('id', 'username', 'admin', 'dailySets'); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: GetIDUserDetails"}); return; }
    //^ try statement to catch errors in-case connection to database is not possible
    //: success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    //^ This is neccessary otherwise the browser gets the "304" status for doing this before.
    .send(result);
}
async function GetIDUserDetails(req,res){
    //: set-up
    const id = req.params.id;
    //^ gets the varible's value from the URL
    let result;

    if ( !(await validUserById(req,res,id)) ){ return; }
    //^ validate user's id

    try{ result = await db('Users').where({ id: id }).select('id', 'username', 'admin', 'dailySets').first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: GetIDUserDetails-2"}); return; }
    //^ get user's datails
    //: success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
async function GetUserSets(req,res){
    //* Reads flashcards sets
    //: set-up
    const id = req.params.id;
    //^ gets the varible's value from the URL
    let result;

    if ( !(await validUserById(req,res,id)) ){ return; }
    //^ validate user's id

    try{ result = await db('Sets').where({ userId: id }); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: GetUserSets"}); return; }
    //^ get user's datails
    //: success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(result);
}
//#endregion
//#region POST requests
async function PostNewUser(req,res){
    //: set-up
    const user = {/*id: req.body.id,*/ username: req.body.username, password: req.body.password, admin: req.body.admin};
    let result; let check;

    if( !(await validateUserByInfo(req,res,user)) ){ return; };
    //^ validation of new user's info

    //: new user and prepare its details
    try{ result = await db("Users").insert({username: user.username, password: user.password, admin: user.admin, dailySets: "0"}); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: PostNewUser-7"}); return; }
    //^ upload new user
    result = result[0];
    //^ get new user's id
    try{ result = await db('Users').where({ username: user.username }).select('id', 'username', 'admin', 'dailySets').first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code: PostNewUser-8"}); return; }
    //^ get new user's details

    //: success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion
//#region PUT requests
async function PutIDUserUpdate(req,res){
    //: set-up
    const user = {username: req.body.username, password: req.body.password, admin: req.body.admin};
    const id = req.params.id;
    let result;

    //: validate user's details
    if ( !(await validUserById(req,res,id)) ){ return; }
    //^ validate user's id
    if( !(await validateUserByInfo(req,res,user)) ){ return; };
    //^ validation of new updated info

    try { await db('Users').where({ id: id }).update({username: user.username, password: user.password, admin: user.admin}); } catch(err){ res.status(400).json({message: err.message+"  | Program error code: PutIDUserUpdate-3"}); return; }
    //^ update user
    try { result = await db('Users').where({ id: id }).select('id', 'username', 'admin', 'dailySets').first(); } catch(err){ res.status(500).json({message: err.message+"  | Program error code:  PutIDUserUpdate-4"}); return; }
    //^ gets info of updated user
    //: success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion
//#region DELETE requests
async function DeleteIDUser(req,res){
    //: set-up
    const id = req.params.id;
    let result;

    if ( !(await validUserById(req,res,id)) ){ return; }
    //^ validate user's id
    try { await db('Users').where({id: id}).delete()} catch(err){ res.status(500).json({message: err.message+"  | Program error code: DeleteIDUser-2"}); return;}
    //^ delete user
    //: success
    res.status(204)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion

module.exports = {GetAllUsersDetails, PostNewUser, GetIDUserDetails, PutIDUserUpdate, DeleteIDUser, GetUserSets};

/*
    check = ps.intergerable(user.id)
    if (check != "0") { res.status(422).json({message: `no valid 'id' value in request's body: `+check+"  | Program error code: PostNewUser-0"}); return; }
*/
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
/*
    try{ check = await rs.userId(user.id) } catch(err){ res.status(500).json({message: err.message+"  | Program error code: PostNewUser-6"}); return; }
    if (!check){ res.status(429).json({message: "User (by id) already exists"+"  | Program error code: PostNewUser-7"}); return; }
    //^ cant use duplicate id
    try{ check = await rs.user(user.username) } catch(err){ res.status(500).json({message: err.message+"  | Program error code: PostNewUser-4"}); return; }

    if (user.id === undefined){ await db("Users").insert({username: user.username, password: user.password, admin: user.admin, dailySets: "0"}); }
    else { await db("Users").insert({id: user.id, username: user.username, password: user.password, admin: user.admin, dailySets: "0"}); }
*/
