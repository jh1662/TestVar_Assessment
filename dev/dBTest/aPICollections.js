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
  if(server) { await server.close();}
});
//#endregion
//#region tests
describe('testing collections.GetAllCollectionsIDUser ( GET http://localhost:3000/api/users/:id/collections/ )', () => {
    it('returns all collections from user with ID of 1', async () => {
      const res = await request(app).get('/api/users/1/collections/');
      //^ set-up
      console.log(res.body.message);
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
describe('testing collections.GetIDCollectionFlashcardSetsIDUser ( GET http://localhost:3000/api/users/:id/collections/:cId )', () => {
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
    it('attempt to return ID 1 collections from user with ID of 0 (does not belong to ID 0)', async () => {
        //* attempt for user to get get a collection that does not belong to that user
        const res = await request(app).get('/api/users/0/collections/1');
        //^ set-up
        expect(res.status).toBe(403);
        expect(res.headers['content-type']).toMatch(/json/);
    
        expect(res.body).toEqual(
          { message: "That collection does not belong to you! | Program error code: validateCollectionOwnership-6" }
        );
    });  
    it('attempt to return ID 1 collections from user with ID of -1 (does not belong to ID -1)', async () => {
        const res = await request(app).get('/api/users/1/collections/-1');
        //^ set-up
        expect(res.status).toBe(403);
        expect(res.headers['content-type']).toMatch(/json/);
    
        expect(res.body).toEqual(
          { message: "That collection does not belong to you! | Program error code: validateCollectionOwnership-6" }
        );
    });/*
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
    */
});
//#rendregion