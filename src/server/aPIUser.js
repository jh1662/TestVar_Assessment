//: imports
const rs = require('./dBIsUniqueRecord');
//^ input validations functions
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error

//#region GET requests
async function GetAllUsersDetails(req,res){
    let result;
    try{ result = await db('Users').select('id', 'username', 'admin', 'dailySets'); }
    //^ try statement to catch errors in-case connection to database is not possible
    catch(err){ res.status(500).json({message: err.message}); return; }
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    //^ This is neccessary otherwise the browser gets the "304" status for doing this before.
    .send(result);
}
async function GetIDUserDetails(req,res){
    const id = req.params.id;
    //^ gets the varible's value from the URL
    let result;
    if (parseInt(id).isNaN){ res.status(404).json({message: "no valid 'id' value in request's body"}); return; }
    try{
        //* try statement to catch errors in-case connection to database is not possible or invalid data is inputted
        if (await rs.userId(id)){
            res.status(404)
            .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
            .json({message: "User does not exist as registered"}); return;
        }
        result = await db('Users').where({ id: id }).select('id', 'username', 'admin', 'dailySets').first();
    }
    catch (err){ res.status(404).json({message: err.message}); return; }
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion
//#region POST requests
async function PostNewUser(req,res){
    const user = {id: req.body.id, username: req.body.username, password: req.body.password, admin: req.body.admin};
    let result;
    try{
        //* try statement to catch errors in-case connection to database is not possible
        if (!(await rs.user(user.username))){ res.status(400).json({message: "User (by username) already exists"}); return; }
        //^ id has to be unique
        if (!(await rs.userId(user.id))){ res.status(400).json({message: "User (by id) already exists"}); return; }
        //^ cant use duplicate username

        //: ceating user
        if (user.id === undefined){ await db("Users").insert({username: user.username, password: user.password, admin: user.admin, dailySets: "0"}); }
        else { await db("Users").insert({id: user.id, username: user.username, password: user.password, admin: user.admin, dailySets: "0"}); }

        //: fetching and sendinging user details as API responce
        result = await db('Users').where({ username: user.username }).select('id', 'username', 'admin', 'dailySets').first();
    }
    catch (err){ res.status(400).json({message: err.message}); }
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
        // const username = await db('Users').where({ id: id }).select("username").first();
        await db('Users').where({ id: id }).delete();
        //^ Cannot chain ".first()"
        // result = {message: `SUCCESS - user ${username}, with id ${id} has been deleted successfully`};
        //^ Code 204 - explicitly indicates that there should be no content in the response body!
    }
    catch (err){ res.status(404).json({message: err.message}); return; }
    res.status(204)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json(result);
}
//#endregion

module.exports = {GetAllUsersDetails, PostNewUser, GetIDUserDetails, PutIDUserUpdate, DeleteIDUser};
