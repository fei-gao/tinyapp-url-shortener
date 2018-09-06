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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
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
    let templateVars = { 
        users: users,
        cookie: cookie,
        urls: urlDatabase       
    };
    console.log("cookie is", cookie, "templateVars is", templateVars);
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let cookie = req.cookies;
    let templateVars = {
        users: users,
        cookie: cookie
    };
    res.render("urls_new", templateVars);
});

// POST
app.post("/urls", (req, res) => {
    let random = generateRandomString();
    urlDatabase[random] = req.body.longURL;  
    res.redirect("/urls/" + random);
});

// Show
app.get("/urls/:id", (req, res) => {
    let cookie = req.cookies;
    let templateVars = { 
        users: users,
        cookie: cookie,
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id]
    };
    res.render("urls_show", templateVars);
});

// Redirect
app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL];
    res.redirect(longURL);
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
    urlDatabase[shortURL] = longURL;
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
    } else if (
        userArr.find(function(user){
            return email == user.email
    })){
        res.status(400).send("400 Error: Email already exists. ") 
    }
    else {
    users[user_id] = {
        "user_id": user_id,
        "email": email,
        "password": password
    };
    res.cookie('user_id', user_id);
    console.log(users);
    res.redirect("/urls");
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
        let item = userArr.find(function(user){
            return email == user.email;  });
        if (!item){
            res.status(403).send("403 Error: Email cannot be found");
        } else if(password !== item.password){
            res.status(403).send("403 Error: Password does not match");
        }    
        else {
        users[user_id] = {
            "user_id": user_id
        };
        res.cookie('user_id', user_id);
        console.log(users);
        res.redirect("/");
        }
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});