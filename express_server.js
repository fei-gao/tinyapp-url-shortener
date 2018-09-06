const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./index.js');

const PORT = 8080; // default port 8080

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

const users = { 
    "userRandomID": {
      user_id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      user_id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  };

// Read 
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
    let cookie = req.cookies;
    if (!cookie.user_id){
        res.send("Need login or register first");
    } else {
        const userURLs = urlsForUser("user2RandomID");
        console.log("id is:", cookie.user_id, "userURLs:", userURLs);

            let templateVars = { 
                users: users,
                cookie: cookie,
                urls: userURLs,
                urlDatabase: urlDatabase
            };
            console.log(".get(./urls) templateVars is", templateVars);
            res.render("urls_index", templateVars);
            // res.send("index page");
        };
    
});

app.get("/urls/new", (req, res) => {
    let cookie = req.cookies;
    let templateVars = {
        users: users,
        cookie: cookie,
        urls: urlDatabase 
    };
    if(cookie.user_id){
    res.render("urls_new", templateVars);
    } else {
    res.redirect("/login");
    }
});

// POST
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    const cookie = req.cookies;
    const userID = cookie.user_id;
   
    urlDatabase[shortURL] = {
        "userID": userID,
        "longURL": req.body.longURL
    };
    console.log("post a new url urlDatabase:" , urlDatabase); 
    res.redirect("/urls/" + shortURL);
});

// Show
app.get("/urls/:id", (req, res) => {
    let cookie = req.cookies;
    let shortURL = req.params.id;
  
    if(cookie.user_id != urlDatabase[shortURL].userID){
        res.redirect("/urls")
    } else {
        let templateVars = { 
            users: users,
            cookie: cookie,
            shortURL: req.params.id,
            longURL: urlDatabase[shortURL].longURL,
            urls: urlDatabase
        };
        res.render("urls_show", templateVars);
    }
});

// Redirect
app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
    const shortURL = req.params.id;
    if(req.cookies.user_id === urlDatabase[shortURL].userID){
        delete urlDatabase[shortURL];
    }
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
    res.clearCookie('user_id');
    res.redirect("/urls");
});

// Register
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user_id = generateRandomString();
    const userArr = Object.values(users);
    //handle errors
    if(!email || !password){
         res.status(400).send("400 Error: Email or password was not filled.");
    } else {
        const user = userArr.find(function(u){
            return email == u.email;
        }); if (user) {
            res.status(400).send("400 Error: Email already exists. ") 
        }        
        else {
        users[user_id] = {
            "user_id": user_id,
            "email": email,
            "password": password
        };
        res.cookie('user_id', user_id);
        console.log("register new users:", users);
        res.redirect("/urls");
        }
    }
});

// Login
app.get("/login", (req, res) => {
    res.render("login");
});

// Login
app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user_id = generateRandomString();
    const userArr = Object.values(users);
    //handle errors
    if(!email || !password){
         res.status(400).send("400 Error: Email or password was not filled.");
    } else {
        const user = userArr.find(function(u){
            return email == u.email;  });
        if (!user){
            res.status(403).send("403 Error: Email cannot be found");
        } else if(password !== user.password){
            res.status(403).send("403 Error: Password does not match");
        }    
        else {
        res.cookie('user_id', user_id);
        console.log(users);
        res.redirect("/urls");
        }
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function urlsForUser(id){
    let URLs = {};
    for (let key in urlDatabase){
        if(id === urlDatabase[key].userID){
            URLs = {
                "userID": id,
                "shortURL": key,
                "longURL": urlDatabase[key].longURL
            }
        }
    }
    return URLs;
}