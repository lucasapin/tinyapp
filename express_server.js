//Create a Function that generates a random 6-char long string
const generateRandomString = function() {
  let string = Math.random().toString(36).substring(2,8);
  return string;
};

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const PORT = 8080; // default port 8080


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const usersDatabase = {
  "b2xVn2": {
    id: "b2xVn2",
    email: "user@example.com",
    password: "test"
  },
  "9sm5xK": {
    id: "9sm5xK",
    email: "user2@example.com",
    password: "test2"
  }
};

//Get request to see the create new tinyURL page
app.get("/urls/new", (req, res) => {
  const user = usersDatabase[req.session["user_id"]];
  const templateVars = {
    user_id: req.session["user_id"], user};
    if(!user) {
      res.redirect("/login");
    } 
    else {
    res.render("urls_new", templateVars);
  }
});

//render the register page with the form
app.get("/register", (req, res) => {
  const user = usersDatabase[req.session["user_id"]];
  const templateVars = {
    user_id: req.session["user_id"], user};
  res.render("user_registration", templateVars);
});
//helper function to validate the user
const emailLookup = (user, userDatabase) => {
  const {email} = user;
  for (const key in userDatabase) {
    if (email === userDatabase[key].email) {
      return userDatabase[key];
    }
  }
  return false;
};

const urlsForUser = function(id) {
  const filteredURL = {};
  for(let url in urlDatabase) {
    if(urlDatabase[url].userID === id ){
      filteredURL[url] = urlDatabase[url]
    }     
  } return filteredURL
  }


// handler for the registration form
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Email and password are mandatories!")
    return
  }
  const {email, password} = req.body;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  console.log("hash --->", hash)
  const newUser = {email, password: hash};
  if (emailLookup(newUser, usersDatabase)) {
    res.status(400).send('Email already exists!');
  } else {
    const id = generateRandomString();
    usersDatabase[id] = {id, email, password: hash};
    req.session["user_id"] = id;
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  const user = usersDatabase[req.session["user_id"]];
  const templateVars = { user_id: req.session["user_id"], user};
  res.render("login_form", templateVars);
});

//Handle a POST request to /login -->
app.post("/login", (req, res) =>{
  const user = emailLookup(req.body, usersDatabase);
  if (!user) {
    res.status(403).send("User not found!");
  } else {
    const checkPassword = bcrypt.compareSync(req.body.password, user.password)
    if (checkPassword) {
      req.session["user_id"] = user.id
      res.redirect('/urls');
    } else {
      res.status(403).send("Wrong password");
    }
  }
});

// create the logout logic
app.post("/logout", (req, res) =>{
  req.session["user_id"] = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const urlToRedirect = req.params.shortURL;
  const user = req.session["user_id"];
  const test = urlsForUser(user);
  if(test[urlToRedirect]){
  urlDatabase[urlToRedirect].longURL = req.body.longURL;
  res.redirect("/urls");
  } else {
    res.status(403).send("You are not allowed to do that!")
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  const user = req.session["user_id"];
  const test = urlsForUser(user);
  if(test[urlToDelete]){
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
  } else {
    res.status(403).send("You are not allowed to do that!")
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = usersDatabase[req.session["user_id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.session["user_id"], user};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = usersDatabase[req.session["user_id"]];
  let userURL = urlsForUser(req.session["user_id"]);
  const templateVars = { urls: userURL, user_id: req.session["user_id"], email: req.session["email"], user};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  const user = req.session["user_id"]
  if(user){
  res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});