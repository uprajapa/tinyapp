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

module.exports = { generateRandomString, ifEmptyData, getUserByEmail };