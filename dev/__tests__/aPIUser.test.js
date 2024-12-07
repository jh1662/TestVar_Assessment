//#region set-up
const request = require('supertest');
const {app, server} = require('../../src/server/index');
const reFill = require('../dBTest/sampleDatabase');

beforeAll(async () => {
  console.log("start aPIUSer tests!");
  process.env.NODE_ENV = 'test';
  await reFill.initialiseDB();
});
afterAll(async () => {
  console.log("end aPIUSer tests!");
  clearInterval(global.dailySetsUpdate);
  await reFill.db.destroy();
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
            "dailySets": 1
          },
          {
            "id": 3,
            "username": "dripler",
            "admin": 1,
            "dailySets": 20
          }
      ]
    );
  });
});
describe('testing user.GetIDUserDetails', () => {
  it('get info of the user with id of 1', async () => {
    const res = await request(app).get('/api/users/1');
    //^ set-up

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      {  }
    );
  });
});
//#endregion
//#region PUT requests

//#endregion
//#region POST requests
describe('testing user.GetIDUserDetails', () => {
  it('create a user', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "johndoe",
      admin: false,
      password: "password"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

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
  it('create the same user again', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "johndoe",
      admin: false,
      password: "password"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(429);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "User (by username) already exists  | Program error code: validateUserByInfo-6"}
    );
  });
  it('create user but with no username', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "",
      admin: false,
      password: "password"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no valid 'username' value in request's body: Invalid - input is empty  | Program error code: validateUserByInfo-3"}
    );
  });
  it('create user but with no password', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "jonny",
      admin: false,
      password: ""
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no valid 'password' value in request's body: Invalid - input is empty  | Program error code: validateUserByInfo-4"}
    );
  });
  it('create user but with username too short', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "L",
      admin: false,
      password: "password"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no valid 'username' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: validateUserByInfo-3"}
    );
  });
  it('create user but with password too short', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Bonny",
      admin: false,
      password: "W"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no valid 'password' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: validateUserByInfo-4"}
    );
  });
  it('create user but try to bypass minimum username character count with whitespaces', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "   g   ",
      admin: false,
      password: "passsssssword123"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no valid 'username' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: validateUserByInfo-3"}
    );
  });
  it('create user but try to bypass minimum password character count with whitespaces', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "winnerMan420",
      admin: false,
      password: "  s        "
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no valid 'password' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: validateUserByInfo-4"}
    );
  });
  it('create user but username is too long', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "longerThan32CharactersWWWWWWWWWWW",
      admin: false,
      password: "gh22d4"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no valid 'username' value in request's body: Invalid - input is too long, keep it at 32 characters long or under (excluding ending whitespaces)  | Program error code: validateUserByInfo-3"}
    );
  });
  it('create user but passowrd is too long', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "theUser25",
      admin: false,
      password: "longerThan32CharactersWWWWWWWWWWW"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no valid 'password' value in request's body: Invalid - input is too long, keep it at 32 characters long or under (excluding ending whitespaces)  | Program error code: validateUserByInfo-4"}
    );
  });
  it('create user with admin as true instead of false', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "theUser25",
      admin: true,
      password: "adminnerlol"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      {
        id: 5,
        username: "theUser25",
        admin: 1,
        dailySets: 0
      }
    );
  });
  it('create user but admin is empty', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "theUser26",
      admin: undefined,
      password: "adminnerlol"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "did not specify if user should be admin or not  | Program error code: validateUserByInfo-1" }
    );
  });
  it('create user but admin is some string', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "theUser26",
      admin: "no idea :P",
      password: "adminnerlol"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "admin powers should be either true or false; neither was detected  | Program error code: validateUserByInfo-2" }
    );
  });
});
//#endregion
//#region DELETE requests

//#endregion
