const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const PORT = 8080;

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse-labs'],
  maxAge: 24 * 60 * 60 * 1000,
}));

const urlDatabase = {
  "b2xVn2": {
    "userID": "userRandomID",
    "longURL": "http://www.lighthouselabs.ca"
 },
  "9sm5xK": {
    "userID": "user2RandomID",
    "longURL": "http://www.google.com"
 }
};

let users = {
 "userRandomID": {
    user_id: "userRandomID",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync('1', 10)
  },
 "user2RandomID": {
    user_id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync('2', 10)
 }
};

// Helper functions
function generateRandomString(){
    return  Math.random().toString(20).substring(2, 8);
}

function urlsForUser(id) {
  let URLs = {};
  for (let key in urlDatabase){
    // Object.keys(urlDatabase).forEach((key) => {
         if (id === urlDatabase[key].userID) {
          URLs[key] = {
            "userID": id,
            "longURL": urlDatabase[key].longURL
          }
        }
    }
    return URLs;
}

function checkLogInStatus(email, password, users){
    if (!email || !password) {
        return { logInStatus: "400 Error: Email or password was not filled."}
    } else {
        const userArr = Object.values(users);
        const user = userArr.find(function (u) {
            return email == u.email;
        });
        if (!user) {
            return {logInStatus: "403 Error: Email cannot be found"}
        } else if (!bcrypt.compareSync(password, user.hashedPassword)) {
            return {logInStatus: "403 Error: Password does not match"}
        } else {
            return {logInStatus: "Login successfully"}
        }
    }
}   

function findUser(users, email){
    const userArr = Object.values(users);
    const user = userArr.find(function (u) {
      return email == u.email;
    });
    return user;
}


// Read 
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
    let cookie = req.session;
    if (!cookie.user_id) {
        let templateVars = {
            users: users,
            cookie: cookie,
            urls: '',
            urlDatabase: urlDatabase
        };
        res.render("urls_index", templateVars);
    } else {
        let userURLs = urlsForUser(cookie.user_id);
        console.log("****id", cookie.user_id);
        console.log("=====userURLs", userURLs);
        let templateVars = {
            users: users,
            cookie: cookie,
            urls: userURLs,
            urlDatabase: urlDatabase
        };
        console.log("________", templateVars.urlDatabase);
        console.log("----------", templateVars.urls);
        console.log("templateVar: ", templateVars);
        res.render("urls_index", templateVars);
    };

});

app.get("/urls/new", (req, res) => {
    let cookie = req.session;
    let userURLs = {
        "userID": cookie.user_id
    }
    let templateVars = {
        users: users,
        cookie: cookie,
        urls: userURLs
    };
    if (cookie.user_id) {
        res.render("urls_new", templateVars);
    } else {
        res.redirect("/login");
    }
});

// POST
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    const cookie = req.session;
    const userID = cookie.user_id;
    if (!cookie){
    urlDatabase[shortURL] = {
        "userID": userID,
        "longURL": req.body.longURL
    };
    res.redirect("/urls/" + shortURL);
    } else {
        res.redirect("/urls");
    }
});

// Show
app.get("/urls/:id", (req, res) => {
    let cookie = req.session;
    let shortURL = req.params.id;

    if (!cookie.user_id) {
        res.render("logInError");
    }
    else if (cookie.user_id !== urlDatabase[shortURL].userID) {
        res.render("notMatchError");
    }
    else if (!urlDatabase.hasOwnProperty(shortURL)){
        res.render("urlNotExist");
    } else{
        let userURLs = {
            "userID": cookie.user_id
        }
        let templateVars = {
            users: users,
            cookie: cookie,
            shortURL: req.params.id,
            longURL: urlDatabase[shortURL].longURL,
        };
        res.render("urls_show", templateVars);
    }
});

// Redirect
app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    if (urlDatabase.hasOwnProperty(shortURL)) {
        let longURL = urlDatabase[shortURL].longURL;
        res.redirect(longURL);
    } else {
        res.render("urlNotExist");
    }
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
    const shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
});

// Update 
app.post("/urls/:id", (req, res) => {
    const shortURL = req.params.id;
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

// Register
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user_id = generateRandomString();
    const userArr = Object.values(users);
    //handle errors
    if (!email || !password) {
        res.status(400).send("400 Error: Email or password was not filled.");
    } else {
        const user = userArr.find(function (u) {
            return email == u.email;
        }); if (user) {
            res.status(400).send("400 Error: Email already exists. ")
        }
        else {
            users[user_id] = {
                "user_id": user_id,
                "email": email,
                "hashedPassword": hashedPassword
            };
            req.session.user_id = user_id;
            res.redirect("/urls");
        }
    }
});

// Login
app.get("/login", (req, res) => {
    if (req.session.user_id) {
        res.redirect('/urls');
    } else {
        res.render('login');
    }
});

// Login
app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    let status = checkLogInStatus(email, password, users);
    if(status.logInStatus !== "Login successfully"){
        let templateVars = {
            status: status
        };
        res.render("logInError", templateVars);
    } else {
        const user = findUser(users, email);
        req.session.user_id = user.user_id;
        res.redirect("/urls");
    }
            
});

// Start the server
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});