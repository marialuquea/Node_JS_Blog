var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/images' })
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:id', function(req, res, next) {
	var posts = db.get('posts');

	posts.findById(req.params.id,function(err, post){
		res.render('show',{
  			'post': post
  		});
	});
});

//--------------ADD POST--------------------
router.get('/add', function(req, res, next) {
	var categories = db.get('categories');

	categories.find({},{},function(err, categories){
		res.render('addpost',{
  			'title': 'Add Post',
  			'categories': categories
  		});
	});
});


router.post('/add', upload.single('mainimage'), function(req, res, next) {
  // Get Form Values
  var title = req.body.title;
  var category= req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  // Check Image Upload
  if(req.file){
  	var mainimage = req.file.filename
  } else {
  	var mainimage = 'noimage.jpg';
  }

  	// Form Validation
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
		res.render('addpost',{
			"errors": errors
		});
	} else {
		var posts = db.get('posts');
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"mainimage": mainimage
		}, function(err, post){
			if(err){
				res.send(err);
			} else {
				req.flash('success','Post Added');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

//---------------------EDIT POST---------------------
router.get('/editpost/:id', function(req, res, next){
	var posts = db.get('posts');
	var categories = db.get('categories');

	categories.find({}, {}, function(err, categories){

		posts.find({'_id': db.id(req.params.id)}, {}, function(err, posts){

			req.app.locals.mainimage = posts[0].mainimage;
			req.app.locals.postid = req.params.id;
			res.render('edit', {
				posts: posts,
				categories: categories
			});
		});
	});
});

router.post('/editpost', upload.single('mainimage'), function(req, res, next){

	var title = req.body.title;
	var body = req.body.body;
	var category = req.body.category;
  var postid = req.app.locals.postid;

	// Check Image Upload
	if(req.file){
		var mainimage = req.file.filename
	} else {
		var mainimage = 'noimage.jpg';
	}

  	// Form Validation
	req.checkBody('category','Name field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();
	req.checkBody('title', 'Title field is required').notEmpty();

  // Check erros
	var errors = req.validationErrors();

	if(errors){

		var posts = db.get('posts');
		var categories = db.get('categories');
		categories.findById({}, {}, function(err, categories){
			posts.findById({'_id': db.id(req.app.locals.postid)}, {}, function(err, posts){

				res.render('editpost', {

					'posts' : posts,
					'categories' : categories
				});
			});
		});
	} else{

		var mainimage;
		var posts = db.get('posts');

		if(req.file){
			mainimage = req.file.filename;
		} else{
			mainimage = req.app.locals.mainimage;
		}

		posts.update({
			'_id' : postid
		}, {
			$set: {
				'title': title,
				'body': body,
				'category': category,
				'mainimage': mainimage
			}
		}, function(err, doc){

			req.app.locals.postid = '';
			req.app.locals.mainimage = '';
			req.flash('success', 'Post Edited');
			res.location('/posts/show/'+postid);
			res.redirect('/posts/show/'+postid);
		});
	}
});


//------------------DELETE POST----------------------
router.get('/deletepost/:id', function(req, res, next){
	var  posts = db.get('posts');
	//remove post from post collection
	posts.remove({_id: db.id(req.params.id)});
	// Redirect to blog
	res.location('/');
	res.redirect('/');
});



//---------------------ADD COMMENT-------------------
router.post('/addcomment', function(req, res, next) {
  // Get Form Values
  var name = req.body.name;
  var email= req.body.email;
  var body = req.body.body;
  var postid= req.body.postid;
  var commentdate = new Date();

  	// Form Validation
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required but never displayed').notEmpty();
	req.checkBody('email','Email is not formatted properly').isEmail();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
		var posts = db.get('posts');
		posts.findById(postid, function(err, post){
			res.render('show',{
				"errors": errors,
				"post": post
			});
		});
	} else {
		var comment = {
			"name": name,
			"email": email,
			"body": body,
			"commentdate": commentdate
		}

		var posts = db.get('posts');

		posts.update({
			"_id": postid
		},{
			$push:{
				"comments": comment
			}
		}, function(err, doc){
			if(err){
				throw err;
			} else {
				req.flash('success', 'Comment Added');
				res.location('/posts/show/'+postid);
				res.redirect('/posts/show/'+postid);
			}
		});
	}
});



module.exports = router;
