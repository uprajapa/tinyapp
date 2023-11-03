const generateRandomString = function() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const ifEmptyData = (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send(`Please enter your credentials!`);
  }
};

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (userCookie, urlDatabase) => {
  let templateVars = {};

  for (let url in urlDatabase) {
    if (userCookie === urlDatabase[url].userID) {
      
      // templateVars['userID'] = users[userCookie];
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
  return templateVars;
};
module.exports = { generateRandomString, ifEmptyData, getUserByEmail, urlsForUser };