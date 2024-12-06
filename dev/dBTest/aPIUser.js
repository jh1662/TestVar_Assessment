const request = require('supertest');
const app = require('../../src/server/index');

const { db, initialiseDB } = require('../dBTest/setupTestDB');
beforeAll(async () => { await initialiseDB(); });
afterAll(async () => { await db.destroy(); });

//#region GET requests
describe('testing user.GetAllUsersDetails', () => {
    it('returns all user details', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);

      expect(res.body).toEqual(
        [
            {
              "id": 1,
              "username": "JohnWick",
              "admin": 0,
              "dailySets": 0
            },
            {
              "id": 2,
              "username": "Arbbys",
              "admin": 0,
              "dailySets": 0
            },
            {
              "id": 3,
              "username": "dripler",
              "admin": 1,
              "dailySets": 0
            }
        ]
      );
    });
});
//#endregion
//#region PUT requests

//#endregion
//#region POST requests

//#endregion
//#region DELETE requests

//#endregion
