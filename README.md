# U14465

## Description
My work for Assessment 1 from the Programming Framework (code: U14465) module in year 3 semester 1.

This is a flashcard web server application, where I have taken the monolithic approach.

The "openapi.yaml" will give a more detailed explanation about the application's features.
## Contents
- [Installation](#installation)
- [Dependacies](#dependacies)
    - [running dependancies](#running-dependancies)
    - [development dependancies](#development-dependancies)
    - [canceled dependancies](#canceled-dependancies)
- [Testing the application](#testing-the-application)
- [Starting the development server](#starting-the-development-server)
- [License](#license)
- [Contributions and contact](#contributions-and-contact)

## Dependacies
### running dependancies
- axios - handles HTTP requests
- ejs - templating engine
- express - building framework for web-based applications
- knex - database framework for SQL query building
- sqlite3 - library for database operations (using the SQLite database management system (DBMS) engine)
- node.js - the JavaScript runtime environment used for running the server application
### development dependancies
- @babel/core - JavaScript transpiler engine
- @babel/preset-env - allows modern JavaScript to be used in outdated dependencies
- babel-jest - integrates babel with the jest framework to allow modern JavaScript to be used in jest applications
- cross-env - allows the setting of environment variables
- jest - testing framework for JavaScript
- nodemon - automatically restarting a Node.js application everytime a JavaScript file change happens
- openapi - a API framework for specifing features of the application in openAPI standard
- supertest - integrates with the jest framework to allow testing of HTTP servers
- swagger-autogen - A generative framework that assists in producing openAPI standard specification of the application
- npm - allows installation of other packages/dependancies and manage them including their versions
### canceled dependancies
Dependancies that the project no longer need.
- passport
- passport-local
- @babel/preset-typescript
- express-session
## Installation
how to get the project's development environment.

```bash
# clone the repository
git clone https://github.com/jh1662/TestVar_Assessment.git

# navigate to project
cd TestVar_Assessment

# install all project's dependencies
npm install
```
## Testing the application
Make sure the application is properly set up.
```bash
# execute all test files and/or the files located in the "__tests__" folder (located in /dev/ )
npm run test

# After all tests are concluded, press Ctrl+c in the terminal and answer its questions to end execution.
```
## Starting the development server
Run the application
```bash
# starts the server; accessable by URL "http://localhost:3000/"
npm run dev

# After all tests are concluded, press Ctrl+c in the terminal and answer its questions to end execution.
```
## License
This application is under the MIT License.
## Contributions and contact
James Haddad - jh1662@canterbury.ac.uk