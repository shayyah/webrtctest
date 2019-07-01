// Import express
let express = require('express');
// Import Body parser
let bodyParser = require('body-parser');
// Import Mongoose
let mongoose = require('mongoose');
// Initialize the app
let app = express();
// Import routes
//let apiRoutes = require("./api_routes");
var path = require('path');
//var server = require('http').Server(app);

var serveStatic = require('serve-static');  // serve static files
var cors = require('cors');
var fs=require('fs');
admin = require("firebase-admin");


var Hapi = require('hapi');
var Route = require('./route');
var Config = require('./config');

var server = new Hapi.Server();
//var server2 = new Hapi.Server();


// Configure bodyparser to handle post requests
//app.use(bodyParser.urlencoded({
//    extended: true
//}));

//app.use(bodyParser.json());

app.config = Config;
//app.use(express.static(path.join(__dirname, './Content')));
// Connect to Mongoose and set connection variable
var db_uri = process.env.MONGODB_URI || process.env.MONGOHQ_URL ||'mongodb://127.0.0.1:27017/rahafat_support_data';
//  console.log(db_uri);
var db_params = { useNewUrlParser : true };
mongoose.connect(db_uri, db_params,function(err,res){
  if(err)console.log('database error  '+err);
  console.log('dbconnected  '+db_uri);
});

var db = mongoose.connection;
// Setup server port
var port = process.env.PORT || 3000;


server.connection({ routes: { cors: true }, port:port});



/*server.register([{
    register: require('hapi-bodyparser'),
    options: {
         parser: { allowDots: true, strictNullHandling: true },
         sanitizer: {
             trim: true,
             stripNullorEmpty: true
         },
         merge: false,
         body: false
    }
}], function (err) {
    // Insert your preferred error handling here...
});
*/
server.register(require('inert'));

server.register(require('vision'), function (error) {
  if (error) {
    console.log('Failed to load vision.');
  }
});


console.log(port);
app.use(cors());

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rahaf-t.firebaseio.com"
});



// Send message for default URL
app.get('/', function(req, res) {
  res.send('Server Working on port '+port);

});

// Use Api routes in the App
//app.use('/api', apiRoutes);
server.route(Route.endpoints);

server.views({
  engines: {
    html: require('handlebars')
  },
  relativeTo: __dirname,
  path: './view'
});

server.start(function() {
  console.log('Server started at ' + server.info.uri + '.');
});

/*app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

 // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

 // Set to true if you need the website to include cookies in the requests sent
 // to the API (e.g. in case you use sessions)
 res.setHeader('Access-Control-Allow-Credentials', true);

 // Pass to next layer of middleware
 next();
});*/
// Launch app to listen to specified port
//app.listen(port, function () {
//   console.log("Running blind_support server on port " + port);
//});


//server.listen(port,function(){
//  console.log("Running blind_support server on port " + port);
//});
