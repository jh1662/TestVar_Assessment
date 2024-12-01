//: imports
const knex = require('knex');
const config = require('./knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
//const usr = require('./src/server/aPIUser.js');

function initializePassport(passport, LocalStrategy) {
    console.log("gonna login (initializePassport)");
    passport.use(new LocalStrategy(
        //* check if user can log in with provided details
        async (username, password, done) => {
            console.log("trying to login (LocalStrategy)");
            let check; let user;
            //^ set-up
            //: check username's existnce
            try { check = await db('Users').where({username: username}).first(); } catch(err) { console.log("failed login - 1"); return done(err); }
            if (!check){ console.log("failed login - 2"); return done(null, false, { message: 'Error with login: incorrect username'+" | Program error code: initializePassport-1"}); }

            //: checks corresponding password's existance
            try { check = await db('Users').where({username: username, password: password}).first(); } catch(err) { console.log("failed login - 3"); return done(err); }
            if (!check){ console.log("failed login - 4"); return done(null, false, { message: 'Error with login: incorrect password'+" | Program error code: initializePassport-2"}); }

            try { check = await db('Users').where({username: username}).select().first(); } catch(err) { console.log("failed login - 5"); return done(err); }
            //^ get user details
            return done(null, user);
            //^ Success.
            //^ 'null' means no error
        }
    ));
    passport.serializeUser( async (username, done) => {
        console.log("serializeUser");
        let id;
        try { id = await db('Users').where({username: username}).select('id').first(); } catch(err) { return done(err); }
        done(null, id);
    });
    passport.deserializeUser(async (id, done) => {
        console.log("deserializeUser");
        let user;
        try { user = await db('Users').where({id: id}).select().first(); } catch(err) { return done(err); }
        done(null, user);
    });
}

module.exports = { initializePassport };
