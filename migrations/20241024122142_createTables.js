/* ESSENTIAL DEV COMMANDS:
> npx knex migrate:latest
> npx knex migrate:rollback
> npx knex migrate:make ...
*/

/* Quick command set:
npx knex migrate:rollback
npx knex migrate:latest
npm run fill
*/

//! table names have their first char capitalised to differ from attributes

//! also for some unkown reason any code inside 'migrations' folder are incapable from running raw sqlite code
//! (tho is does work outside of the folder but is bad codinf practice to do so)

//: setting up database's tables
exports.up = function(knex) { return knex.schema
    .createTable('Users',function(table){
        table.increments('id').primary();
        //^ "primary()" includes "notNullable()" and "unique()"
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        //^ EXTRA - the 'openapi.yaml' doesnt specify this but common sense says otherwise
        table.boolean('admin').notNullable();
        //^ ".defaultTo(false)" doesn't work as inserted 'null's remain as nulls instead of 'false'
        table.integer('dailySets').notNullable();
    }).
    createTable('Sets',function(table){
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description')
        table.float('averageReview');
        //^ Fully dependant on the 'Reviews' table
        table.string('created').notNullable();
        table.string('updated');
        //: foreign keys (links):
        table.integer('userId').notNullable(); table.foreign('userId').references('id').inTable('Users');
    }).
    createTable('Flashcards',function(table){
        table.increments('id').primary();
        table.string('front').notNullable();
        table.string('back').notNullable();
        table.integer('difficulty').notNullable();
        //: foreign keys (links):
        table.integer('setsId').notNullable(); table.foreign('setsId').references('id').inTable('Sets');
    }).
    createTable('Collections',function(table){
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description')
        //: foreign keys (links):
        table.integer('userId').notNullable(); table.foreign('userId').references('id').inTable('Users');
    }).
    createTable('Reviews',function(table){
        table.increments('id').primary();
        table.integer('rating').notNullable();
        table.text('comment');
        table.string('created').notNullable();
        //: foreign keys (links):
        table.string('userId').notNullable(); table.foreign('userId').references('id').inTable('Users');
        table.string('setId').notNullable(); table.foreign('setId').references('id').inTable('Sets');
    }).
    /*
    createTable('Comments',function(table){
        table.increments('id').primary();
        table.text('content').notNullable();
        //: foreign keys (links):
        table.string('userId').notNullable(); table.foreign('userId').references('id').inTable('Users');
        table.string('SetsId').notNullable(); table.foreign('SetsId').references('id').inTable('Sets');
    }).
    */
    createTable('CollectionsToSets',function(table){
        //* Created to solely deal with a many-to-many relationship (junction table)
        table.increments('id').primary();
        //: foreign keys (links):
        table.string('setsId').notNullable(); table.foreign('setsId').references('id').inTable('Sets');
        table.string('collectionsId').notNullable(); table.foreign('collectionsId').references('id').inTable('Collections');
    })
    //? need to implement the 'hide card' feature
};

//: reseting database (if want all recorded data entries and tables deleted)
exports.down = function(knex) { return knex.schema
    .dropTableIfExists('FlashCards')
    .dropTableIfExists('Users')
    .dropTableIfExists('Collections')
    .dropTableIfExists('Sets')
    .dropTableIfExists('Comments')
    .dropTableIfExists('Reviews')
    .dropTableIfExists('CollectionsToSets');
};