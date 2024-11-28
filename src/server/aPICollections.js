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
async function GetAllCollectionsIDUser(req,res){

}
//#regionend
//#region GET requests

//#regionend
//#region POST requests

//#region PUT requests

//#regionend
//#region DELETE requests

module.exports = {GetAllCollectionsIDUser};
//module.exports = {GetAllCollectionsIDUser, GetIDCollectionFlashcardSetsIDUser, UpdateIDCollection, DeleteIDCollection, GetAllCollections, PostNewCollection, GetRandomCollection};
