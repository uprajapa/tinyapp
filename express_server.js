const express = require("express");
let ejs = require('ejs');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const PORT = 8080; // default port 8080

let generateRandomString = function() {};

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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.get("/u/:id", (req, res) => {
  const longURL = 'urls/id';
  res.redirect(longURL);
});

// -------------- POST REQ -------------------

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  urlDatabase['id'] = req.body.longURL;
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});