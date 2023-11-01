const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = 8080; // default port 8080

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const ifEmptyData = (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    return res.send(`Please enter your credentials! Error# ${res.statusCode}`);
  }
};
// -------------- GET REQ -------------------

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
  const templateVars = {
    urls: urlDatabase
  };
  if (req.cookies['user_id'] in users) {
    templateVars['user'] = users[req.cookies['user_id']];
  }
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  if (req.cookies['user_id'] in users) {
    templateVars['user'] = users[req.cookies['user_id']];
    return res.render('urls_new', templateVars);
  }
  return res.redirect('../login');
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  if (req.cookies['user_id'] in users) {
    templateVars['user'] = users[req.cookies['user_id']];
  }
  if (req.params.id in urlDatabase) {
    return res.render("urls_show", templateVars);
  } else {
    res.statusCode = 404;
    res.send('Error: wrong URL');
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = `/urls/${req.params.id}`;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {};
  // if user is already logged in
  if (req.cookies['user_id'] === undefined) {
    if (req.cookies['user_id'] in users) {
      templateVars['user'] = users[req.cookies['user_id']];
    }
    return res.render('urls_registration', templateVars);
  }
  // else
  return res.redirect('urls');
});

app.get("/login", (req, res) => {
  // if user is already logged in
  if (req.cookies['user_id'] === undefined) {
    const templateVars = { users };
    return res.render('urls_login', templateVars);
  }
  return res.redirect('urls');
});

// -------------- POST REQ -------------------

app.post("/urls", (req, res) => {
  const ID = generateRandomString();

  urlDatabase[ID] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const ID = req.params.id;
  if (urlDatabase[ID]) {
    delete urlDatabase[ID];
  }
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  const ID = req.params.id;
  const updatedUrl = req.body.updatedUrl;

  if (urlDatabase[ID]) {
    urlDatabase[ID] = updatedUrl;
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  ifEmptyData(req, res);

  for (let user in users) {
    if (users[user].email === req.body.email && users[user].password === req.body.password) {
      res.cookie('user_id', user);
      return res.redirect('/urls');
    }
  }

  return res.send(`403: wrong Credentials`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();

  ifEmptyData(req, res);

  for (let user in users) {
    if (users[user].email === req.body.email) {
      res.statusCode = 400;
      return res.send(`User already exists! Error code: ${res.statusCode}`);
    }
  }
  try {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    };
  } catch (error) {
    console.log(`Error regetering new user: ${error}`);
  }
  res.cookie('user_id', randomID);
  
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});