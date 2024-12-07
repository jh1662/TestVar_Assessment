//#region set-up
const request = require('supertest');
const {app, server} = require('../../src/server/index');

const { db, initialiseDB } = require('../dBTest/sampleDatabase');
beforeAll(async () => { await initialiseDB(); });
afterAll(async () => {
  clearInterval(global.dailySetsUpdate);
  await db.destroy();
  if(server) { await server.close(); }
});
//#endregion
//#region GET requests
describe('testing user.GetAllUsersDetails', () => {
    it('returns all user details', async () => {
      const res = await request(app).get('/api/users');
      //^ set-up

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

describe('testing user.GetIDUserDetails', () => {
  it('create a user', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "johndoe",
      admin: false,
      password: "password"
    }
    const res = await request(app).post('/api/users/1').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
        id: 4,
        username: "johndoe",
        admin: 0,
        dailySets: 0
      }
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
