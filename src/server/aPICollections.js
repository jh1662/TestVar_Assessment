//: imports
const rs = require('./dBIsUniqueRecord');
//^ input database validations functions
const ps = require('./isValidInput');
//^ input user input validations functions
const knex = require('knex');
//^ for the API with 'knex' to use the 'SQLite3' DBMS (DataBase Management System)
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
const { parse } = require("path");
//^ allow string to be parsed into an int

//#region other functions
async function validateCollectionData(req,res,info){
    let check;
    //^ set-up

    //: validate all text-based attributes
    check = await ps.name(info.name); if ( check != "0") { res.status(422).json({message: check+" | Program error code: validateCollectionData-1"}); return false; }
    check = await ps.text(info.description); if ( check != "0") { res.status(422).json({message: check+" | Program error code: validateCollectionData-2"}); return false; }

    //: check the bookmarked set(s) list as a collective
    if (info.setsIds === undefined){ res.status(422).json({message: "given set ids list is undefined"+" | Program error code: validateCollectionData-3"}); return false;}
    //^ validate bookmarked set(s)'s existance before other checks to avoid any runtime errors
    if (!Array.isArray(info.setsIds)){ res.status(422).json({message: "set ids list is not a valid list type"+" | Program error code: validateCollectionData-4"}); return false;}
    //^ check the set list type
    if (info.setsIds.length==0){ res.status(422).json({message: "set ids list is empty"+" | Program error code: validateCollectionData-5"}); return false;}
    //^ check if bookmarks set list populated

    //: check each bookmarked set's id validity and existance
    for ( let index = 0; index < info.setsIds.length; index++ ){
        //* validate the sets
        if (ps.intergerable(info.setsIds[index])!="0"){ res.status(422).json({message: `error with ${index+1}th set id: `+check+" | Program error code: validateCollectionData-6"}); return false; }
        try{ check = await db('Sets').where({id: info.setsIds[index]}).first() } catch(err){ res.status(500).json({message: err.message+" | Program error code: validateCollectionData-7"}); return false; }
        if (!check){ res.status(422).json({message: `The ${index+1}th set does not exist`+" | Program error code: validateWholeCollection-8"}); return false; }
    }

    return true;
    //^ collection's id, author's id, authorisation, name, description, and all bookmarked sets are all valid and exists
}
async function validateCollectionOwnership(req,res,info){
    //* verify owership but also checks user's and collection's validity and existance
    //: validate both ids
    check = ps.intergerable(info.userId);
    if (check != "0") { res.status(422).json({message: "error with user id: "+check+" | Program error code: validateCollectionOwnership-1"}); return false; }
    check = ps.intergerable(info.collectionId);
    if (check != "0") { res.status(422).json({message: "error with collection id: "+check+" | Program error code: validateCollectionOwnership-2"}); return false; }

    //: validate both existances
    check = rs.userId(info.userId);
    if (check == true) { res.status(500).json({message: `Error: user's id (${author}) does not exist`+" | Program error code: validateCollectionOwnership-3"}); return false;}
    check = rs.collectionId(info.collectionId);
    if (check == true) { res.status(500).json({message: `Error: collection's id (${author}) does not exist`+" | Program error code: validateCollectionOwnership-4"}); return false;}

    //: make sure collection belongs to subjected user
    try { check = await db("Collections").where({id: info.collectionId, userId: info.userId}).select().first(); } catch(err){ res.status(500).json({message: err.message+" | Program error code: validateCollectionOwnership-5"}); return false; }
    if( !check ){ res.status(403).json({message: "That collection does not belong to you!"+" | Program error code: validateCollectionOwnership-6"}); return false; }
    //^ browser response code '403' means that user does not have the relevent authority to do the request

    return true;
    //^ Collection, user and collection's rightful ownership are all valid
}
function ranInt(max) {
    //* gerates a random int with in rage (0 =< int < max)
    return Math.floor(Math.random() * max);
    //^ taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
}
//#endregion
//#region GET requests
async function GetAllCollectionsIDUser(req,res){
    //: setup
    let userId = req.params.id;
    let check; let result;

    //: validate user id
    check = ps.intergerable(userId);
    if (check != "0") { res.status(422).json({message: "error with user id: "+check+" | Program error code: GetAllCollectionsIDUser-1"}); return; }
    //: Validate user
    check = rs.userId(userId);
    if (check == true) { res.status(500).json({message: `Error: user's id (${author}) does not exist`+" | Program error code: GetAllCollectionsIDUser-2"}); return;}

    try { result = await db("Collections").where({userId: userId}).select(); } catch(err){ res.status(500).json({message: err.message+" | Program error code: GetAllCollectionsIDUser-3"}); return; }
    //^ Get all collections by subjected user

    //: Success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(result);
}
async function GetIDCollectionFlashcardSetsIDUser(req,res){
    //: setup
    let userId = req.params.id;
    let collectionId = req.params.cId;
    let result = [];
    let check;

    if ( !validateCollectionOwnership(req,res,{userId: userId, collectionId: collectionId}) ){ return; }
    //^ make sure user is authorised to do the request

    try { check = await db("CollectionsToSets").where({collectionsId: collectionId}).select('setsId'); } catch(err){ res.status(500).json({message: err.message+" | Program error code: GetIDCollectionFlashcardSetsIDUser-1"}); return; }
    //^ get all relevent set ids
    //: get all sets by id array
    for ( let index = 0; index < check.length; index++ ){
        try { result.push(await db("Sets").where({id: check[index].setsId}).select().first()); } catch(err){ res.status(500).json({message: err.message+" | Program error code: GetIDCollectionFlashcardSetsIDUser-2"}); return; }
        //^ 'index' goes via each collection while 'setsId' gets the id as the result is an array of objects
    }

    //: success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(result);
}
async function GetAllCollections(req,res){
    let result;
    //^ set-up
    try { result = await db("Collections").select(); } catch(err){ res.status(500).json({message: err.message+" | Program error code: GetAllCollections"}); return; }
    //^ gather all collections
    //: success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(result);
}
async function GetRandomCollection(req,res){
    let result; let random; let takenIds
    //^ set-up
    try { takenIds = await db("Collections").select('id'); } catch(err){ res.status(500).json({message: err.message+" | Program error code: GetRandomCollection-1"}); return; }
    //^ gather all existing ids
    random = ranInt(takenIds.length-1);
    //^ use randomness for getting a random id
    try { result = await db("Collections").where({id: takenIds[random].id}).select(); } catch(err){ res.status(500).json({message: err.message+" | Program error code: GetRandomCollection-2"}); return; }
    //^ get the random collection.
    //^ takenIds[random] = { id:...
    //: success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(result);
}
//#endregion
//#region POST requests
async function PostNewCollection(req,res){
    //: setup
    const info = {
        userId: req.body.authorId,
        name: req.body.name.trim(), description: req.body.description.trim(),
        setsIds: req.body.setsIds
    }
    let result;

    //: validate author's id
    check = ps.intergerable(info.userId);
    if (check != "0") { res.status(422).json({message: "error with user id: "+check+" | Program error code: PostNewCollection-1"}); return false; }

    //: check author's existance
    check = await rs.userId(info.userId);
    if (check == true) { res.status(500).json({message: `Error: user's id (${author}) does not exist`+" | Program error code: PostNewCollection-2"}); return false;}

    if( !validateCollectionData(req,res,info) ){ return; }
    //^ validate the entire collection (metadata and bookmarked flashcard sets)
    //: if name is unique
    if (!(await rs.collection(info.name))) { res.status(422).json({message: "Another collection has that name! (either yours or another user's)"+" | Program error code: PostNewCollection-3"}); return false; }

    try{ result = await db('Collections').insert({ userId: info.userId, name: info.name, description: info.description }); } catch(err){ res.status(500).json({message: err.message+" | Program error code: UpdateIDCollection-4"}); return; }
    result = result[0];

    for ( let index = 0; index < info.setsIds.length; index++ ){
        //* add the new bookmarked sets
        try{ await db('CollectionsToSets').insert({collectionsId: result, setsId: info.setsIds[index]}); } catch(err){ res.status(500).json({message: err.message+" | Program error code: UpdateIDCollection-5"}); return; }
    }

    //: get updated collection's data
    result = await db('Collections').where({ id: result }).first();
    result.setsIds = info.setsIds;

    //: success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(result);
}
//#endregion
//#region PUT requests
async function UpdateIDCollection(req,res){
    //: setup
    const info = {
        collectionId: req.params.cId, userId: req.params.id,
        name: req.body.name.trim(), description: req.body.description.trim(),
        setsIds: req.body.setsIds
    }
    let result;

    if ( !validateCollectionOwnership(req,res,{userId: info.userId, collectionId: info.collectionId}) ){ return; }
    //^ is user authorised and are the ids valid and exist?
    if( !validateCollectionData(req,res,info) ){ return; }
    //^ validate the entire collection (metadata and bookmarked flashcard sets)

    //: update collection's bookmarked sets
    try{ await db('CollectionsToSets').where({collectionsId: info.collectionId}).delete(); } catch(err){ res.status(500).json({message: err.message+" | Program error code: UpdateIDCollection-1"}); return; }
    //^ delete privious ones
    for ( let index = 0; index < info.setsIds.length; index++ ){
        //* add the new bookmarked sets
        try{ await db('CollectionsToSets').insert({collectionsId: info.collectionId, setsId: info.setsIds[index]}); } catch(err){ res.status(500).json({message: err.message+" | Program error code: UpdateIDCollection-2"}); return; }
    }

    //info.updated = (new Date()).toISOString();
    try{ await db('Collections').where({id: info.collectionId}).update({name: info.name, description: info.description }); } catch(err){ res.status(500).json({message: err.message+" | Program error code: UpdateIDCollection-3"}); return; }
    //^ update collection's metadata

    //: get updated collection's data
    result = await db('Collections').where({id: info.collectionId}).first();
    result.setsIds = info.setsIds;

    //: success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(result);
}
//#endregion
//#region DELETE requests
async function DeleteIDCollection(req,res){
    //: set-up
    const userId = req.params.id;
    const collectionId = req.params.cId;

    if ( !validateCollectionOwnership(req,res,{userId: userId, collectionId: collectionId}) ){ return; }
    //^ validate formats and existance of both user and collection by ids
    try{ await db('Collections').where({id: collectionId}).delete(); } catch(err){ res.status(500).json({message: err.message+" | Program error code: DeleteIDCollection"}); return; }
    //^ deleting

    //: Success
    res.status(204)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json();
}
//#endregion
module.exports = {GetAllCollectionsIDUser, GetIDCollectionFlashcardSetsIDUser, UpdateIDCollection, DeleteIDCollection, GetAllCollections, PostNewCollection, GetRandomCollection};
