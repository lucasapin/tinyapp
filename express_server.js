//Create a Function that generates a random 6-char long string
const generateRandomString = function() {
  let string = Math.random().toString(36).substring(2,8);
  return string;
};

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
  const user = usersDatabase[req.cookies["user_id"]];
  const templateVars = {
    user_id: req.cookies["user_id"], user};
    if(!user) {
      res.redirect("/login");
    } 
    else {
    res.render("urls_new", templateVars);
  }
});

//render the register page with the form
app.get("/register", (req, res) => {
  const user = usersDatabase[req.cookies["user_id"]];
  const templateVars = {
    user_id: req.cookies["user_id"], user};
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

// handler for the registration form
app.post("/register", (req, res) => {
  const newUser = {email, password} = req.body;

  if (emailLookup(newUser, usersDatabase)) {
    res.status(400).send('Email already exists!');
  } else {
    const id = generateRandomString();
    usersDatabase[id] = {id, email, password};
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  const user = usersDatabase[req.cookies["user_id"]];
  const templateVars = { user_id: req.cookies["user_id"], user};
  res.render("login_form", templateVars);
});

//Handle a POST request to /login -->
app.post("/login", (req, res) =>{
  const user = emailLookup(req.body, usersDatabase);
  if (!user) {
    res.status(403).send("User not found!");
  } else {
    if (user.password === req.body.password) {
      res.cookie("user_id", user.id).redirect('/urls');
    } else {
      res.status(403).send("Wrong password");
    }
  }
});

// create the logout logic
app.post("/logout", (req, res) =>{
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const urlToRedirect = req.params.shortURL;
  urlDatabase[urlToRedirect].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = usersDatabase[req.cookies["user_id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.cookies["user_id"], user};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = usersDatabase[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"], email: req.cookies["email"], user};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});