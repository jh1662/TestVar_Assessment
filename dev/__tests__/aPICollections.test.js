//#region set-up
const request = require('supertest');
const {app, server} = require('../../src/server/index');
const reFill = require('../dBTest/sampleDatabase');

beforeAll(async () => {
  console.log("start aPICollections tests!");
  process.env.NODE_ENV = 'test';
  await reFill.initialiseDB();
});
afterAll(async () => {
  console.log("end aPICollections tests!");
  clearInterval(global.dailySetsUpdate);
  await reFill.db.destroy();
  if(server) { await server.close();}
});
//#endregion
//#region tests
//* As name and description both goes via 'checkInput(input, charLength)' from isValidInput.js, which has been tested vigorously, only
//* one test will be done each to see if it actually goes though the function.
describe('testing collections.GetAllCollectionsIDUser ( GET http://localhost:3000/api/users/:id/collections/ )', () => {
  it('returns all collections from user with ID of 1', async () => {
      const res = await request(app).get('/api/users/1/collections/');
      //^ set-up
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        [
            {
                description: "I really like these set(s)",
                id: 1,
                name: "my favs",
                userId: 1
            }
        ]
      );
  });
  it('attempt to return all collections from user with ID of 0 (out of range)', async () => {
        const res = await request(app).get('/api/users/0/collections/');
        //^ set-up
        expect(res.status).toBe(422);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: user's id (0) is below valid range | Program error code: GetAllCollectionsIDUser-2" }
        );
  });
  it('attempt to return all collections from user with ID of -1 (out of range)', async () => {
        const res = await request(app).get('/api/users/-1/collections/');
        //^ set-up
        expect(res.status).toBe(422);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: user's id (-1) is below valid range | Program error code: GetAllCollectionsIDUser-2" }
        );
  });
  it('attempt to return all collections from user with ID of 99 (user ID 99 does not exist in database)', async () => {
        const res = await request(app).get('/api/users/99/collections/');
        //^ set-up
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: user's id (99) does not exist | Program error code: GetAllCollectionsIDUser-4" }
        );
  });
  it('attempt to return all collections from user with ID of a random string ("hello")', async () => {
        const res = await request(app).get('/api/users/hello/collections/');
        //^ set-up
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: user's id (hello) does not exist | Program error code: GetAllCollectionsIDUser-4" }
        );
  });
});
describe('testing collections.GetIDCollectionFlashcardSetsIDUser ( GET http://localhost:3000/api/users/:id/collections/:cId/ )', () => {
    it('returns ID 1 collection from user with ID of 1', async () => {
      const res = await request(app).get('/api/users/1/collections/1');
      //^ set-up
      console.log(res.body.message);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        {
          result: [
            {
              description: "I really like these set(s)",
              id: 1,
              name: "my favs",
              userId: 1
            }
          ],
          resultSets: [
            {
              averageReview: 4.5,
              created: "2024-11-23T15:27:30.153Z",
              description: "set of random questions",
              id: 1,
              name: "da quiz",
              updated: null,
              userId: 1
            }
          ]
        }
      );
    });
    it('attempt to return ID 1 collections from user with ID of 0 (invalid id)', async () => {
        //* attempt for user to get get a collection that does not belong to that user
        const res = await request(app).get('/api/users/0/collections/1');
        //^ set-up
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: user's id (0) does not exist | Program error code: validateCollectionOwnership-3" }
        );
    });
    it('attempt to return ID 1 collection flashcards from user with ID of -1 (invalid id)', async () => {
        const res = await request(app).get('/api/users/1/collections/-1');
        //^ set-up
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: collection's id (-1) does not exist | Program error code: validateCollectionOwnership-4" }
        );
    });
    it('attempt to return ID 1 collection flashcards from user with ID of 99 (user ID 99 does not exist in database)', async () => {
        const res = await request(app).get('/api/users/99/collections/1');
        //^ set-up
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: user's id (99) does not exist | Program error code: validateCollectionOwnership-3" }
        );
    });
    it('attempt to return ID 1 collection flashcards from user with ID of a random string ("hello")', async () => {
        const res = await request(app).get('/api/users/hello/collections/1');
        //^ set-up
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: user's id (hello) does not exist | Program error code: validateCollectionOwnership-3" }
        );
    });
    it('attempt to return ID 1 collection flashcards from user with ID of a random string ("hello")', async () => {
        const res = await request(app).get('/api/users/hello/collections/1');
        //^ set-up
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
          { message: "Error: user's id (hello) does not exist | Program error code: validateCollectionOwnership-3" }
        );
    });
    it('attempt to return ID 1 collection flashcards from user ,with ID 2, who exist but is not authorised (having ownership of collection)', async () => {
      const res = await request(app).get('/api/users/2/collections/1');
      //^ set-up
      expect(res.status).toBe(403);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        { message: "That collection does not belong to you! | Program error code: validateCollectionOwnership-6" }
      );
    });
    it('attempt to return ID 0 (invalid id) collection flashcards from user with ID 1', async () => {
      const res = await request(app).get('/api/users/1/collections/0');
      //^ set-up
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        { message: "Error: collection's id (0) does not exist | Program error code: validateCollectionOwnership-4" }
      );
    });
    it('attempt to return ID -1 (invalid id) collection flashcards from user with ID 1', async () => {
      const res = await request(app).get('/api/users/1/collections/-1');
      //^ set-up
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        { message: "Error: collection's id (-1) does not exist | Program error code: validateCollectionOwnership-4" }
      );
    });
    it('attempt to return ID 99 (non-existant id) collection flashcards from user with ID 1', async () => {
      const res = await request(app).get('/api/users/1/collections/99');
      //^ set-up
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        { message: "Error: collection's id (99) does not exist | Program error code: validateCollectionOwnership-4" }
      );
    });
    it('attempt to return ID of random string ("olleh") collection flashcards from user with ID 1', async () => {
      const res = await request(app).get('/api/users/1/collections/olleh');
      //^ set-up
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        { message: "Error: collection's id (olleh) does not exist | Program error code: validateCollectionOwnership-4" }
      );
    });
});
//* most of the test below were already tested in the ones above as they both have the
//* 'validateCollectionOwnership(req,res,info)' common funcion to catch majority of the errors, but the tests this time will still
//* repeated due to the complexity of collections being far more than users and sets.
describe('testing collections.UpdateIDCollection ( PUT http://localhost:3000/api/users/:id/collections/:cId/ )', () => {
  it('updates collection ID 1 by user ID 1', async () => {
    const req = {
      name: "da quiz 2.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
        description: "set of 100% random questions",
        id: 1,
        name: "da quiz 2.0",
        setsIds: [ "1" ],
        userId: 1
      }
    );
  });
  it('attempts to update collection ID 1 by user ID 0 (invalid user id)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/0/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (0) does not exist | Program error code: validateCollectionOwnership-3" }
    );
  });
  it('attempts to update collection ID 1 by user ID -1 (invalid user id)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/-1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (-1) does not exist | Program error code: validateCollectionOwnership-3" }
    );
  });
  it('attempts to update collection ID 1 by user ID 99 (non-existant user)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/99/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (99) does not exist | Program error code: validateCollectionOwnership-3" }
    );
  });
  it('attempts to update collection ID 1 by user ID of a random string (hi) (invalid user id)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/hi/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (hi) does not exist | Program error code: validateCollectionOwnership-3" }
    );
  });
  it('attempts to update collection ID 1 by user ID 2 but does not have authority (ownership of collection)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/2/collections/1/').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(403);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "That collection does not belong to you! | Program error code: validateCollectionOwnership-6" }
    );
  });
  it('attempts to update collection ID 1 by user ID 3 but does not have authority (ownership of collection)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/3/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(403);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "That collection does not belong to you! | Program error code: validateCollectionOwnership-6" }
    );
  });
  it('attempts to update collection ID 0 by user ID 1 (invalid collection id)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/1/collections/0/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: collection's id (0) does not exist | Program error code: validateCollectionOwnership-4" }
    );
  });
  it('attempts to update collection ID -1 by user ID 1 (invalid collection id)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/1/collections/-1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: collection's id (-1) does not exist | Program error code: validateCollectionOwnership-4" }
    );
  });
  it('attempts to update collection ID 99 by user ID 1 (non-existant collection)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/1/collections/99/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: collection's id (99) does not exist | Program error code: validateCollectionOwnership-4" }
    );
  });
  it('attempts to update collection ID of a random string (hi) by user ID 1 (invalid collection id)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/1/collections/hi/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: collection's id (hi) does not exist | Program error code: validateCollectionOwnership-4" }
    );
  });
  it('attempts to update collection ID 1 by user ID 1 but the first one out of the two set ids are invalid', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["0","1"]
    }
    const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 1th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to update collection ID 1 by user ID 1 but there is just one set id which is invalid', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["-1"]
    }
    const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 1th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to update collection ID 1 by user ID 1 but there is just one set id which does not exist (id 99)', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["99"]
    }
    const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 1th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to update collection ID 1 by user ID 1 but there is just one set id which is a random string ("hello")', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["hello"]
    }
    const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 1th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to update collection ID 1 by user ID 1 but the set id array is empty', async () => {
      const req = {
        name: "da quiz 3.0",
        description: "set of 100% random questions",
        setsIds: [ ]
      }
      const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
      //^ set-up
      expect(res.status).toBe(422);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        { message: "set ids list is empty | Program error code: validateCollectionData-5" }
      );
  });
  it('attempts to update collection ID 1 by user ID 1 but the second one out of the two set ids are invalid', async () => {
    const req = {
      name: "da quiz 3.0",
      description: "set of 100% random questions",
      setsIds: ["1","0"]
    }
    const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 2th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to update collection ID 1 by user ID 1 but the name is invalid', async () => {
    const req = {
      name: "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
      description: "set of 100% random questions",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Invalid - input is too long, keep it at 32 characters long or under (excluding ending whitespaces) | Program error code: validateCollectionData-1" }
    );
  });
  it('attempts to update collection ID 1 by user ID 1 but the description is invalid', async () => {
    const req = {
      name: "an excellent quiz",
      description: " W ",
      setsIds: ["1"]
    }
    const res = await request(app).put('/api/users/1/collections/1/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Invalid - appropiate must atleast have 2 characters | Program error code: validateCollectionData-2" }
    );
  });
});
describe('testing collections.PostNewCollection ( POST http://localhost:3000/api/users/:id/collections/:cId/ )', () => {
  it('post collection by user ID 1', async () => {
    const req = {
      authorId: "1",
      name: "da exam",
      description: "the collection 2cool4you!!!",
      setsIds: ["1"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
        name: "da exam",
        id: 2,
        userId: 1,
        setsIds: ["1"],
        description: "the collection 2cool4you!!!"
      }
    );
  });
  it('attempts to post collection by user ID 0 (invalid user id)', async () => {
    const req = {
      authorId: "0",
      name: "da exam",
      description: "the collection 2cool4you!!!",
      setsIds: ["1"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (0) does not exist | Program error code: PostNewCollection-2" }
    );
  });
  it('attempts to post collection by user ID -1 (invalid user id)', async () => {
    const req = {
      authorId: "-1",
      name: "da exam",
      description: "the collection 2cool4you!!!",
      setsIds: ["1"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (-1) does not exist | Program error code: PostNewCollection-2" }
    );
  });
  it('attempts to post collection by user ID 99 (non-existant user)', async () => {
    const req = {
      authorId: "99",
      name: "da exam",
      description: "the collection 2cool4you!!!",
      setsIds: ["1"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (99) does not exist | Program error code: PostNewCollection-2" }
    );
  });
  it('attempts to post collection by user ID of a random string (hiya) (invalid user id)', async () => {
    const req = {
      authorId: "hiya",
      name: "da exam",
      description: "the collection 2cool4you!!!",
      setsIds: ["1"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (hiya) does not exist | Program error code: PostNewCollection-2" }
    );
  });
  it('post collection by user ID 2', async () => {
    const req = {
      authorId: "2",
      name: "da exam 2.0.0",
      description: "the collection that's just a chill guy",
      setsIds: ["1"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');;
    //^ set-up
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
        name: "da exam 2.0.0",
        id: 3,
        userId: 2,
        setsIds: ["1"],
        description: "the collection that's just a chill guy"
      }
    );
  });
  it('attempts to post collection ID 1 by user ID 1 but the first one out of the two set ids are invalid', async () => {
    const req = {
      authorId: "1",
      name: "da exam 2.0.0",
      description: "the collection that's just a chill guy",
      setsIds: ["0","1"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 1th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to post collection ID 1 by user ID 1 but there is just one set id which is invalid', async () => {
    const req = {
      authorId: "1",
      name: "da exam 2.0.0",
      description: "the collection that's just a chill guy",
      setsIds: ["0"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 1th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to post collection ID 1 by user ID 1 but there is just one set id which does not exist (id 99)', async () => {
    const req = {
      authorId: "1",
      name: "da exam 2.0.0",
      description: "the collection that's just a chill guy",
      setsIds: ["99"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 1th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to post collection ID 1 by user ID 1 but there is just one set id which is a random string ("hello")', async () => {
    const req = {
      authorId: "1",
      name: "da exam 2.0.0",
      description: "the collection that's just a chill guy",
      setsIds: ["hello"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 1th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to post collection ID 1 by user ID 1 but the set id array is empty', async () => {
    const req = {
      authorId: "1",
      name: "da exam 2.0.0",
      description: "the collection that's just a chill guy",
      setsIds: [ ]
    }
      const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
      //^ set-up
      expect(res.status).toBe(422);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        { message: "set ids list is empty | Program error code: validateCollectionData-5" }
      );
  });
  it('attempts to post collection ID 1 by user ID 1 but the second one out of the two set ids are invalid', async () => {
    const req = {
      authorId: "1",
      name: "da exam 2.0.0",
      description: "the collection that's just a chill guy",
      setsIds: ["1","0"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "The 2th set does not exist | Program error code: validateWholeCollection-8" }
    );
  });
  it('attempts to post collection by user ID 1 but the name is invalid', async () => {
    const req = {
      authorId: "1",
      name: "da exam 2.0.000000000000000000000000000000000000000000000000000000001",
      description: "the collection that's just a chill guy",
      setsIds: ["hello"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Invalid - input is too long, keep it at 32 characters long or under (excluding ending whitespaces) | Program error code: validateCollectionData-1" }
    );
  });
  it('attempts to post collection by user ID 1 but the description is invalid', async () => {
    const req = {
      authorId: "1",
      name: "da exam 2.0.0",
      description: "  y  ",
      setsIds: ["hello"]
    }
    const res = await request(app).post('/api/collections/').send(req).set('Accept', 'application/json');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Invalid - appropiate must atleast have 2 characters | Program error code: validateCollectionData-2" }
    );
  });
});
describe('testing collections.DeleteIDCollection ( DELETE http://localhost:3000/api/users/:id/collections/ )', () => {
  it('attempt to return ID 1 collections from user with ID of 0 (invalid id)', async () => {
    //* attempt for user to get get a collection that does not belong to that user
    const res = await request(app).delete('/api/users/0/collections/1');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (0) does not exist | Program error code: validateCollectionOwnership-3" }
    );
  });
  it('attempt to delete ID 1 collection flashcards from user with ID of -1 (invalid id)', async () => {
    const res = await request(app).delete('/api/users/1/collections/-1');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: collection's id (-1) does not exist | Program error code: validateCollectionOwnership-4" }
    );
  });
  it('attempt to delete ID 1 collection flashcards from user with ID of 99 (user ID 99 does not exist in database)', async () => {
    const res = await request(app).delete('/api/users/99/collections/1');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (99) does not exist | Program error code: validateCollectionOwnership-3" }
    );
  });
  it('attempt to delete ID 1 collection flashcards from user with ID of a random string ("hello")', async () => {
    const res = await request(app).delete('/api/users/hello/collections/1');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (hello) does not exist | Program error code: validateCollectionOwnership-3" }
    );
  });
  it('attempt to delete ID 1 collection flashcards from user with ID of a random string ("hello")', async () => {
    const res = await request(app).delete('/api/users/hello/collections/1');
    //^ set-up
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "Error: user's id (hello) does not exist | Program error code: validateCollectionOwnership-3" }
    );
  });
  it('attempt to delete ID 1 collection flashcards from user ,with ID 2, who exist but is not authorised (having ownership of collection)', async () => {
  const res = await request(app).delete('/api/users/2/collections/1');
  //^ set-up
  expect(res.status).toBe(403);
  expect(res.headers['content-type']).toMatch(/json/);

  expect(res.body).toEqual(
    { message: "That collection does not belong to you! | Program error code: validateCollectionOwnership-6" }
  );
  });
  it('attempt to delete ID 0 (invalid id) collection flashcards from user with ID 1', async () => {
  const res = await request(app).delete('/api/users/1/collections/0');
  //^ set-up
  expect(res.status).toBe(404);
  expect(res.headers['content-type']).toMatch(/json/);

  expect(res.body).toEqual(
    { message: "Error: collection's id (0) does not exist | Program error code: validateCollectionOwnership-4" }
  );
  });
  it('attempt to delete ID -1 (invalid id) collection flashcards from user with ID 1', async () => {
  const res = await request(app).delete('/api/users/1/collections/-1');
  //^ set-up
  expect(res.status).toBe(404);
  expect(res.headers['content-type']).toMatch(/json/);

  expect(res.body).toEqual(
    { message: "Error: collection's id (-1) does not exist | Program error code: validateCollectionOwnership-4" }
  );
  });
  it('attempt to delete ID 99 (non-existant id) collection flashcards from user with ID 1', async () => {
  const res = await request(app).delete('/api/users/1/collections/99');
  //^ set-up
  expect(res.status).toBe(404);
  expect(res.headers['content-type']).toMatch(/json/);

  expect(res.body).toEqual(
    { message: "Error: collection's id (99) does not exist | Program error code: validateCollectionOwnership-4" }
  );
  });
  it('attempt to delete ID of random string ("olleh") collection flashcards from user with ID 1', async () => {
  const res = await request(app).delete('/api/users/1/collections/olleh');
  //^ set-up
  expect(res.status).toBe(404);
  expect(res.headers['content-type']).toMatch(/json/);

  expect(res.body).toEqual(
    { message: "Error: collection's id (olleh) does not exist | Program error code: validateCollectionOwnership-4" }
  );
  });
  it('delete ID 1 collection from user with ID of 1', async () => {
    const res = await request(app).delete('/api/users/1/collections/1');
    //^ set-up
    expect(res.status).toBe(204);
    //expect(res.headers['content-type']).toMatch(/json/);
    //^ this line is disable as no body content is allowed to be sent alongside browser responce code '204'
  });
});
describe('testing collections.GetAllCollections ( GET http://localhost:3000/api/collections/ )', () => {
  it('returns all collections (after the changes of the previous tests)', async () => {
    const res = await request(app).get('/api/collections/');
    //^ set-up
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      [
        {
            description: "the collection 2cool4you!!!",
            id: 2,
            name: "da exam",
            userId: 1
        },
        {
            description: "the collection that's just a chill guy",
            id: 3,
            name: "da exam 2.0.0",
            userId: 2
        }
      ]
    );
  });
});
describe('testing collections.GetRandomCollection ( GET http://localhost:3000/api/collections/random )', () => {
  it('returns a randomly chosen collections (after the changes of the previous tests)', async () => {
    const res = await request(app).get('/api/collections/random');
    //^ set-up
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);

    //: checking property instead of value because values can randomly be any of the stored records
    expect(res.body).toHaveProperty('description');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('userId');
  });
});
//#rendregion