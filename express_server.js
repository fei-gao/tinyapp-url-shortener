const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
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

app.post("/urls", (req, res) => {
    let random = generateRandomString();
    console.log(random, req.body);
    urlDatabase[`${random}`] = req.body['longURL'];  // debug statement to see POST parameters
    console.log(urlDatabase);
    res.redirect(`/urls/${random}`);

});

app.get("/u/:shortURL", (req, res) => {
    let urlKey = req.params.shortURL;
    let longURL = urlDatabase[urlKey];
     console.log("longURL is", longURL);
    res.redirect(`${longURL}`);
  });

app.get("/urls/:id", (req, res) => {
    let templateVars = { 
        shortURL: req.params.id,
        urls: urlDatabase,
        longURL: urlDatabase[req.params.id] + req.params.id
    };
    res.render("urls_show", templateVars);
});
  
app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(){
    return  Math.random().toString(36).substring(2, 8);
}