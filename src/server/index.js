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

//: Corrosponds websites to URLs
app.get('/', function(req, res) {
    //* home page
    res.sendFile(path.join(__dirname, '../client/home.html'));
});

/* DEBUG LOG:
> Fixed error: "TypeError: Cannot read properties of undefined (reading 'headersSent')"
- Used guide: https://stackoverflow.com/questions/51125444/nodejs-typeerror-cannot-read-property-headerssent-of-undefined
- Removed "()" from "const express = require('express')();"

>
*/

/* Guides used:
> Beginner guide of Express.js: https://www.youtube.com/watch?v=-MTSQjw5DrM
*/