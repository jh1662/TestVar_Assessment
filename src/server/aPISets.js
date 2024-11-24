//! int validation only applies when adding that val to the database and not idetifing a record by the integer.
//! ints for identifying records are already indirectly validated by the SQL query/finder itself.

//: imports
const rs = require('./dBIsUniqueRecord');
//^ input database validations functions
const ps = require('./isValidInput');
//^ input user input validations functions
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
const { parse } = require("path");
//^ allow string to be parsed into an int
const { comment } = require('./databaseMS');
//? code line above is not expected


//#region other functions
async function checkCards(cards){
    let check;
    //^ Set-up
    //* returns "0" if all cards are valid, otherwise returns the error message
    //: validation cards' front, back and difficulty
    for (let i = 0; i < cards.length; i++){
        //: front?
        check = await ps.name(cards[i].front);
        if ( check != "0"){ return `The front of the ${i}th card is invalid: ${check}`; }
        //: back?
        check = await ps.name(cards[i].back);
        if ( check != "0"){ return `The front of the ${i}th card is invalid: ${check}`; }
        //: difficulty?
        check = ps.intergerable(cards[i].difficulty);
        if ( check != "0"){ return `The difficulty rating of the ${i}th card is invalid: ${check}`; }
        let diff = parseInt(cards[i].difficulty);
        if ( diff < 1 || diff > 3){
            return `The difficulty rating of the ${i}th card is invalid: not in valid range (1-3)`; }
    }

    return check;
    //^ always return "0" - success
}
async function uploadCards(cards, setsId){
    //* returns "0" (str) if all flashcards are successfully uploaded, otherwise return error message as a string
    for (let i = 0; i < cards.length; i++){
        try { await db('Flashcards').insert({ front: cards[i].front, back: cards[i].back, difficulty: cards[i].difficulty, setsId: setsId})} catch(err){ return err.message; }
        }
    return "0";
}
async function checkMetadata(req,res,info){
    //* checks both valid format and availibility in database as a common funct for both 'CreateNewSet' and 'PutIDSet'.
    //* returns true if valid, otherwise false if unvalid (saperately sends error to client)
    try { await rs.userId(info.author) } catch(err){ res.status(500).json({message: err.message+" | Program error code: uploadCards-0"}); return false; }
    check = await ps.name(info.name); if ( check != "0") { res.status(422).json({message: check+" | Program error code: uploadCards-1"}); return false; }
    //^ responce code '422' means understandable but inappropiate user input
    check = await ps.text(info.description); if ( check != "0") { res.status(422).json({message: check+" | Program error code: uploadCards-2"}); return false; }
    return true;
}
//#endregion
//#region GET requests
async function GetAllSets(req, res){
    let GetAllSets;
    //^ Set-up
    try { GetAllSets = await db("Sets").select() } catch(err){ res.status(500).json({message: err.message+" | Program error code: GetAllSets"}); return; }
    //^ DBMS and validation
    //: Success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(GetAllSets);
}
async function GetIDSet(req, res){
    //: set-up
    let id = req.params.id;
    let check;
    let set;

    //: Validate and parse id
    check = ps.intergerable(id);
    if (check != "0") {res.status(422).json({message: "error with id: "+check+" | Program error code: GetIDSet0"}); return;}
    id = parseInt(id)

    try { set = await db("Sets").where({id: id}).first()} catch(err){res.status(500).json({message: err.message+" | Program error code: GetIDSet1"}); return;}
    //^ fetch requested set if possible
    //: Success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(set);
}
async function GetIDSetCards(req, res){

}
//#endregion
//#region POST requests
async function CreateNewSet(req,res){
    //: Set-up
    const info = { author: req.body.authorID, name: req.body.name, description: req.body.description }
    const cards = req.body.cards;
    let check; let dailySets; let setsId; let set;

    if (!checkMetadata(req,res,info)){ return; }
    //^ DBMS and metadata validation

    //: User limit validation (20 sets a day or lower)
    try { dailySets = await rs.userId(info.author) } catch(err){ res.status(500).json({message: err.message+" | Program error code: CreateNewSet-3"}); return; }
    if (dailySets === false) { dailySets = 0; }; if (dailySets === true) { dailySets = 1; };
    //^ Knex.js semems to consider the inreger 0 and 1 as false annd true respectfully, dispite type being field datatype being integer
    if ( dailySets >= 20 ) {res.status(429).json({message: "User has already poster 20 flashcard sets today"+" | Program error code: CreateNewSet-4"}); return; }
    //^ responce code '429' to many requests
    //^ User can't go above 20 but '>=' is used instead of '>' incase the value in the database is changed to above 20 by admin (outside program scope)

    //: validate the cards
    check = checkCards(cards)
    if (check == "0"){ res.status(422).json({message: check+" | Program error code: CreateNewSet-5"}); return; }

    info.created = (new Date()).toISOString();
    //^ Create and add the set's created date and time
    //: Accept the flashcardset and update database (success)
    try { await db('Users').where({ id: info.author }).update({ dailySets: dailySets+1 }) } catch(err){ res.status(500).json({message: err.message+" | Program error code: CreateNewSet-6"}); return; }
    try { setsId = await db('Sets').insert({ userId: info.author, name: info.name.trim(), description: info.description.trim(), averageReview: 0, created: info.created }) } catch(err){ res.status(500).json({message: err.message+" | Program error code: CreateNewSet-7"}); return; }
    setsId = setsId[0];
    check = await uploadCards(cards, setsId);
    if (check != "0"){res.status(500).json({message: check+" | Program error code: CreateNewSet-8"})};

    try { set = await db('Sets').where({ id: setsId }) } catch(err){ res.status(500).json({message: err.message+" | Program error code: CreateNewSet-9"}); return; }
    //^ Get the now uploaded set for responce
    //: Success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json({set});
}
async function PostIDSetReview(req,res){
    //: set-up
    let info = {author: req.body.authorID, setId: req.params.id, comment: req.body.comment, rating: req.body.rating};
    let check;

    //: validate user's existace
    check = rs.userId(info.author);
    if (check == true) { res.status(500).json({message: `Error: user's id (${author}) does not exist`+" | Program error code: PostIDSetComment-0"}); return;}

    //: validate id of set (to potentially save processing time)
    check = ps.intergerable(info.setId);
    //^ to potentially save processing time
    if (check != "0") { res.status(422).json({message: "Error with target set's id: "+check+" | Program error code: PostIDSetComment-1"}); return;}
    check = await rs.setId(info.setId);
    if (check == true){ res.status(422).json({message: `Error - set with id ${info.setId} does not exist `+" | Program error code: PostIDSetComment-2"}); return; }

    //: does comment already exists?
    try { check = await db('Reviews').where({ userId: info.author }).first() } catch(err){ res.status(500).json({message: err.message+" | Program error code: PostIDSetComment-3"}); return; }
    if (check == true) {res.status(409).json({message: "Error as each user can only post one comment per flashcard set"+" | Program error code: PostIDSetComment-4"}); return;}
    //^ JS conciders 'undefined' as false and any existing object as true
    //^ respoce code '409' conflict with doing a second time (due to it already been done)

    //: validates comment's content, if it exists
    if (!(info.comment == undefined || info.comment == "")){
        check = ps.text(info.comment);
        if (check != "0") { res.status(422).json({message: "Error with comment's content: "+check+" | Program error code: PostIDSetComment-5"}); return;}
    }
    else { info.comment = null; }
    //^ knex.js compiler cannot deal with 'undefined' without runtime error so I used 'null' instead

    //: validates rating's value
    check = ps.intergerable(info.rating)
    if (check != "0") { res.status(422).json({message: "Error with rating value: "+check+" | Program error code: PostIDSetComment-6"}); return;}

    info.created = (new Date()).toISOString();
    //^ get current time of comment post
    try { await db('Reviews').insert({ userId: info.author, setId: info.setId, comment: info.comment, rating: info.rating, created: info.created})} catch(err){res.status(500).json({message: err.message+" | Program error code: PostIDSetComment-7"}); return;}
    //^ upload review

    //: update set's average rating
    //! Needs doing

    //: success
    res.status(201)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json({message: "success"});
}
//#endregion
//#region PUT requests
async function PutIDSet(req,res){
    //: Set-up
    const info = { author: req.body.authorID, name: req.body.name.trim(), description: req.body.description.trim() }
    const cards = req.body.cards;
    const setsId = req.params.id;
    let check;

    if (!checkMetadata(req,res,info)){ return; }
    //^ DBMS and metadata validation

    //: validate the cards
    check = checkCards(cards)
    if (check == "0"){ res.status(422).json({message: check+" | Program error code: PutIDSet-0"}); return; }

    info.updated = (new Date()).toISOString();
    //^ Create and add the set's updated date and time
    try{ db('Sets').where({id:setsId}).update({ userId: info.author, name: info.name.trim(), description: info.description.trim(), updated: info.updated}) } catch(err){ res.status(500).json({message: err.message+" | Program error code: PutIDSet-1"}); return; }
    //^ Update the set's metadata
    try{ db('Flashcards').where({setsId:setsId}).delete()} catch(err){ res.status(500).json({message: err.message+" | Program error code: PutIDSet-2"}); return; }
    //^ Delete the previous Set's cards

    //: Upload the new flashcards
    check = await uploadCards(cards, setsId)
    if (check != "0"){res.status(500).json({message: check+" | Program error code: PutIDSet-3"})};

    try { set = await db('Sets').where({ id: setsId }) } catch(err){ res.status(500).json({message: err.message+" | Program error code: PutIDSet-4"}); return; }
    //^ Get the now uploaded set for responce
    //: Success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json({set});
}
//#endregion
//#region DELETE requests
async function DeleteIDSet(req,res){
    //: set-up
    let id = req.params.id;
    let check;

    //: validate then parse
    check = ps.intergerable(id)
    if (check != 0){ res.status(422).json({message: check+" | Program error code: DeleteIDSet-0"}); return;}
    id = parseInt(id);

    if (!rs.setId(id)){ res.status(404).json({message: `Set ,by id (${id}), does not exist`+" | Program error code: DeleteIDSet-1"}); return;}
    //^ Check if requested set exists
    try{ db('Sets').select({id: id}).delete()} catch(err){ res.status(422).json({message: err.message+" | Program error code: DeleteIDSet-2"}); return; }
    //^ delete set

    //: Success
    res.status(204)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .json();
    //^ browser responce code '204' does not return json
}
//#endregion

module.exports = {GetAllSets, CreateNewSet, GetIDSet, PutIDSet, DeleteIDSet, PostIDSetReview};

/*
        //: anything empty?
        if ( cards.front === undefined || cards.back === undefined || cards.difficulty === undefined) {
            res.status(422).json({message: `The ${i}th card has an empty value`}); return "error"; }


async function uploadCards(cards){
    return async (req, res) => {
    //^ 'req' and 'res' become undefined when I pass a 3rd argument so I have to do them saperately
        cardsIDs = [];
        for (let i = 0; i < cards.length; i++){
            let id;
            try { id = await db('Flashcards').insert({ front: cards[i].front, back: cards[i].back, difficulty: cards[i].difficulty})} catch(err){ res.status(500).json({message: err.message}); return; }
            id = id[id];
            console.log(id);
        }
    };
}
*/