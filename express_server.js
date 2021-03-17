//Create a Function that generates a random 6-char long string
function generateRandomString() {
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

//Get request to see the create new tinyURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], user_id: req.cookies["user_id"]}
  res.render("urls_new", templateVars);
});

//render the register page with the form
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], user_id: req.cookies["user_id"]}
  res.render("user_registration", templateVars)
});

// handler for the registration form
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  usersDatabase[id] = {id, email, password}
  res.cookie("user_id", id);
  res.redirect("/urls")
});

//Handle a POST request to /login -->
app.post("/login", (req, res) =>{
  const username = req.body.username
  res.cookie("username", username);
  res.redirect("/urls");
})
// create the logout logic
app.post("/logout", (req, res) =>{
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);  
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const urlToRedirect = req.params.shortURL;
  urlDatabase[urlToRedirect] = req.body.longURL; 
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], user_id: req.cookies["user_id"]};
  res.render("urls_show", templateVars)
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], user_id: req.cookies["user_id"], email: req.cookies["email"]};
res.render("urls_index", templateVars)
});

app.get("/", (req, res) => {
  res.send("Hello!");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});