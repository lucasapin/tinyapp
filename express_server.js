const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, emailLookup, urlsForUser} = require("./helpers");
const saltRounds = 10;

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// Database being used in our application
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
  if (!user) {
    res.redirect("/login");
  } else {
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


// handler for the registration form
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Email and password are mandatories!");
    return;
  }
  const {email, password} = req.body;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  const newUser = {email, password: hash};
  if (emailLookup(newUser.email, usersDatabase)) {
    res.status(400).send('Email already exists!');
  } else {
    const id = generateRandomString();
    usersDatabase[id] = {id, email, password: hash};
    req.session["user_id"] = id;
    res.redirect('/urls');
  }
});
// Display the login page
app.get("/login", (req, res) => {
  const user = usersDatabase[req.session["user_id"]];
  const templateVars = { user_id: req.session["user_id"], user};
  res.render("login_form", templateVars);
});

//Handle a POST request to /login -->
app.post("/login", (req, res) =>{
  const user = emailLookup(req.body.email, usersDatabase);
  if (!user) {
    res.status(403).send("User not found!");
  } else {
    const checkPassword = bcrypt.compareSync(req.body.password, user.password);
    if (checkPassword) {
      req.session["user_id"] = user.id;
      res.redirect('/urls');
    } else {
      res.status(403).send("Wrong password");
    }
  }
});

// Create the logout logic
app.post("/logout", (req, res) =>{
  req.session["user_id"] = null;
  res.redirect("/urls");
});

// Handler to create a new short url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});

// Handler to update a the URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const urlToRedirect = req.params.shortURL;
  const user = req.session["user_id"];
  const test = urlsForUser(user, urlDatabase);
  if (test[urlToRedirect]) {
    urlDatabase[urlToRedirect].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("You are not allowed to do that!");
  }
});

// Handler to delete a short URL from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  const user = req.session["user_id"];
  const test = urlsForUser(user, urlDatabase);
  if (test[urlToDelete]) {
    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
  } else {
    res.status(403).send("You are not allowed to do that!");
  }
});

// Handler that redirects to the actual website that we are shorting the URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Handler to display a URL, with its long and short version
app.get("/urls/:shortURL", (req, res) => {
  const user = usersDatabase[req.session["user_id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.session["user_id"], user};
  if (!user) {
    res.render("error_form", templateVars);
  } else {
    res.render("urls_show", templateVars);
  }
});

// Display all the URL's created by the specific user
app.get("/urls", (req, res) => {
  const user = usersDatabase[req.session["user_id"]];
  let userURL = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = { urls: userURL, user_id: req.session["user_id"], email: req.session["email"], user};
  if (!user) {
    res.render("error_form", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

// Home page, redirects to either the urls the user has created, or to the login page if user is not logged in.
app.get("/", (req, res) => {
  const user = req.session["user_id"];
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});