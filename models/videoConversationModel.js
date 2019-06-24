var mongoose = require('mongoose');

var videoConversationSchema=mongoose.Schema({
    roomid:{
      type:String,
      required:true
    },
    userid:{
      type:String,
      required:true
    },
    advisorid:{
      type:String,
      required:true
    },
    type:{
      type:String,
      required:true
    },
    isDone:{
      type:String,
      required:false
    }
});
var VideoConversation = module.exports = mongoose.model('videoConversation', videoConversationSchema);
module.exports.get = function (callback, limit) {
    VideoConversation.find(callback).limit(limit);
}
