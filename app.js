require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/daxyuserDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


app.get("/", (req, res) => {
    res.render("login");
});

app.get("/addUser", (req, res) => {
    if (req.isAuthenticated()){
        res.render("addUser");
    } else {
        res.redirect("/");
    }
});

app.get("/changePass", (req, res) => {
    if (req.isAuthenticated()){
        res.render("changePass");
    } else {
        res.redirect("/");
    }
});

// GET data
app.get("/new", (req,res) => {
     if (req.isAuthenticated()){
        res.render("new");
     } else {
         res.redirect("/");
     }
});

// POST data
app.post("/new", (req,res) => {
    var date = new Date(req.body.date);
    var dateArr = date.toDateString().split(' ');
    var dateFormat = dateArr[2] + ' ' + dateArr[1] + ' ' + dateArr[3];
        if (req.isAuthenticated()){
            res.render("offer_letter",{
              name: req.body.name,
              date: dateFormat,
              address1 : req.body.address1,
              address2 : req.body.address2,
              address3 : req.body.address3,
              address4 : req.body.address4,
              type: req.body.type,
              designation: req.body.designation,
              income: req.body.income,
              ctc: req.body.ctc,
            });
        } else {
            res.redirect("/");
        }
});

 app.get("/signOut", (req, res) => {
    req.logout();
    res.redirect("/");
 });

app.get("/changePass", (req, res) => {
    if (req.isAuthenticated()){
        res.render("changePass");
    } else {
        res.redirect("/");
    }
});

app.post("/", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
    passport.authenticate("local")(req, res, function(){
        res.redirect("/new");
      });
    }
  });
});

app.post("/addUser", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/addUser");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/new");
      });
    }
  });
 });

app.post("/changePass", (req, res) => {
    const username = req.body.username;
    const Npassword = req.body.Npassword;
    const Cpassword = req.body.Cpassword;

    User.findOne({username: username}, (err, foundUser) => {
        if(err) {
            console.log(err);
        } else {
            if(foundUser) {
                if(Npassword == Cpassword) {
                    User.findOneAndDelete(username , function (err, docs) { 
                        if (err){ 
                            console.log(err) 
                        } 
                        else{ 
                            User.register({username: req.body.username}, req.body.Cpassword, function(err, user){
                                if (err) {
                                    console.log(err);
                                } else {
                                    passport.authenticate("local")(req, res, function(){
                                      res.redirect("/");
                                });
                                }
                            });                            
                        } 
                    }); 
                }
            }
        }
    });

});

app.listen(3000, (req,res) => {
  console.log("Server started on port 3000");
});