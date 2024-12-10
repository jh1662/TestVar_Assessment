const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0', language: "en-UK"});
//^ imports with options

//: metadata and compnents of the openAPI.yaml file
const doc = {
    info: {
        title: 'My API (modified)',
        description: "openAPI standard specification of my program which is a modified version of the assignment's provided one."
    },
    servers: [
        {
        url: 'http://localhost:3000',
        description: 'URL when the command "npm run dev" is running'
        },
    ],
    tags: [
        { name: 'General', description: 'Besides dealing with the flashcards, sets, and collections' },
        { name: 'Users', description: 'Everything to do with the user accounts' },
        { name: 'Flashcard sets', description: 'Everything to do with the sets of flashcards' },
        { name: 'Collections', description: 'Everything to do with the collections of flashcards sets' },
        { name: 'redirects/communication', description: 'communication between browser and server' },
    ],
    components: {
        schemas: {

            //: the basics

            user: {
                $id: 1,
                $username: "JohnWick",
                $admin: 1,
                $dailySets: 0
            },
            flashcard: {
                $id: 1,
                $front: "what is 2+2 ?",
                $back: "4",
                $difficulty: 1,
                $setsId: 1
            },
            flashcardSet: {
                $id: 1,
                $name: "da quiz",
                $description: "set of random questions",
                $averageReview: 4.5,
                $created: "2024-10-23T15:27:30.153Z",
                $updated: null,
                $userId: 1
            },
            collection: {
                $id: 1,
                $name: "my favs",
                $description: "I really like these set(s)",
                $userId: 1
            },

            //: simple messages
            message: {
                $message: "success"
            },
            error: {
                $message: "error encountered"
            },
            version: {
                $version: "1.0.0"
            },

            //: the arrays (for getting multiple of the same schema, such as getting all existing users)
            sets: { $ref: '#/definitions/flashcardSet' },
            collections: { $ref: '#/definitions/collection' },
            flashcards: { $ref: '#/definitions/flashcard' },
            users: { $ref: '#/definitions/user' },
        }
    }
};

//: relevent files involed in the file's generation
const outputFile = './openAPI.yaml';
const routes = ['./src/server/index.js'];

swaggerAutogen(outputFile, routes, doc);
//^ execution