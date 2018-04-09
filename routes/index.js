var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

//Without authentication user can't access Blog
router.get('/', userloggedin,function(req, res, next) {
	var db = req.db;
	var posts = db.get('posts');
	posts.find({}, {}, function(err, posts){
		res.render('index', { posts: posts });
	});
});

function userloggedin(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		// if not authenticated, redirect to login page
		// so can't see blog if not logged in
		res.redirect('/users/login');
}

// Go to About me page
router.get('/aboutme', function(req, res){
  res.render('../views/aboutme.jade');
});

// Go to gallery page (work with me page)
router.get('/gallery', function(req, res){
  res.render('../views/gallery.jade');
});

router.get('/show/:category', function(req, res, next) {
	var posts = db.get('posts');

	posts.find({category: req.params.category},{},function(err, posts){
		res.render('index',{
  			'title': req.params.category,
  			'posts': posts
  		});
	});
});

// Add category
router.get('/add', function(req, res, next) {
	res.render('addcategory',{
  		'title': 'Add Category'
	});
});

router.post('/index/add', function(req, res, next) {

  var name = req.body.name;
	req.checkBody('name','Type the name!!').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('addpost',{
			"errors": errors
		});
	} else {
		var categories = db.get('categories');
		categories.insert({
			"name": name,
		}, function(err, post){
			if(err){
				res.send(err);
			} else {
				req.flash('success','And another cool category wass added yass');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

module.exports = router;
