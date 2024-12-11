/* debug line:
console.log(res.body.message);
//^ If API functions fails, when it shouldn't, this line will print the reason (given by the API)
*/
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
//#region tests
describe('testing user.GetAllUsersDetails ( GET http://localhost:3000/api/users )', () => {
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
describe('testing user.PostNewUser ( POST http://localhost:3000/api/users:id )', () => {
  it('create a user', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "johndoe",
      admin: false,
      password: "password"
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
  it('create the same user again', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "johndoe",
      admin: false,
      password: "password"
    }
    const res = await request(app).post('/api/users').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(409);
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
describe('testing user.GetIDUserDetails ( GET http://localhost:3000/api/users/:id )', () => {
  it('get info of the user with id of 1', async () => {
    const res = await request(app).get('/api/users/1');
    //^ set-up

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      {
        admin: 0,
        dailySets: 0,
        id: 1,
        username: "JohnWick"
      }
    );
  });
  it('get info of the user with another id (of 2)', async () => {
    const res = await request(app).get('/api/users/2');
    //^ set-up

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      {
        admin: 0,
        dailySets: 1,
        id: 2,
        username: "Arbbys"
      }
    );
  });
  it('get info of the user with another id but id does not exist in database', async () => {
    const res = await request(app).get('/api/users/99');
    //^ set-up

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "no such user with id '99' exists  | Program error code: validUserById-2" }
    );
  });
  it('get info of the user with another id but id of 0 (an invalid id)', async () => {
    const res = await request(app).get('/api/users/0');
    //^ set-up

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "id '0' is below valid range (1 or above)  | Program error code: validUserById-1" }
    );
  });
  it('get info of the user with another id but id of -1 (an invalid id)', async () => {
    const res = await request(app).get('/api/users/-1');
    //^ set-up

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      { message: "id '-1' is below valid range (1 or above)  | Program error code: validUserById-1" }
    );
  });
});
describe('testing user.PutIDUserUpdate ( PUT http://localhost:3000/api/users:id )', () => {
  it('updating a user with an ID of 1', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "wickjohn",
      admin: true,
      password: "cats"
    }
    const res = await request(app).put('/api/users/1').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
        id: 1,
        username: "wickjohn",
        admin: 1,
        dailySets: 0
      }
    );
  });
  it('updating user (with ID of 2) to make user an admin but username is still the same', async () => {
    //* in practical use, it is not good to promote an existing user to admin for security reasons but
    //* can still be changes if this is really needed by the client!
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys",
      admin: true,
      password: "Password1"
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual(
      {
        id: 2,
        username: "Arbbys",
        admin: 1,
        dailySets: 1
      }
    );
  });
  it('updating a user with another ID (of 2) and only changing username', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys2",
      admin: false,
      password: "Password1"
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
        id: 2,
        username: "Arbbys2",
        admin: 0,
        dailySets: 1
      }
    );
  });
  it('updating a user by only changing password', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys",
      admin: false,
      password: "Password2"
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {
        id: 2,
        username: "Arbbys",
        admin: 0,
        dailySets: 1
      }
    );
  });
  it('attempting to update a user but username is undefined', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      admin: false,
      password: "Password1"
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no valid 'username' value in request's body: Invalid - text/name input is empty (as 'undefined')  | Program error code: validateUserByInfo-3" }
    );
  });
  it('attempting to update a user but password is undefined', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys",
      admin: false,
      /*password: undefined*/
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no valid 'password' value in request's body: Invalid - text/name input is empty (as 'undefined')  | Program error code: validateUserByInfo-4" }
    );
  });
  it('attempting to update a user but username is too short', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "H",
      admin: false,
      password: "Password1"
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no valid 'username' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: validateUserByInfo-3" }
    );
  });
  it('attempting to update a user but passowrd is too short', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys",
      admin: false,
      password: "P"
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no valid 'password' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: validateUserByInfo-4" }
    );
  });
  it('attempting to update a user but try to bypass minimum username character count with whitespaces', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "  A     ",
      admin: false,
      password: "Password1"
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no valid 'username' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: validateUserByInfo-3" }
    );
  });
  it('attempting to update a user but try to bypass minimum password character count with whitespaces', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys",
      admin: false,
      password: "  P     "
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no valid 'password' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: validateUserByInfo-4" }
    );
  });
  it('attempting to update a user but username is too long', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbysssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
      admin: false,
      password: "Password1"
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no valid 'username' value in request's body: Invalid - input is too long, keep it at 32 characters long or under (excluding ending whitespaces)  | Program error code: validateUserByInfo-3" }
    );
  });
  it('attempting to update a user but password is too long', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys",
      admin: false,
      password: "Password111111111111111111111111111111111111111111111111111111111111111111"
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no valid 'password' value in request's body: Invalid - input is too long, keep it at 32 characters long or under (excluding ending whitespaces)  | Program error code: validateUserByInfo-4" }
    );
  });
  it('attempting to update a admin but is undefined', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys",
      admin: undefined,
      password: "Password1"
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "did not specify if user should be admin or not  | Program error code: validateUserByInfo-1" }
    );
  });
  it('attempting to update a admin is a random string', async () => {
    //: set-up
    const req = {
      //* the to-be json to be sent to the server
      username: "Arbbys",
      admin: "fhu4358ntc347ty 4357ty374 8tf348=",
      password: "Password1"
      //^ this code being enabled or not does not make differance but informs the dev looking at this
    }
    const res = await request(app).put('/api/users/2').send(req).set('Accept', 'application/json');

    console.log(res.body.message);

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "admin powers should be either true or false; neither was detected  | Program error code: validateUserByInfo-2" }
    );
  });
});
describe('testing user.DeleteIDUser ( DELETE http://localhost:3000/api/users/:id )', () => {
  //* this resting may have more tests than other integer tests but all API functions with ID validation
  //* goes though the same function for ID validation ('validUserById(req,res,id)')
  it('delete user with ID of 2', async () => {
    const res = await request(app).delete('/api/users/2');
    //^ set-up
    expect(res.status).toBe(204);
    //^ no "(res.body).toEqual" check accompany because browser prevents any body data to be sent
    //^ alongside a response with status code '204'.
  });
  it('attempt to delete user with ID of 99 (ID does not exist)', async () => {
    const res = await request(app).delete('/api/users/99');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.body).toEqual(
      { message: "no such user with id '99' exists  | Program error code: validUserById-2" }
    )
  });
  it('attempt to delete user with ID of 0 (invalid ID)', async () => {
    const res = await request(app).delete('/api/users/0');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.body).toEqual(
      { message: "id '0' is below valid range (1 or above)  | Program error code: validUserById-1" }
    )
  });
  it('attempt to delete user with ID of -1 (invalid ID)', async () => {
    const res = await request(app).delete('/api/users/-1');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.body).toEqual(
      { message: "id '-1' is below valid range (1 or above)  | Program error code: validUserById-1" }
    )
  });
  it('attempt to delete user with ID of a random string (invalid ID)', async () => {
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
describe('testing user.GetUserSets AGAIN ( GET http://localhost:3000/api/users/:id/sets/ )', () => {
  //* the only one the depends on another database table besides the "Users" one
  it('returns all flashcard sets of user with ID of 1', async () => {
    const res = await request(app).get('/api/users/1/sets/');
    //^ set-up
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      [
        {
         "averageReview": 4.5,
         "created": "2024-11-23T15:27:30.153Z",
         "description": "set of random questions",
          "id": 1,
         "name": "da quiz",
         "updated": null,
         "userId": 1,
        },
      ]
    );
  });
  it('returns all flashcard sets of user with ID of 4', async () => {
    const res = await request(app).get('/api/users/4/sets/');
    //^ set-up
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      [ ]
      //^ it is an empty array because user ID 4 never made a flashcard set
    );
  });
  it('attempt to return all flash cardset of user with ID of 0', async () => {
    const res = await request(app).get('/api/users/0/sets/');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "id '0' is below valid range (1 or above)  | Program error code: validUserById-1"}
    );
  });
  it('attempt to return all flash cardset of user with ID of 99', async () => {
    const res = await request(app).get('/api/users/99/sets/');
    //^ set-up
    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      { message: "no such user with id '99' exists  | Program error code: validUserById-2"}
    );
  });
});
describe('testing user.GetAllUsersDetails AGAIN ( GET http://localhost:3000/api/users )', () => {
  it('returns all user details after changes', async () => {
    //* make sure that the current/updated data in the database is always read
    const res = await request(app).get('/api/users');
    //^ set-up
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      [
        {
            "admin": 1,
            "dailySets": 0,
            "id": 1,
            "username": "wickjohn"
        },
        {
            "admin": 1,
            "dailySets": 20,
            "id": 3,
            "username": "dripler"
        },
        {
            "admin": 0,
            "dailySets": 0,
            "id": 4,
            "username": "johndoe"
        },
        {
            "admin": 1,
            "dailySets": 0,
            "id": 5,
            "username": "theUser25"
        }
      ]
    );
  });
});
//#endregion

/* template:
describe('testing [file].[funct] ( GET http://localhost:3000/[sub URL] )', () => {
  it('returns all user details', async () => {
    const res = await request(app).get('[sub URL]');
    //^ set-up
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);

    expect(res.body).toEqual(
      {  }
    );
  });
});
*/