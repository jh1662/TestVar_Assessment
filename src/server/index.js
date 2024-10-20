

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

//: Corrosponds websites to URLs

/* DEBUG LOG:
> Fixed error: "TypeError: Cannot read properties of undefined (reading 'headersSent')"
- Used guide: "https://stackoverflow.com/questions/51125444/nodejs-typeerror-cannot-read-property-headerssent-of-undefined"
- Removed "()" from "const express = require('express')();"

>
*/