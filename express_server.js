function generateRandomString() {
  let string = Math.random().toString(36).substring(7);
  return string;
  };

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);  
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars)
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
res.render("urls_index", templateVars)
});

app.get("/", (req, res) => {
  res.send("Hello!");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});