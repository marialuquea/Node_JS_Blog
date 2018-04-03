var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//nodeblog is the folder where the db is stored
mongoose.connect('mongodb://localhost/nodeblog');

var db2 = mongoose.connection;

//User schema
var UserSchema = mongoose.Schema({
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

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
  //encrypt password using bcrypt
  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });

}
