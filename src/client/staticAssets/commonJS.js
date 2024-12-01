const local = {
    //* for use only be functions in the 'commons' namespace
    storeCookie: function(name, value){
        //* stores a cookie value with semi-infinite expire date
        const expireTime = new Date();
        date.setTime(date.getTime() + 31536000000000);
        //^ to expire 1000 years from now (current date plus 1000 years worth of microseconds)
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    },
    noLogin: function(){

    }
}

const commons = {
    //^ namespace to allow function to be called with script name to prevent confustion between different front-end scripts
    //* for use by other scripts
    test: function (){
        //* check if script is imported successfully (dev only)
        console.log("commonJS link/import is working");
    },
    storeId: function(id){
        storeCookie("id", id);
    },
    getId: function(){
        const id = document.cookie.match(new RegExp('(^| )' + "id" + '=([^;]+'));
        //^ Taken from https://stackoverflow.com/questions/62590579/regex-for-cookie-matching .
        //^ Because of the complex cookie data structure, I have to use 'regex' too keep the code as simple as possible!!!
        if (!id) { return -1; }
        //^ no id found?.
        //^ existing id start from '1' so no need to worry about '0' being 'false'.
        if (id<1) { return -1; }
        //^ invalid ID
        return id;
        //^ id found (success)
    },
    loginCheck: async function(){
        //* check if user is logged in
        if(id == -1){ local.noLogin; return }
        //! call check userID
    }
};

