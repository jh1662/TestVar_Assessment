//#region set-up
const request = require('supertest');
const {app, server} = require('../../src/server/index');
const reFill = require('../dBTest/sampleDatabase');

beforeAll(async () => {
  console.log("start aPISets tests!");
  process.env.NODE_ENV = 'test';
  await reFill.initialiseDB();
});
afterAll(async () => {
  console.log("end aPISets tests!");
  clearInterval(global.dailySetsUpdate);
  await reFill.db.destroy();
  if(server) { await server.close(); }
});
//#endregion
//! Just like in aPIUser test, tests that utilise common functions will not have repeated tests that involved that.
//! In aPIUser test, this is partially the case, but here will be more.
//! for if 2 API fuctions but use the same function to validate user IDs, the combination of tests will only be present in one.
//! such as any test that pass via 'ps.intergerable' will not be tested as it already have been tested in the aPIUser.js test.
//#region test
describe('testing sets.GetAllSets ( GET http://localhost:3000/api/sets/ )', () => {
    it('returns all flashcard sets', async () => {
      const res = await request(app).get('/api/sets/');
      //^ set-up
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        [
            {
                name: "da quiz",
                id: 1,
                userId: 1,
                averageReview: 4.5,
                created: "2024-11-23T15:27:30.153Z",
                updated: null,
                description: "set of random questions"
            }
        ]
      );
    });
});
describe('testing sets.GetIDSet ( GET http://localhost:3000/api/sets/:id )', () => {
  it('returns flashcard set by ID (of 1)', async () => {
    const res = await request(app).get('/api/sets/1');
    //^ set-up
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
          name: "da quiz",
          id: 1,
          userId: 1,
          averageReview: 4.5,
          created: "2024-11-23T15:27:30.153Z",
          updated: null,
          description: "set of random questions"
      }
    );
  });
  it('attempt to return flashcard set by ID (of 0)', async () => {
    const res = await request(app).get('/api/sets/0');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Set ,by ID 0, is not in valid range (one or above) | Program error code: GetIDSet-2" }
    );
  });
  it('attempt to return flashcard set by ID (of -1)', async () => {
    const res = await request(app).get('/api/sets/-1');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Set ,by ID -1, is not in valid range (one or above) | Program error code: GetIDSet-2" }
    );
  });
  it('attempt to return flashcard set by ID (of 99)', async () => {
    const res = await request(app).get('/api/sets/99');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Set ,by ID 99, does not exist in database | Program error code: GetIDSet-4" }
    );
  });
  //* for common function 'ps.intergerable', it already have been tested in the aPIUser.js test, thus
  //* any test that pass via 'ps.intergerable' will not be tested.
});
describe('testing sets.PostIDSetReview ( POST http://localhost:3000/api/sets/:id/review )', () => {
  it('attempt to submit review but set does not exist', async () => {
    const req = {
      //* the to-be json to be sent to the server
      authorID: "1",
      comment: "not bad",
      rating: "3"
    }
    const res = await request(app).post('/api/sets/99/review').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error - set with id 99 does not exist  | Program error code: PostIDSetComment-2" }
    );
  });
  it('attempt to submit review but author does not exist', async () => {
    const req = {
      //* the to-be json to be sent to the server
      authorID: "99",
      comment: "not bad",
      rating: "3"
    }
    const res = await request(app).post('/api/sets/1/review').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (99) does not exist | Program error code: PostIDSetComment-0" }
    );
  });
  it('attempt to submit review but user already commented to the set', async () => {
    const req = {
      //* the to-be json to be sent to the server
      authorID: "2",
      comment: "not bad",
      rating: "3"
    }
    const res = await request(app).post('/api/sets/1/review').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(409);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error as each user can only post one comment per flashcard set | Program error code: PostIDSetComment-4" }
    );
  });
  it('attempt to submit review but rating is too low', async () => {
    const req = {
      //* the to-be json to be sent to the server
      authorID: "3",
      comment: "too bad!",
      rating: "0"
    }
    const res = await request(app).post('/api/sets/1/review').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error with rating value: It is outside valid range (1-5) | Program error code: PostIDSetComment-7" }
    );
  });
  it('attempt to submit review but rating is too high', async () => {
    const req = {
      //* the to-be json to be sent to the server
      authorID: "3",
      comment: "too bad!",
      rating: "6"
    }
    const res = await request(app).post('/api/sets/1/review').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error with rating value: It is outside valid range (1-5) | Program error code: PostIDSetComment-7" }
    );
  });
  it('submit review', async () => {
    const req = {
      //* the to-be json to be sent to the server
      authorID: "1",
      comment: "not bad",
      rating: "3"
    }
    const res = await request(app).post('/api/sets/1/review').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "success" }
    );
  });
});
describe('testing sets.GetIDSetCards ( GET http://localhost:3000/api/sets/:id/cards/ )', () => {
  //* majority of tests are the same to that of sets.GetIDSetCards as they both use the
  //* common function 'ps.intergerable' for ID checking, hence redundant tests won't be shown.
  it('returns all flashcard sets', async () => {
    const res = await request(app).get('/api/sets/1/cards');
    //^ set-up
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      [
        {
            "back": "4",
            "difficulty": 1,
            "front": "what is 2+2 ?",
            "id": 1,
            "setsId": 1
        },
        {
            "back": "ih",
            "difficulty": 3,
            "front": "what is hi spelled backwards?",
            "id": 2,
            "setsId": 1
        },
        {
            "back": "3.457565 seconds",
            "difficulty": 0,
            "front": "If a grain of rice was shot at an initial velocity of 20 miles per hour at 5 meters high, how long until the rice hit the ground taking into account the curve of the earth but not gravity to 6 d.p.?",
            "id": 3,
            "setsId": 1
        }
      ]
    );
  });
});
describe('testing sets.CreateNewSet ( POST http://localhost:3000/api/sets/ )', () => {
  it('create a new flashcardset', async () => {
    const req = {
      //* the to-be json to be sent to the server
      name: "European Capitals",
      cards: [
        {
          front: "What is the capital of France?",
          back: "Paris",
          difficulty: "1"
        },
        {
          front: "What is the capital of England?",
          back: "London",
          difficulty: "2"
        }
      ],
      authorID: "1",
      description: "LA VIVA FRANCE"
    }
    const res = await request(app).post('/api/sets/').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(expect.objectContaining(
      //* objectContaining is added because it is impossible to match the created time to the micro-second
      {
        id: 2,
        name: "European Capitals",
        description: "LA VIVA FRANCE",
        averageReview: 0,
        updated: null,
        userId: 1
      }
    ));
  });
  it('attempt to create a new flashcardset but without an author', async () => {
    const req = {
      //* the to-be json to be sent to the server
      name: "European Capitals2",
      cards: [
        {
          front: "What is the capital of France?",
          back: "Paris",
          difficulty: "1"
        },
        {
          front: "What is the capital of England?",
          back: "London",
          difficulty: "2"
        }
      ],
      authorID: undefined,
      description: "LA VIVA FRANCE"
    }
    const res = await request(app).post('/api/sets/').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Invalid - numerical input is empty (as 'undefined') | Program error code: uploadCards-1" }
    );
  });
  it('attempt to create a new flashcardset but with an invalid author', async () => {
    const req = {
      //* the to-be json to be sent to the server
      name: "European Capitals2",
      cards: [
        {
          front: "What is the capital of France?",
          back: "Paris",
          difficulty: "1"
        },
        {
          front: "What is the capital of England?",
          back: "London",
          difficulty: "2"
        }
      ],
      authorID: "-1",
      description: "LA VIVA FRANCE"
    }
    const res = await request(app).post('/api/sets/').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Author ID (-1) is outside valid range | Program error code: uploadCards-2" }
    );
  });
  it('attempt to create a new flashcardset but author (by ID) does not exist', async () => {
    const req = {
      //* the to-be json to be sent to the server
      name: "European Capitals2",
      cards: [
        {
          front: "What is the capital of France?",
          back: "Paris",
          difficulty: "1"
        },
        {
          front: "What is the capital of England?",
          back: "London",
          difficulty: "2"
        }
      ],
      authorID: "99",
      description: "LA VIVA FRANCE"
    }
    const res = await request(app).post('/api/sets/').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "user by Id does not exist | Program error code: uploadCards-4" }
    );
  });
  //* checking name and description both goes though the 'checkInput(input, charLength)' function in isValidInput.js
  //* which are thoroughly tested in aPIUser.js test, hece the redundant tests will not be tested in this file
});
describe('testing sets.PutIDSet ( PUT http://localhost:3000/api/sets/:id )', () => {
  it('updates flashcard set by ID', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      name: "European Capitals3",
      cards: [
        {
          front: "What is the capital of Germany?",
          back: "Berlin",
          difficulty: "3"
        }
      ],
      authorID: "1",
      description: "LA VIVA DUTCHLAND"
    }
    const res = await request(app).put('/api/sets/1').send(req).set('Accept', 'application/json');;

    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
        averageReview: 4,
        created: "2024-11-23T15:27:30.153Z",
        description: "set of random questions",
        id: 1,
        name: "da quiz",
        updated: null,
        userId: 1
      }
    );
  });
  it('attempt to update flashcard set by ID but set does not exist', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      name: "European Capitals3",
      cards: [
        {
          front: "What is the capital of Germany?",
          back: "Berlin",
          difficulty: "3"
        }
      ],
      authorID: "1",
      description: "LA VIVA DUTCHLAND"
    }
    const res = await request(app).put('/api/sets/99').send(req).set('Accept', 'application/json');;

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "set does not exist | Program error code: PutIDSet-0.2" }
    );
  });
  //* again, functions that are already tested have no use bding repeated
});
describe('testing user.DeleteIDSet ( DELETE http://localhost:3000/api/sets/:id )', () => {
  //* this resting may have more tests than other integer tests but all API functions with ID validation
  //* goes though the same function for ID validation ('validUserById(req,res,id)')
  it('delete set with ID of 2', async () => {
    const res = await request(app).delete('/api/sets/2');
    //^ set-up
    expect(res.status).toBe(204);
    //^ no "(res.body).toEqual" check accompany because browser prevents any body data to be sent
    //^ alongside a response with status code '204'.
  });
  it('attempt to delete sets with ID of 99 (ID does not exist)', async () => {
    const res = await request(app).delete('/api/sets/99');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.body).toEqual(
      { message: "no such user with id '99' exists  | Program error code: validUserById-2" }
    )
  });
  it('attempt to delete sets with ID of 0 (invalid ID)', async () => {
    const res = await request(app).delete('/api/sets/0');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.body).toEqual(
      { message: "id '0' is below valid range (1 or above)  | Program error code: validUserById-1" }
    )
  });
  it('attempt to delete sets with ID of -1 (invalid ID)', async () => {
    const res = await request(app).delete('/api/sets/-1');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.body).toEqual(
      { message: "id '-1' is below valid range (1 or above)  | Program error code: validUserById-1" }
    )
  });
  it('attempt to delete sets with ID of a random string (invalid ID)', async () => {
    //* theres no need to make another error message from the non-existant id error message as user
    //* can clearly see that ID is clearly not an integer in the error message.
    const res = await request(app).delete('/api/users/1f9843qfh_==!1');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.body).toEqual(
      { message: "no such user with id '1f9843qfh_==!1' exists  | Program error code: validUserById-2" }
    )
  });
});
//#endregion