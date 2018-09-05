const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const generateRandomString = require('./index.js');

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

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
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

// req.body returns {"longURL": https://wwww.google.ca}
// after submiting form, save shortURL and longURL to database
// and redirect user to /urls/<shortURL> page 
app.post("/urls", (req, res) => {
    let random = generateRandomString();
    urlDatabase[random] = req.body["longURL"];  
    res.redirect(`/urls/${random}`);
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { 
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id]
    };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    let urlKey = req.params.shortURL;
    let longURL = urlDatabase[urlKey];
    res.redirect(longURL);
});

//Delete form
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

//Update longURL
app.post("/urls/:id", (req, res) => {
    const shortURL = req.params.id;
    urlDatabase[shortURL] = req.body["longURL"];
    res.redirect("/urls");
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});