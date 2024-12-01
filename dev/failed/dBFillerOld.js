const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);

async function fill() {
  //* "await" allows creations to happen in order to prevent attempts of adding a record with atleast a missing depenancy (foreign keys)
  try {
    await db('Flashcards').insert([
      { front: 'what is "2+2 ?', back: '4', difficulty: 1 },
      { front: 'what is "hi" spelled backwards?', back: 'ih', difficulty: 5 },
      { front: 'If a grain of rice was shot at an initial velocity of 20 miles per hour at 5 meters high, how long until the rice hit the ground taking into account the curve of the earth but not gravity to 6 d.p.?', back: '3.457565 seconds', difficulty: 0 }
    ]);
    await db('Users').insert([
      { username: 'JohnWick', password: 'dogs', admin: false },
      { username: 'Arbbys', password: 'Password1', admin: false },
      { username: 'dripler', password: 'ALDI', admin: true }
    ]);
    await db('Collections').insert([
      { name: 'da quiz', averageReview: 4.5, userId: 1 }
    ]);
    await db('Reviews').insert([
      { rating: 5, userId: 3, collectionsId: 1 },
      { rating: 4, userId: 2, collectionsId: 1 }
    ]);
    await db('Comments').insert([
      { content: "YOOOOOOOOOOOOOOOOOO", userId: 3, collectionsId: 1 }
    ]);
    await db('CollectionsToFlashcards').insert([
      { flashcardId: 1, collectionsId: 1 },
      { flashcardId: 2, collectionsId: 1 },
      { flashcardId: 3, collectionsId: 1 }
    ]);

    console.log('Data inserted successfully');
  }
  catch (error) {
    console.error('Error when inserting filler data:', error);
  }
}

fill();
//db.destroy();
//^ causes the error with message "aborted"
//^ doesn't matter much as it timesout (without error) after a little while
