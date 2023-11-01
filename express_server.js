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
    password: "purple-monkey-dinosaur",
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

// -------------- GET REQ -------------------

app.get("/", (req, res) => {
  // console.log(`Signed cookies: ${req.signedCookies}`);
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
  let temp = JSON.stringify(templateVars);
  console.log(`Logged in user email id: ${temp}`);
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
  };
  if (req.cookies['username']) {
    templateVars['username'] = req.cookies['username'];
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  if (req.cookies['username']) {
    templateVars['username'] = req.cookies['username'];
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = `/urls/${req.params.id}`;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  if (req.cookies['user_id']) {
    templateVars['username'] = req.cookies['user_id'];
  }
  res.render('urls_registration', templateVars);
});

// -------------- POST REQ -------------------

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  
  const ID = generateRandomString();

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
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  if (!users[randomID]) {
    try {
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: req.body.password
      };
    } catch (error) {
      console.log(`Error: ${error}`);
    }
    console.log(`New User: \nID:${users[randomID].id}\nEmail:${users[randomID].email}`);
    res.cookie('user_id', randomID);
  } else {
    res.send('User already exists!');
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});