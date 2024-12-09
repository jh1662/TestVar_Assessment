const knex = require('knex');
const config = require('../knexfile');
const { describe } = require('node:test');
const db = knex(config.development);

async function fill() {
  //* "await" allows creations to happen in order to prevent attempts of adding a record with atleast a missing depenancy (foreign keys)
  try {
    await db('Users').insert([
      { username: 'JohnWick', password: 'dogs', admin: false, dailySets: 0 },
      { username: 'Arbbys', password: 'Password1', admin: false, dailySets: 1 },
      { username: 'dripler', password: 'ALDI', admin: true, dailySets: 20 }
    ]);
    await db('Sets').insert([
      { name: 'da quiz', averageReview: 4.5, userId: 1, description: "set of random questions", created: "2024-11-23T15:27:30.153Z" }
    ]);
    await db('Flashcards').insert([
      { front: 'what is 2+2 ?', back: '4', difficulty: 1, setsId: 1 },
      { front: 'what is hi spelled backwards?', back: 'ih', difficulty: 3, setsId: 1 },
      { front: 'If a grain of rice was shot at an initial velocity of 20 miles per hour at 5 meters high, how long until the rice hit the ground taking into account the curve of the earth but not gravity to 6 d.p.?', back: '3.457565 seconds', difficulty: 0, setsId: 1 }
    ]);
    await db('Collections').insert([
      { name: 'my favs', description: "I really like these set(s)", userId: 1 }
    ]);
    await db('Reviews').insert([
      { rating: 5, userId: 3, setId: 1, created: "2024-11-24T15:27:30.153Z", comment: "YOOOOOOOOOOOOOOOOOO" },
      { rating: 4, userId: 2, setId: 1, created: "2024-11-24T15:28:30.153Z" }
    ]);
    /*
    await db('Comments').insert([
      { comment: "YOOOOOOOOOOOOOOOOOO", userId: 3, setsId: 1 }
    ]);
    */
    await db('CollectionsToSets').insert([
      { collectionsId: 1, setsId: 1 }
    ]);

    console.log('Data inserted successfully');
  }
  catch (error) {
    console.error('Error when inserting filler data:', error);
  }
}

async function main(){
  await fill();
  await db.destroy();
}
main();

/*
fill();
await db.destroy();
//^ causes the error with message "aborted"
//^ doesn't matter much as it timesout (without error) after a little while
*/