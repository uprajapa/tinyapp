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
    password: "123",
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
  }
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
  // console.log(`req.cookies['user_id']: ${req.cookies['user_id']}, ${req.cookies.user_id}`);
  let templateVars = {};
  /*  templateVars format(Stringify):
      {"userID":{
        "id":"userRandomID",
        "email":"user@example.com",
        "password":"123"
      },
      "shortUrl":[
        "b2xVn2",
        "xlrdbc"
      ],
      "longUrl":[
        "http://www.lighthouselabs.ca",
        "https://www.facebook.com"
      ]
    } */
  if (req.cookies['user_id'] in users) {
    templateVars['userID'] = req.cookies['user_id'];
    for (let url in urlDatabase) {
      if (req.cookies['user_id'] === urlDatabase[url].userID) {
        if (templateVars['shortUrl'] !== undefined) {
          templateVars['shortUrl'].push(url);
        } else {
          templateVars['shortUrl'] = [ url ];
        }
        if (templateVars['longUrl'] !== undefined) {
          templateVars['longUrl'].push(urlDatabase[url].longURL);
        } else {
          templateVars['longUrl'] = [ urlDatabase[url].longURL ];
        }
      }
    }
    templateVars['count'] = templateVars['shortUrl'].length;
    console.log(`templateVars['shortUrl']: ${templateVars['shortUrl'].length}`);
    return res.render('urls_index', templateVars);
  } else {
    return res.redirect('login');
  }
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

app.get("/urls/:shortUrl", (req, res) => {
  const templateVars = {
    shortUrl: req.params.shortUrl
  };
  for (let url in urlDatabase) {
    if (req.cookies['user_id'] === urlDatabase[url].userID) {
      if (url === templateVars.shortUrl) {
        templateVars['userID'] = urlDatabase[url].userID;
        templateVars['longUrl'] = urlDatabase[url].longURL;
        console.log('URL:', templateVars['longUrl']);

      }
    }
  }
  if (req.cookies['user_id'] in users) {
    templateVars['user'] = users[req.cookies['user_id']];
  }
  if (req.params.shortUrl in urlDatabase) {
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
  const shortUrl = generateRandomString();
  console.log('req.body.longUrl', req.body.longUrl);
  urlDatabase[shortUrl] = {
    longURL: req.body.longUrl,
    userID: req.cookies['user_id']
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

app.post("/urls/:shortUrl/update", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const updatedUrl = req.body.updatedUrl;

  if (urlDatabase[shortUrl]) {
    urlDatabase[updatedUrl] = urlDatabase[shortUrl];
    delete urlDatabase[shortUrl];
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