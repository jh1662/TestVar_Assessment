const local = {
    //* for use only be functions in the 'commons' namespace
    readToken: function(){
        if (document.cookie == undefined){ return -1; }
        //^ no or empty cookies?
        const token = document.cookie.split('; ').find(row => row.startsWith("token=")).split('=')[1];
        if (!token) { return -1; }
        //^ no id found?.
        //^ existing id start from '1' so no need to worry about '0' being 'false'.
        if (token<1) { return -1; }
        //^ invalid ID
        return token;
        //^ id found (success)
    },
    storeCookie: function(name, value){
        //* stores a cookie value with semi-infinite expire date
        const expireTime = new Date();
        expireTime.setTime(expireTime.getTime() + 31536000000000);
        //^ to expire 1000 years from now (current date plus 1000 years worth of microseconds)
        const expires = "expires=" + expireTime.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
}

const commons = {
    //^ namespace to allow function to be called with script name to prevent confustion between different front-end scripts
    //* for use by other scripts
    test: function (){
        //* check if script is imported successfully (dev only)
        console.log("commonJS link/import is working");
    },
    storeToken: function(id){
        local.storeCookie("token", id);
        console.log("token stored in cookies");
        console.log(local.readToken());
    },
    getUserId: async function(){
        //* check if user is logged in.
        //* retruns boolean result
        let response; let status;
        //^ set-up

        //: see if user has token in cookes
        const token = await local.readToken();
        //console.log("testing");
        if(token == -1){ this.messagePage("account error", "client-side", "user has not login yet"); return -1; }

        console.log("token before send for ID: "+token);
        response = await fetch( '/user/check',{
            //* request for user matched to token
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({token: token})
        });
        status = response.status;
        response = await response.json();

        //console.log("TESTING");

        if(status != 201){ this.messagePage("Error with login session", status, response.message); return -1; }
        if(status == 201){ return responce.userId; }
    },
    messagePage: async function(title, status, message){
        //* invalid login
        data = { title: title, subTitle: status, message: message };
        response = await fetch( '/message',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
            });
        document.body.innerHTML = await response.text();
        return;
    },
    loginCheck: async function(){
        const token = await local.readToken();
        if(token == -1){ this.messagePage("account error", "client-side", "user has not login yet"); return -1; }

        const response = await fetch( '/user/check',{
            //* request for user matched to token
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({token: token})
        });
        const status = response.status;

        if (status == 201){ console.log("User is logged in right now"); return true; }

        console.log("User isn't logged in right now");
        return false;
    }
};

        /*
        const id = document.cookie.match(new RegExp('(^| )' + "id" + '=([^;]+'));
        //^ Taken from https://stackoverflow.com/questions/62590579/regex-for-cookie-matching .
        //^ Because of the complex cookie data structure, I have to use 'regex' too keep the code as simple as possible!!!
        */