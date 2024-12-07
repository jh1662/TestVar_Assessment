//* to make jest understand modern JavaScript syntax/tokens, npm script is: "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"

//#region set-up
const request = require('supertest');
const {app, server} = require('../../src/server/index');

beforeAll(async () => { });
afterAll(async () => {
  clearInterval(global.dailySetsUpdate);
  if(server) { await server.close(); }
});

//#endregion

describe('GET /api', () => {
    //^ testing the api function (can have multiple test inside)
    //: one test
    it('simply return API version', async () => {
      const res = await request(app).get('/api');
      //^ request to server
      expect(res.status).toBe(200);
      //^ checks browser responce code
      expect(res.headers['content-type']).toMatch(/json/);
      //^ checks body type
      expect(res.body.version).toBe('1.0.0');
      //^ check a attribute of the body
      expect(res.body).toEqual({version: '1.0.0'});
      //^ checks the whole JSON
    });
});

//#region sub-tests