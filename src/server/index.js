//: set up and instantiate the API for the API with 'knex' to use the 'SQLite3' DBMS (DataBase Management System)
const db = require('./database');

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

    res.render('user'); console.log("go login"); });

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