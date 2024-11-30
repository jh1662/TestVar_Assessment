//#region import and set-ups
//: set up and instantiate the APIs with oher JS files
const db = require('./databaseMS');
const rs = require('./dBIsUniqueRecord');
const user = require('./aPIUser');
const sets = require('./aPISets');
const collections = require('./aPICollections');

//: set up and instantiate the API for reading from JSON files
const fs = require('fs');

//: set up and instantiate the REST API with 'express' to host the website
const express = require('express');
const app = express();
app.use(express.json());
//^ instantiating this way imports the ability to parse JSONs
const port = 3000;
app.listen(
    port,
    () => console.log(`Server is up on URL: http://localhost:${port}`))
    //^ lambda function that notify when the server is up and the URL to access it

//: the rest of the setup
const path = require('path');
//^ allows fetching of other files
app.set('view engine', 'ejs');
//^ instantiate 'ejs' framework in the 'express' instance to allow 'express' to render 'ejs' files as if they were HTML files (or smth like that)
app.use(express.static(path.join(__dirname, '../client/staticAssets/')));
//^ files to send to client no matter what user requests
app.set('views', path.join(__dirname, '../client/'));
//^ tells the location of the folder of files where some are to be rendered
//#endregion

//#region front-end to app (Corrosponds loading website pages to URLs)
app.get('/', (req, res) => { res.redirect('/home'); console.log("redirect"); });
//^ ideally the first the page user comes to.
app.get('/home', (req, res) => { res.render('home'); console.log("go home"); });
app.get('/user', (req, res) => { res.render('login'); console.log("go login"); });
//#endregion
//#region API requests for API version
app.get('/api', async (req, res) => {
    fs.readFile(path.join(__dirname, '../client/assets/api.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({message: err.message});
        }
        else{
            res.status(200)
            .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
            .json(JSON.parse(data));
        }
    });
});
//#endregion
//#region app to api (back-end)
//:API requests for users
app.get('/api/users', user.GetAllUsersDetails);
app.post('/api/users', user.PostNewUser);
app.get('/api/users/:id', user.GetIDUserDetails);
app.put('/api/users/:id', user.PutIDUserUpdate);
app.delete('/api/users/:id', user.DeleteIDUser);
app.get('/api/users', user.GetAllUsersDetails);
app.get('/api/users/:id/sets/', user.GetUserSets);

//:API requests for flashcards sets
app.get('/api/sets', sets.GetAllSets);
app.post('/api/sets', sets.CreateNewSet);
app.get('/api/sets/:id', sets.GetIDSet);
app.put('/api/sets/:id', sets.PutIDSet);
app.delete('/api/sets/:id', sets.DeleteIDSet);
app.post('/api/sets/:id/review', sets.PostIDSetReview);
app.get('/api/sets/:id/cards', sets.GetIDSetCards);

//:API requests for collections
app.get('/api/users/:id/collections/', collections.GetAllCollectionsIDUser);
app.get('/api/users/:id/collections/:cId', collections.GetIDCollectionFlashcardSetsIDUser);
//^ "CId" stands for: Collection Id
app.put('/api/users/:id/collections/:cId', collections.UpdateIDCollection);
app.delete('/api/users/:id/collections/:cId', collections.DeleteIDCollection);
app.get('/api/collections', collections.GetAllCollections);
app.post('/api/collections', collections.PostNewCollection);
app.get('/api/collections/random',collections.GetRandomCollection);
//#endregion

module.exports = app;
//^ Exports all app functions for dev testing

/* //! Unpredictable error
node:_http_outgoing:696 throw new ERR_HTTP_HEADERS_SENT('set'); ^ Error [ERR_HTTP_HEADERS_SENT]:
Cannot set headers after they are sent to the client at ServerResponse.setHeader (node:_http_outgoing:696:11)
at ServerResponse.header (C:\Users\Emperor Haddad\TestVar_Assessment\node_modules\express\lib\response.js:794:10)
at ServerResponse.send (C:\Users\Emperor Haddad\TestVar_Assessment\node_modules\express\lib\response.js:174:12)
at ServerResponse.json (C:\Users\Emperor Haddad\TestVar_Assessment\node_modules\express\lib\response.js:278:15)
at PostNewUser (C:\Users\Emperor Haddad\TestVar_Assessment\src\server\aPIUser.js:84:162)
{ code: 'ERR_HTTP_HEADERS_SENT' }
 Node.js v21.2.0 [nodemon] app crashed - waiting for file changes before starting...
*/
/* Guides used:
> Beginner guide of Express.js: https://www.youtube.com/watch?v=-MTSQjw5DrM
> Using specailised HMTL tags: https://www.w3schools.com/tags/tag_comment.asp
> Fixed error: "TypeError: Cannot read properties of undefined (reading 'headersSent')". Used guide: https://stackoverflow.com/questions/51125444/nodejs-typeerror-cannot-read-property-headerssent-of-undefined
> Understanding SQLite's data types: https://www.sqlite.org/datatype3.html
> Getting started with the SQLite ORM: https://knexjs.org/guide/migrations.html
*/

/* Redundant code:
>V
app.use('/style.css', express.static(path.join(__dirname, 'public', 'style.css')));
//^ Tells MIME (Multipurpose Internet Mail Extensions) that its a CSS file instead of HTML as error says: MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.
//^ This code line shouldn't be needed, yet it is.

>V
JSON.parse(data);
//^ Only works for string not JS objects as apparently they are treated as JSON anyways

>V
// const username = await db('Users').where({ id: id }).select("username").first();
// result = {message: `SUCCESS - user ${username}, with id ${id} has been deleted successfully`};
//^ Code 204 - explicitly indicates that there should be no content in the response body!
res.status(204)
.set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
.json(result);

>V
    const message = {
    title: "ERROR", subTitle: "Code: 500",
    msg: "The API version JSON file was not found"
};

>V
try{
}catch(err){console.log(err.message);}

>V
res.render('index', { data: data });
*/