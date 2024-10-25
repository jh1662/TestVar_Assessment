/* ESSENTIAL DEV COMMANDS:
> npx knex migrate:latest
> npx knex migrate:rollback
> npx knex migrate:make ...
*/

//! table names have their first char capitalised to differ from attributes

//! also for some unkown reason any code inside 'migrations' folder are incapable from running raw sqlite code
//! (tho is does work outside of the folder but is bad codinf practice to do so)

//: setting up database's tables
exports.up = function(knex) { return knex.schema
    .createTable('FlashCards',function(table){
        table.increments('id').primary();
        //^ "primary()" includes "notNullable()" and "unique()"
        table.string('front').notNullable();
        table.string('back').notNullable();
    }).
    createTable('Users',function(table){
        table.increments('id').primary();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
    }).
    createTable('Collections',function(table){
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.float('averageReview');
        //^ Fully dependant on the 'Reviews' table
        //: foreign keys (links):
        table.integer('userId').notNullable().unique(); table.foreign('userId').references('id').inTable('Users');
    }).
    createTable('Reviews',function(table){
        table.increments('id').primary();
        table.integer('rating').notNullable();
        //: foreign keys (links):
        table.string('userId').notNullable().unique(); table.foreign('userId').references('id').inTable('Users');
        table.string('collectionsId').notNullable().unique(); table.foreign('collectionsId').references('id').inTable('Collections');
    }).
    createTable('Comments',function(table){
        table.increments('id').primary();
        table.text('content').notNullable();
        //: foreign keys (links):
        table.string('userId').notNullable().unique(); table.foreign('userId').references('id').inTable('Users');
        table.string('collectionsId').notNullable().unique(); table.foreign('collectionsId').references('id').inTable('Collections');
    }).
    createTable('CollectionsToFlashcards',function(table){
        //* Created to solely deal with a many-to-many relationship (junction table)
        table.increments('id').primary();
        //: foreign keys (links):
        table.string('userId').notNullable().unique(); table.foreign('userId').references('id').inTable('Users');
        table.string('collectionsId').notNullable().unique(); table.foreign('collectionsId').references('id').inTable('Collections');
    })
    //? need to implement the 'hide card' feature
};

//: reseting database (if want all recorded data entries and tables deleted)
exports.down = function(knex) { return knex.schema
    .dropTableIfExists('FlashCards')
    .dropTableIfExists('Users')
    .dropTableIfExists('Collections')
    .dropTableIfExists('Comments')
    .dropTableIfExists('Reviews')
    .dropTableIfExists('CollectionsToFlashcards');
};