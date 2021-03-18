//Create a Function that generates a random 6-char long string
const generateRandomString = function() {
  let string = Math.random().toString(36).substring(2,8);
  return string;
};

const emailLookup = (user, userDatabase) => {
  const {email} = user;
  for (const key in userDatabase) {
    if (email === userDatabase[key].email) {
      return userDatabase[key];
    }
  }
  return false;
};

const urlsForUser = function(id, urlDatabase) {
  const filteredURL = {};
  for(let url in urlDatabase) {
    if(urlDatabase[url].userID === id ){
      filteredURL[url] = urlDatabase[url]
    }     
  } return filteredURL
  }


  module.exports = { generateRandomString, emailLookup, urlsForUser }