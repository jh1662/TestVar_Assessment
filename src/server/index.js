/*
try{
}catch(err){console.log(err.message);}
*/

//: set up and instantiate the APIs for the API with 'knex' to use the 'SQLite3' DBMS (DataBase Management System)
const db = require('./dataBaseMS');
const rs = require('./dBRestrictions');

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


//: Corrosponds websites to URLs

//: Corrosponds navigation pane's buttons to pages (GET)
app.get('/', (req, res) => { res.render('home'); console.log("go home"); });
app.get('/user', (req, res) => { res.render('login'); console.log("go login"); });


//: Corrosponds users inputs (like textboxes and buttons) to actions (POST)
app.post('/user', (req, res) => {
    if (res.hasOwnProperty('username') && res.hasOwnProperty('password')){

    }
    else if (res.hasOwnProperty('username') && res.hasOwnProperty('password1') && res.hasOwnProperty('password2')){

    }
});

//#region API requests for API
app.get('/api', async (req, res) => {
    fs.readFile(path.join(__dirname, '../client/assets/api.json'), 'utf8', (err, data) => {
        if (err) {
            /*
            const message = {
                title: "ERROR", subTitle: "Code: 500",
                msg: "The API version JSON file was not found"
            };
            */
            res.status(500).json({message: err.message});
        }
        else{
            res.status(200)
            .set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
            //^ This is neccessary otherwise the browser gets the "304" status for doing this before.
            .json(JSON.parse(data));
        }
    });
});
//#endregion
//#region API requests for users
app.get('/api/users', async (req, res) => {
    let result;
    try{ result = await db('Users').select('id', 'username', 'admin'); }
    catch(err){ res.json({message: err.message}); return; }
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
    .send(result);
});
app.post('/api/users', async (req, res) => {
    const user = {id: req.body.id, username: req.body.username, password: req.body.password, admin: req.body.admin};
    let result;
    try{
        if (!(await rs.user(user.username))){ res.json({message: "User (by username) already exists"}); return; }
        if (!(await rs.userId(user.id))){ res.json({message: "User (by id) already exists"}); return; }
        if (user.id === undefined){ await db("Users").insert({username: user.username, password: user.password, admin: user.admin}); }
        else { await db("Users").insert({id: user.id, username: user.username, password: user.password, admin: user.admin}); }
        console.log(user.username);
        try{
        //const result = await db('Users').where({username: user.username}).select('id', 'username', 'admin');
        const result = await db('Users').where({ username: user.username });
        } catch(err){console.log("DA ERROE -" + err.message);}
        console.log("--2--");
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate').set('Pragma', 'no-cache').set('Expires', '0')
        .json(JSON.parse(result));
        console.log("--3--");
    }
    catch (err){ res.json({message: err.message}); }
});

//#endregion

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
//^! This code line shouldn't be needed, yet it is.
*/