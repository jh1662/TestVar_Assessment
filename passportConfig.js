//: imports
const knex = require('knex');
const config = require('./knexfile');
const db = knex(config.development);
//^ setting up another DB connection as a single connection in multi JS file disrups the connection with a runtime error
//const usr = require('./src/server/aPIUser.js');

function initializePassport(passport, LocalStrategy) {
    passport.use(new LocalStrategy(
        //* check if user can log in with provided details
        async (username, password, done) => {
            let check; let user;
            //^ set-up
            //: check username's existnce
            try { check = db('Users').where({username: username}).first(); } catch(err) { return done(err); }
            if (!check){ return done(null, false, { message: 'Error with login: incorrect username'+" | Program error code: initializePassport-1"}); }

            //: checks corresponding password's existance
            try { check = db('Users').where({username: username, password: password}).first(); } catch(err) { return done(err); }
            if (!check){ return done(null, false, { message: 'Error with login: incorrect password'+" | Program error code: initializePassport-2"}); }

            try { check = db('Users').where({username: username}).select().first(); } catch(err) { return done(err); }
            //^ get user details
            return done(null, user);
            //^ Success.
            //^ 'null' means no error
        }
    ));
    passport.serializeUser((username, done) => {
        let id;
        try { id = db('Users').where({username: username}).select('id').first(); } catch(err) { return done(err); }
        done(null, id);
    });
    passport.deserializeUser(async (id, done) => {
        let user;
        try { user = db('Users').where({id: id}).select().first(); } catch(err) { return done(err); }
        done(null, user);
    });
}

module.exports = { initializePassport };
