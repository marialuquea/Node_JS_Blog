var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

/* GET home page.
router.get('/', function(req, res, next) {
	var db = req.db;
	var posts = db.get('posts');
	posts.find({}, {}, function(err, posts){
		res.render('index', { posts: posts });
	});
});
*/


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




module.exports = router;
