var mongoose = require('mongoose');

var userSchema=mongoose.Schema({
    id:{
      type:String,
      required:true
    },
    name:{
      type:String,
      required:true
    },
    firebaseId:{
      type:String,
      required:false
    },
    role:{
      type:String,
      required:true
    }
});
var User = module.exports = mongoose.model('User', userSchema);
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}
