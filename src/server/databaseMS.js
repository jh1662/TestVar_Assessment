const knex = require('knex');
const config = require('../../knexfile');

const env = require('./env')
//^ determine node environment

const db = knex(config[env.env()]);

module.exports = db;