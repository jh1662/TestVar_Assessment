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

describe('TESTING', () => {
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
});