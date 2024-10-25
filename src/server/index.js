//: set up and instantiate the REST API (express.js)
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
app.use(express.static(path.join(__dirname, '../client/staticAssets')));
//^ files to send to client no matter what user requests
app.set('views', path.join(__dirname, '../client/'));

//: Corrosponds websites to URLs

//: Corrosponds navigation pane's buttons to pages
app.get('/', (req, res) => {
    console.log("go home")
    res.render('home')
});

/* Guides used:
> Beginner guide of Express.js: https://www.youtube.com/watch?v=-MTSQjw5DrM
> Using specailised HMTL tags: https://www.w3schools.com/tags/tag_comment.asp
> Fixed error: "TypeError: Cannot read properties of undefined (reading 'headersSent')": Used guide: https://stackoverflow.com/questions/51125444/nodejs-typeerror-cannot-read-property-headerssent-of-undefined
> Understanding SQLite's data types: https://www.sqlite.org/datatype3.html
> Getting started with the SQLite ORM: https://knexjs.org/guide/migrations.html
*/