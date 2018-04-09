var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//connect to schema
var User = require('../models/user');

router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title:'Login'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res){
    // if this function gets called, authentication was successful
    req.flash('success', 'WELCOME TO MY BLOG YOOOOO');
    // redirect to homepage
    res.redirect('/');
  }
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
  console.log(user.id);
});

passport.deserializeUser(function(id, done) {
  User.findUser_id(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy( function(username, password, done){
  User.findUser_username(username, function(err, user){
    if (err) throw err;
    if(!user){
      return done(null, false, {message: 'WHO ARE YOU? Register pls'});
    }

    User.check_passwords_match(password, user.password, function(err, isMatch){
      if(err){
        return done(err);
      }
      if(isMatch){
        return done(null, user);
      }
      else{
        return done(null, false, {message: 'dude you forgot your password... again...'});
      }
    });
  });
}));

router.post('/register', upload.single('profileimage') ,function(req, res, next) {
  console.log(req.body.name);
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  console.log(req.file);

  if(req.file){
    console.log('i got the pic');
    var profileimage = req.file.filename;
  } else{
    console.log('no pic sorry');
    var profileimage = 'noimage.jpg';
  }

  // Form Validator
  req.checkBody('name', 'Fill in the name, please').notEmpty();
  req.checkBody('email', 'Fill in the email, please').notEmpty();
  req.checkBody('email', 'Email does not have an email format!!').isEmail();
  req.checkBody('username', 'Think of an awesome username').notEmpty();
  req.checkBody('password', 'No password?').notEmpty();
  req.checkBody('password2', 'Do not be dumb, passwords do not match').equals(req.body.password);

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
    console.log('Errors');
    res.render('register', {
      errors: errors
    });
  } else{
    console.log('No Errors');
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });

    User.create_user(newUser, function(err, user){
      if(err){
        throw err;
      }
      // display user info in console
      console.log(user);
      console.log(user.name);
      console.log(user.username);
    });

    //display success message
    req.flash('success', 'YASS now go login to view the Blog! Welcomeeee <3');

    // redirect to blog
    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout', function(req, res) {
  req.logout();
  //display message at the top
  req.flash('success', 'K BYEEE, come back soon!');
  console.log("user is logged out");
  //redirect back to login page
  res.redirect('/users/login');

})

module.exports = router;
