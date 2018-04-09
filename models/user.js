var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//nodeblog is the local folder where the db is stored
mongoose.connect('mongodb://localhost/nodeblog');

var db2 = mongoose.connection;

//User schema
var schema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  name:{
    type: String
  },
  profileimage: {
    type: String
  }
});

var User = module.exports = mongoose.model('User', schema);

module.exports.findUser_id = function(id, callback){
  User.findById(id, callback);
}

module.exports.findUser_username = function(username, callback){
  //create one object to find
  var query = {username: username};
  // findOne will only return one object
  User.findOne(query, callback);
}

module.exports.create_user = function(newUser, callback){
  //encrypt password using bcrypt
  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.check_passwords_match = function(maybe, hash, callback){
  bcrypt.compare(maybe, hash, function(err, theyMatch) {
    // res == true
    callback(null, theyMatch);
  });
}
