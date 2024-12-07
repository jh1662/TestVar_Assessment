const knex = require('knex');
const config = require('../../knexfile');

const env = require('./env')
//^ determine node environment

const db = knex(config[env.env()]);
const rs = require('./dBIsUniqueRecord');

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

function time() {
    //* 'new Date(dateAsString)' converts string version back to original data-type
    return (new Date()).toISOString();
    /*
    getFullYear(): same as human year.

    getMonth(): 0-11

    getDate(): 1-31

    getHours(): 0-23

    getMinutes(): 0-59

    getSeconds(): 0-59
    */
}


try{
    console.log(time());
}
catch(err){
    console.log("--ERROR CAUGHT--");
    console.log(err.message);
}
