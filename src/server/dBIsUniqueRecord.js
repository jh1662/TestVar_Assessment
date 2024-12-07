const knex = require('knex');
const config = require('../../knexfile');

const env = require('./env')
//^ determine node environment

const db = knex(config[env.env()]);
//! if return true, that means input does not exist in the table and is thus unique

//! add try statements
//! make functs first check if input is undefined

async function user(username){
    const result = await db('Users').where({ username: username }).first();
    if (result){ return false; }
    //^ ".first()"" doesn't return a boolean but the if-statment can still recognise if the object is true by checking if its undefined or not
    return true;
}

async function userId(id){
    const result = await db('Users').where({ id: id }).first();
    if (result){ return false; }
    return true;
}

async function flashcard(front, back, difficulty){
    const result = await db('Flashcards').where({ front: front, back: back, difficulty: difficulty }).first();
    if (result){ return result.iD; }
    return -1;
}

async function comment(userId, collectionId){
    //* Doesn't check content as if comment exists, then edit the content (not in the funct below)
    const result = await db('Comments').where({ userId: userId, collectionId: collectionId }).first();
    if (result){ return result.iD; }
    return -1;
}

async function comment(userId, collectionId, content){
    const result = await db('Comments').where({ userId: userId, collectionId: collectionId, content: content }).first();
    if (result){ return false; }
    return true;
}

async function review(userId, collectionId){
    //* Doesn't check rating as if comment exists, then edit the rating (not in funct below)
    const result = await db('Reviews').where({ userId: userId, collectionId: collectionId }).first();
    if (result){ return result.iD; }
    return -1;
}

async function review(userId, collectionId, rating){
    const result = await db('Reviews').where({ userId: userId, collectionId: collectionId, rating: rating }).first();
    if (result){ return false; }
    return true;
}

async function collectionId(id){
    const result = await db('Collections').where({ id: id }).first();
    if (result){ return false; }
    return true;
}

async function collection(name){
    const result = await db('Collections').where({ name: name }).first();
    if (result){ return false; }
    return true;
}

async function setId(id){
    const result = await db('Sets').where({ id: id }).first();
    if (result){ return false; }
    return true;
}

module.exports = {user, userId, flashcard, comment, collection, review, collectionId, setId};

