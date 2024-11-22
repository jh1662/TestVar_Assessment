//: imports
const rs = require('./dBIsUniqueRecord');
//^ input database validations functions
const ps = require('./isValidInput');
//^ input user input validations functions
const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error

async function GetAllSets(req,res){
    //: Set-up
    let GetAllSets;

    //: DBMS and validation
    try { GetAllSets = await db("Sets").select() } catch(err){ res.status(500).json({message: err.message}); return; }

    //: Success
    res.status(200)
    .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(GetAllSets);
}

async function CreateNewSet(req,res){
    //: Set-up
    const info = { "author": req.body.authorID, "name": req.body.name.trim(), "description": req.body.description.trim() }
    const cards = req.body.cards;
    let check; let dailySets;

    //: DBMS and metadata validation
    try { await rs.userId(info.author) } catch(err){ res.status(500).json({message: err.message}); return; }
    check = await ps.name(info.name); if ( check != "0") { res.status(422).json({message: check}); return; }
    //^ responce code '422' means understandable but inappropiate user input
    check = await ps.text(info.description); if ( check != "0") { res.status(422).json({message: check}); return; }

    //: User limit validation (20 sets a day or lower)
    try { dailySets = await rs.userId(info.author) } catch(err){ res.status(500).json({message: err.message}); return; }
    if ( dailySets >= 20 ) {res.status(429).json({message: "User has already poster 20 flashcard sets today"}); return; }
    //^ responce code '429' to many requests
    //^ User can't go above 20 but '>=' is used instead of '>' incase the value in the database is changed to above 20 by admin (outside program scope)

    //: Handle the cards with validation
    if (checkCards(cards))

    //: Accept the flashcardset and save it (success)

    try { db(User).update({ dailySets: dailySets}) } catch(err){ res.status(500).json({message: err.message}); return; }
}

async function checkCards(cards){
    let check;
    //^ Set-up
    //* returns "0" if all cards are valid, otherwise returns the error message
    //: validation cards' front, back and difficulty
    for (let i = 0; i < cards.length; i++){
        //: front?
        check = await ps.name(cards.front.trim());
        if ( check != "0") { res.status(422).json({message: `The front of ${i}th card is invalid - ${check}`}); return check; }
        //: back?
        check = await ps.name(cards.back.trim());
        if ( check != "0") { res.status(422).json({message: `The front of ${i}th card is invalid - ${check}`}); return check; }
    }
}

//#region other functions

//#endregion
//#region GET requests

//#endregion
//#region POST requests

//#endregion
//#region PUT requests

//#endregion
//#region DELETE requests

//#endregion

module.exports = {GetAllSets, CreateNewSet};

/*
        //: anything empty?
        if ( cards.front === undefined || cards.back === undefined || cards.difficulty === undefined) {
            res.status(422).json({message: `The ${i}th card has an empty value`}); return "error"; }
*/