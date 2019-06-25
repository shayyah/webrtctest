var shortid = require('short-id');
var fs=require('fs');
var admin = require("firebase-admin");



var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rahaf-t.firebaseio.com"
});

//var MongoClient = require('mongodb').MongoClient;
//var db_uri = 'mongodb://127.0.0.1:27017/blind_support_data';
//var db_params = { useNewUrlParser : true };
//var dbo;
//MongoClient.connect(db_uri, db_params,function(err,db){
//    dbo =db.db('blind_support_data');
//});

var User = require('../models/userModel.js');
var VideoConversation=require('../models/videoConversationModel.js');

exports.register = function (req, res) {
  console.log('regggggggggg');
  var id=req.body.id;
  var token=req.body.token;
  var name=req.body.name;
  var role=req.body.role;
      GetUser(id,function(user){
        if(user==null)
        {
            CreateUserAndAddToDataBase(id,token,name,role,function(myUser){
            if(myUser!=null)
              res.json(myUser);
            else res.json({message:'error'});
          });
        }
        else
        {
          res.json({message:'phone already exist'});
        }
      })

    //  console.log('name   '+ req.body.name);

  }
  exports.addnewroom=function(req,res){
    console.log('add new room');
      var id=req.body.roomid;
      var userid=req.body.userid;
      var advisorid=req.body.advisorid;
      var type=req.body.type;

      GetUser(userid,function(user){
        console.log(user);
        if(user!=null)
        {
          GetUser(advisorid,function(advisor){
            console.log(advisor);
              if(advisor!=null&&advisor.role!=null&&advisor.role=='Consultant')
              {
                  CreateVideoConversation(id,userid,advisorid,type,function(conversation){
                      res.json(conversation);
                      sendnotification(conversation,user,advisor);
                  });

              }
              else {
                    res.json({message:'error'});

              }
          });

        }
        else {
            res.json({message:'error'});
        }
      });

  }
  exports.answercall=function(req,res){
    var advisorid=req.body.advisorid;
    var roomid= req.body.roomid;
    var action=req.body.action;
    GetUser(advisorid,function(advisor){
      console.log(advisor);
        if(advisor!=null&&advisor.role!=null&&advisor.role=='Consultant')
        {
            getRoom(roomid,function(room){
              console.log(room);
                if(room!=null)
                {
                    if(action=='yes')
                    {
                        room.isDone='yes';
                    }
                    else {
                        room.isDone='no';
                    }
                    room.save(function(err){
                      if(err){
                        res.json({message:'error'});
                      }
                      else{
                        res.json({message:'done'});
                      }
                    });

                }
                else {
                    res.json({message:'error'});
                }
            });
        }
        else {
            res.json({message:'error'});
        }
    });
  }
  exports.getAllUnansweredCall=function(req,res){
    var advisorid=req.query.id;
    GetUser(advisorid,function(advisor){
        if(advisor!=null)
        {
            getUnansweredCall(advisorid,function(calls){
              res.json({calls:calls});
            });
        }
        else{
            res.json({message:'error'});
        }
  });
}
  function getRoom(id,callback){
    VideoConversation.findOne({roomid:id},function(err,user){
        if(err)callback(null);
        callback(user);
    });
  }
  function getUnansweredCall(id,callback)
  {
    var query={'advisorid':id,'isDone':''};

  VideoConversation.find(query,function(err,result){
    if(err)callback(null);
    callback(result);
  });
}
  function sendnotification(videoConversation,user,advisor)
  {
    console.log('send notification');
    var mes= "You have new "+videoConversation.type+" call";
    var notification = {
      notification: {
        title: mes,
        body: "",
        click_action: "openapp",
        sound:"sound",
        tag:"videoConversation",
        collapse_key: "green"
      },
      data: {
        userId:user.id,
        userName:user.name,
        roomid:videoConversation.roomid,
      }
    };
    var options = {
      priority: "high"
    };
    var token=advisor.firebaseId;

    console.log('token   '+token);
    admin.messaging().sendToDevice(token, notification, options)
      .then(function(response) {
        console.log("Successfully sent message:", response);
      })
      .catch(function(error) {
        console.log("Error sending message:", error);
      });
  }

  function CreateVideoConversation(vroomid,vuserid,vadvisorid,vtype,callback)
  {
      var conv=new VideoConversation();
      conv.roomid=vroomid;
      conv.userid=vuserid;
      conv.advisorid=vadvisorid;
      conv.type=vtype;
      conv.isDone='';
      conv.save(function(err){
        if(err)callback(err);
        console.log('conv  inserted   '+JSON.stringify(conv));
          callback(conv);
      });
  }
function CreateUserAndAddToDataBase(rid,rfirbase,rname,rrole,callback)
    {
      var user=new User();
          user.id=rid;
        user.firebaseId=rfirbase;
        user.name=rname;
        user.role=rrole;
        user.save(function(err){
          if(err)callback(err);
       console.log('user inserted   '+JSON.stringify(user));
          callback(user);
  //    });
     });
    }

  function GetUser(id,callback){
    User.findOne({id:id},function(err,user){
        if(err)callback(null);
        callback(user);
    });

  }
exports.getUser=function(id,callback) {
  console.log('getUser');
      User.findOne({id:id},function(err,user){
          if(err)callback(null);
          callback(user);
      });

  }
exports.getAllUsers=function(callback){
    User.find({},function(err,res){
        if(err)callback(null);
        callback(res);
    });
}
