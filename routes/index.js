var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

//Without authentication, blog blocked
router.get('/', ensureAuthenticated,function(req, res, next) {
	var db = req.db;
	var posts = db.get('posts');
	posts.find({}, {}, function(err, posts){
		res.render('index', { posts: posts });
	});
});

function ensureAuthenticated(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		// if not authenticated, redirect to login page
		// so can't see any page if not logged in
		res.redirect('/users/login');
}

// Go to About me page
router.get('/aboutme', function(req, res){
  res.render('../views/aboutme.jade');
});

// Go to gallery page
router.get('/gallery', function(req, res){
  res.render('../views/gallery.jade');
});

module.exports = router;
