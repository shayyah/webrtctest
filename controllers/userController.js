var shortid = require('short-id');
var fs=require('fs');
//var admin = require("firebase-admin");


/*
var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rahaf-t.firebaseio.com"
});
*/



var User = require('../models/userModel.js');
var VideoConversation=require('../models/videoConversationModel.js');


exports.register ={
  handler: function (req, res) {
//  console.log(uu);
  console.log('regggggggggg');

  var id=req.payload.id;
  var token=req.payload.token;
  var name=req.payload.name;
  var role=req.payload.role;
      GetUser(id,function(user){
        if(user==null)
        {
            CreateUserAndAddToDataBase(id,token,name,role,function(myUser){
            if(myUser!=null)
              res(myUser);
            else res({message:'error'});
          });
        }
        else
        {
          res({message:'user already exist'});
        }
      });

    //  console.log('name   '+ req.body.name);

  }
};
  exports.updateToken ={
    handler:function(req,res){
      var id=req.query.id;
      var token=req.query.token;
      GetUser(id,function(user){
          if(user!=null)
          {
                user.firebaseId=token;
                user.save(function(err){
                    if(err)res({message:'error'});
                    else res(user);
                });
          }
          else {
            res({message:'error'});
          }
      });
  }
};
  exports.setConsultant={
    handler:function(req,res){
    console.log('set Consultant');
    var id =req.payload.id;
    GetUser(id,function(user){
        if(user!=null)
        {
            user.role='Consultant';
            user.save(function(err){
              if(err)res.json({message:'error'});
              else {
                res.json({message:'done'});
              }
            })
        }
        else {
          res.json({message:'error'});
        }
    });
  }
};
  exports.addnewroom={
    handler:function(req,res){
    console.log('add new room');
      var id=req.payload.roomid;
      var userid=req.payload.userid;
      var advisorid=req.payload.advisorid;
      var type=req.payload.type;
      console.log('typeeee   '+req.payload.type);
      GetUser(userid,function(user){
        console.log(user);
        if(user!=null)
        {
          GetUser(advisorid,function(advisor){
            console.log(advisor);
              if(advisor!=null&&advisor.role!=null&&advisor.role=='Consultant')
              {
                GetRoom(id,function(room){
                  if(room==null)
                  {
                        CreateVideoConversation(id,userid,advisorid,type,function(conversation){
                          res(conversation);
                        //  sendnotification(conversation,user,advisor);
                        CloseAfterTime(id);
                      });
                  }
                  else res({message:'error'});
                });


              }
              else {
                    res({message:'error'});

              }
          });

        }
        else {
            res({message:'error'});
        }
      });

  }
};
exports.onUserOpenRoomUrl=function(room){
    GetUser(room.userid,function(user){
      if(user!=null)
      {
        GetUser(room.advisorid,function(advisor){
            if(advisor!=null){
              console.log(room.roomid+'   notifocationsend');
                sendnotification(room,user,advisor);
            }
        });
      }

    });
}
  async function CloseAfterTime(roomid)
  {
    console.log('close after time');
    var time=1000*60*10;
    await sleep(time);
    console.log('reeeeeeturn');
      GetRoom(roomid,function(room){
          if(room!=null&&room.isDone=='')
          {
            room.isDone='no';
            room.save(function(err){
                if(err)console.log(err);
                else console.log('close room done');
            });
          }
      });
  }
  function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    });
}
  exports.answercall={
    handler:function(req,res){
    var advisorid=req.payload.advisorid;
    var roomid= req.payload.roomid;
    var action=req.payload.action;
    GetUser(advisorid,function(advisor){
      console.log(advisor);
        if(advisor!=null&&advisor.role!=null&&advisor.role=='Consultant')
        {
            GetRoom(roomid,function(room){
              console.log(room);
                if(room!=null)
                {
                  if(room.isDone==''){
                    if(action=='yes')
                    {
                        room.isDone='yes';
                    }
                    else {
                        room.isDone='no';
                    }
                    res({message:'done'});
                    room.save(function(err){
                      if(err){
                          console.log('done');
                      }
                      else{

                      }
                    });
                  }
                  else {
                      res({message:'ended'});
                  }

                }
                else {
                    res({message:'error'});
                }
            });
        }
        else {
            res({message:'error'});
        }
    });
  }
};
  exports.getAllUnansweredCall={
    handler:function(req,res){
    var advisorid=req.query.id;
    GetUser(advisorid,function(advisor){
        if(advisor!=null)
        {
            getUnansweredCall(advisorid,function(call){
              res({calls:call});
            });
        }
        else{
            res({message:'error'});
        }
  });
}
};
exports.endCall=  function(roomid,callback){
    GetRoom(roomid,function(room){
      console.log(room);
        if(room!=null)
        {

                room.isDone='ended';

            room.save(function(err){
              if(err){
                callback({message:'error'});
              }
              else{
                callback({message:'done'});
              }
            });

        }
        else {
            callback({message:'error'});
        }
    });
  }

  function GetRoom(id,callback){
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
        sound:"phone_loud1.mp3",
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

  exports.getRoom=function(id,callback){
      console.log('getRoom');
      VideoConversation.findOne({roomid:id},function(err,room){
        if(err)callback(null);
        callback(room);
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
