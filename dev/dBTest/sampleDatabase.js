const knex = require('knex');
const config = require('../../knexfile');
const env = require('../../src/server/env')
const db = knex(config[env.env()]);

console.log("node environment: "+env.env());

async function initialiseDB() {
    //* literally a combination of the migration and filler file but updated
    //: drop tables
    await db.schema.dropTableIfExists('CollectionsToSets');
    await db.schema.dropTableIfExists('Reviews');
    await db.schema.dropTableIfExists('Collections');
    await db.schema.dropTableIfExists('Flashcards');
    await db.schema.dropTableIfExists('Sets');
    await db.schema.dropTableIfExists('Users');
    //: create the tables
    await db.schema.createTable('Users', function (table) {
        table.increments('id').primary();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.boolean('admin').notNullable();
        table.integer('dailySets').notNullable();
    });
    await db.schema.createTable('Sets', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description');
        table.float('averageReview');
        table.string('created').notNullable();
        table.string('updated');
        table.integer('userId').notNullable().references('id').inTable('Users');
    });
    await db.schema.createTable('Flashcards', function (table) {
        table.increments('id').primary();
        table.string('front').notNullable();
        table.string('back').notNullable();
        table.integer('difficulty').notNullable();
        table.integer('setsId').notNullable().references('id').inTable('Sets');
    });
    await db.schema.createTable('Collections', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description');
        table.integer('userId').notNullable().references('id').inTable('Users');
    });
    await db.schema.createTable('Reviews', function (table) {
        table.increments('id').primary();
        table.integer('rating').notNullable();
        table.text('comment');
        table.string('created').notNullable();
        table.integer('userId').notNullable().references('id').inTable('Users');
        table.integer('setId').notNullable().references('id').inTable('Sets');
    });
    await db.schema.createTable('CollectionsToSets', function (table) {
        table.increments('id').primary();
        table.integer('setsId').notNullable().references('id').inTable('Sets');
        table.integer('collectionsId').notNullable().references('id').inTable('Collections');
    });

    //: Fill the tables with heuristic data
    await db('Users').insert([
        { username: 'JohnWick', password: 'dogs', admin: false, dailySets: 0 },
        { username: 'Arbbys', password: 'Password1', admin: false, dailySets: 1 },
        { username: 'dripler', password: 'ALDI', admin: true, dailySets: 20 }
    ]);
    await db('Sets').insert([
        { name: 'da quiz', averageReview: 4.5, userId: 1, description: "set of random questions", created: "2024-11-23T15:27:30.153Z" }
    ]);
    await db('Flashcards').insert([
        { front: 'what is "2+2 ?', back: '4', difficulty: 1, setsId: 1 },
        { front: 'what is "hi" spelled backwards?', back: 'ih', difficulty: 3, setsId: 1 },
        { front: 'If a grain of rice was shot at an initial velocity of 20 miles per hour at 5 meters high, how long until the rice hit the ground taking into account the curve of the earth but not gravity to 6 d.p.?', back: '3.457565 seconds', difficulty: 0, setsId: 1 }
    ]);
    await db('Collections').insert([
        { name: 'my favs', description: "I really like these set(s)", userId: 1 }
    ]);
    await db('Reviews').insert([
        { rating: 5, userId: 3, setId: 1, created: "2024-11-24T15:27:30.153Z", comment: "YOOOOOOOOOOOOOOOOOO" },
        { rating: 4, userId: 2, setId: 1, created: "2024-11-24T15:28:30.153Z" }
    ]);
    await db('CollectionsToSets').insert([
        { collectionsId: 1, setsId: 1 }
    ]);
    console.log("REFILLED THE TEST SAMPLE DATABASE!");
    //: checking (debugging)
    const exist = await db.schema.hasTable('Users');
    console.log("does table Users exist in sampleDatabase.js: "+ exist);
}

module.exports = { db, initialiseDB };
