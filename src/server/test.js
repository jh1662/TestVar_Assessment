const knex = require('knex');
const config = require('../../knexfile');
const db = knex(config.development);
const rs = require('./dBRestrictions');

datas = {id: 1, username: "6", password: "2", admin: true};

async function test() {
    console.log("--START--");
    //await db("Users").insert({id: datas.id, username: datas.username, password: datas.password, admin: datas.admin});
    console.log("--PART 1--");
    const result = await rs.userId(datas.id);
    console.log(result);
    console.log("--PART 2--");
    db.destroy()
    console.log("--END--");
}

try{ test(); }
catch(err){
    console.log("--ERROR CAUGHT--");
    console.log(err.message);
}
