//#region set-up
const request = require('supertest');
const {app, server} = require('../../src/server/index');
const reFill = require('../dBTest/sampleDatabase');

beforeAll(async () => {
    console.log("start use-case tests!");
    process.env.NODE_ENV = 'test';
    await reFill.initialiseDB();
});
afterAll(async () => {
    console.log("end use-case tests!");
    clearInterval(global.dailySetsUpdate);
    await reFill.db.destroy();
    if(server) { await server.close();}
});
//#endregion

describe('User tries to log in but entered the wrong password and then wrong username before being sucessful, afterwards proceed to view profile', () => {
    it('Goes to the website"', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(302);
        //^ browser code '302' means the browser will redirect to another URL
    });
    it('Goes to the login prompt"', async () => {
        const res = await request(app).get('/user/');

        expect(res.status).toBe(200);

        //: checking header ONLY once as property name should be identical thoughout the other tests
        expect(res.header).toHaveProperty('connection');
        expect(res.header).toHaveProperty('content-length');
        expect(res.header).toHaveProperty('content-type');
        expect(res.header).toHaveProperty('date');
        expect(res.header).toHaveProperty('etag');
        expect(res.header).toHaveProperty('x-powered-by');
    });
    it('Logs in as "JohnWick" with the incorrect password of "DogeCoin2.?4!"', async () => {
        //: set-up
        const req = {
            //* the to-be json to be sent to the server
            username: "JohnWick",
            password: "DogeCoin2.?4!"
        }
        const res = await request(app).post('/user/login').send(req).set('Accept', 'application/json');

        expect(res.status).toBe(422);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
            { message: "Password does not match  | Program error code: login-5" }
        );
    });
    it('accidently left the username input box after entering the first character', async () => {
        //: set-up
        const req = {
            //* the to-be json to be sent to the server
            username: "J",
            password: "ohnWick  dogs"
        }
        const res = await request(app).post('/user/login').send(req).set('Accept', 'application/json');

        expect(res.status).toBe(422);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toEqual(
            { message: "no valid 'username' value in request's body: Invalid - appropiate must atleast have 2 characters  | Program error code: login-1" }
        );
    });
    it('user finally successfully logs in', async () => {
        //: set-up
        const req = {
            //* the to-be json to be sent to the server
            username: "JohnWick",
            password: "dogs"
        }
        const res = await request(app).post('/user/login').send(req).set('Accept', 'application/json');

        expect(res.status).toBe(201);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toHaveProperty('token');
        console.log("partially randomly generated toke this test is: "+res.body.token);
        //^ to show the developer what the token looks like
    });
    it('after successfully logging in, user views its profile', async () => {
        const res = await request(app).get('/user/');
        expect(res.status).toBe(200);
    });
});

describe('User views all sets then decide to view the set ID 1', () => {
    it('Goes to the website"', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(302);
    });
    it('Views the sets"', async () => {
        const res = await request(app).get('/sets/all');
        expect(res.status).toBe(200);
        expect(res.text).toContain("<li>set: da quiz</li>");
        //^ check if the right HTML is being loaded
        expect(res.text).toContain('<h2 id="mode">View all:</h2>');
        //^ unique to viewing all sets
    });
    it('Gets set ID 1', async () => {
        const res = await request(app).get('/set/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('cards');
        //^ having the array of flashcards belonging to the set
        expect(res.body).toHaveProperty('averageReview');
        //^ unique to the flashcard set datastructure
    });
});