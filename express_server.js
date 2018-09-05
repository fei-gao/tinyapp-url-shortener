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



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    let templateVars = { 
        username: req.cookies["username"],
        urls: urlDatabase        
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = {
        username: req.cookies["username"]
    };
    res.render("urls_new", templateVars);
});

// POST
// req.body returns {"longURL": https://wwww.google.ca}
// after submiting form, save shortURL and longURL to database
// and redirect user to /urls/<shortURL> page 
app.post("/urls", (req, res) => {
    let random = generateRandomString();
    urlDatabase[random] = req.body.longURL;  
    res.redirect(`/urls/${random}`);
});

// Show
app.get("/urls/:id", (req, res) => {
    let templateVars = { 
        username: req.cookies["username"],
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

// Delete form
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

// Login 
app.post("/login", (req, res) => {
    const username = req.body.username;
    console.log(req.body);
    res.cookie('username', username);
    console.log('Cookies: ', req.cookies);
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});