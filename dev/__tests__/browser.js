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

describe('User tries to log in but entered the wrong password', () => {
    it('Goes to the website"', async () => {
        const res = await request(app).get('/')
        expect(res.status).toBe(200);
    });
    it('Goes to the login prompt"', async () => {
      const res = await request(app).get('/user/')
      expect(res.status).toBe(200);
    });
    it('Logs in as "JohnWick" with the incorrect password of "DogeCoin2.?4!"', async () => {
        //: set-up
        const req = {
          //* the to-be json to be sent to the server
          username: "JohnWick",
          password: "DogeCoin2.?4!"
        }
        const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

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
describe('User tries to log in but username is too short', () => {

});
describe('User logs in successfully', () => {

});
describe('User views its profile', () => {

});