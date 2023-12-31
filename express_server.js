const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, ifEmptyData, getUserByEmail, urlsForUser } = require('./helpers');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const PORT = 8080; // default port 8080

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$lemzVzgCN4.tZyuK6VVBw.DUq9eoylQzIthbHRzk85Q0fZbfDWz9W",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$lemzVzgCN4.tZyuK6VVBw.DUq9eoylQzIthbHRzk85Q0fZbfDWz9W",
  },
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
  // "mh2li9": {
  //   longURL: "facebook.com",
  //   userId: "urvish[praja[ti@icloud.com"
  // }
};



// -------------- GET REQ -------------------


app.get("/", (req, res) => {
  return req.session.user_ID ? res.redirect('/urls') : res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userCookie = req.session.user_id;
  let templateVars = urlsForUser(userCookie, urlDatabase);

  if (!users[userCookie]) {
    return res.status(400).send(`Please log in to access this page!`);
  }
  templateVars.userID = users[userCookie];

  if (templateVars['shortUrl']) {
    templateVars['count'] = templateVars['shortUrl'].length;
  } else {
    templateVars['count'] = 0;
  }

  return res.render('urls_index', templateVars);
  
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  if (req.session.user_id in users) {
    templateVars['userID'] = users[req.session.user_id];
    return res.render('urls_new', templateVars);
  }
  return res.redirect('../login');
});

app.get("/urls/:shortUrl", (req, res) => {
  const userCookie = req.session.user_id;
  
  if (!users[userCookie]) {
    return res.status(400).send(`Please log in to access this page!`);
  }

  const shortUrl = req.params.shortUrl;
  const templateVars = {
    shortUrl
  };

  if (urlDatabase[shortUrl]) {
    if (userCookie === urlDatabase[shortUrl].userID) {
      templateVars['userID'] = users[userCookie];
      templateVars['longUrl'] = urlDatabase[shortUrl].longURL;
      return res.render("urls_show", templateVars);
    }
    return res.status(400).send('Error: Authorization error');
  }
  return res.status(400).send('Error: wrong URL');

});

app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id].longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {};
  
  if (req.session.user_id === undefined) {
    if (req.session.user_id in users) {
      templateVars['user'] = users[req.session.user_id];
    }
    return res.render('urls_registration', templateVars);
  }
  
  return res.redirect('urls');
});

app.get("/login", (req, res) => {
  
  const templateVars = { users };
  if (req.session.user_id === undefined) {
    return res.render('urls_login', templateVars);
  }
  return res.redirect('urls');
});


// -------------- POST REQ -------------------


app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  
  urlDatabase[shortUrl] = {
    longURL: req.body.longUrl,
    userID: req.session.user_id
  };
  res.redirect('/urls');
});

app.post("/urls/:shortUrl/delete", (req, res) => {
  const shortUrl = req.params.shortUrl;
  if (urlDatabase[shortUrl]) {
    delete urlDatabase[shortUrl];
    return res.redirect('/urls');
  }
});

app.post("/urls/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const updatedUrl = req.body.updatedUrl;

  if (urlDatabase[shortUrl]) {
    urlDatabase[shortUrl].longURL = updatedUrl;
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  ifEmptyData(req, res);

  for (let user in users) {

    if (users[user].email === req.body.email &&  bcrypt.compareSync(req.body.password, users[user].password)) {
      // eslint-disable-next-line camelcase
      req.session.user_id = user;
      return res.redirect('/urls');
    }
  }

  return res.status(403).send(`403: wrong Credentials`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();

  ifEmptyData(req, res);

  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send(`User already exists!`);
  }

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: hashedPassword
  };
  
  // eslint-disable-next-line camelcase
  req.session.user_id = randomID;
  
  res.redirect('/urls/new');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

// ----- Methods that cannot be accessed from browsers -------

app.post("urls/:id", (req, res) => {
  if (!req.params.id) {
    return res.status(400).send('Please provide valid ID!');
  }
  if (!req.session.user_id) {
    return res.status(400).send('Please login first!');
  }
});

app.post("urls/:id/delete", (req, res) => {
  if (!req.params.id) {
    return res.status(400).send('Please provide valid ID!');
  }
  if (!req.session.user_id) {
    return res.status(400).send('Please login first!');
  }
});
