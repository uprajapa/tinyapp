const express = require("express");
let ejs = require('ejs');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const PORT = 8080; // default port 8080



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

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = `/urls/${req.params.id}`;
  res.redirect(longURL);
});

// -------------- POST REQ -------------------

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  
  const generateRandomString = function(length, chars) {
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  };
  const ID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyz');

  urlDatabase[ID] = req.body.longURL;
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  const ID = req.params.id;
  if (urlDatabase[ID]) {
    delete urlDatabase[ID];
  }
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  console.log(`Params: ${req.params.id}, ${req.body.updatedUrl}`);
  const ID = req.params.id;
  const updatedUrl = req.body.updatedUrl;

  if (urlDatabase[ID]) {
    urlDatabase[ID] = updatedUrl;
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  console.log(req.body.username);
  res
    .cookie('username', req.body.username);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});