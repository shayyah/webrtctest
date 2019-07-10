var Index = require('../controller');
var Room = require('../controller/room');
var UserController=require('../controllers/userController');
exports.endpoints = [
  { method: 'POST', path: '/api/user', config: UserController.register },
  { method: 'PUT', path: '/api/user', config: UserController.setConsultant },
  { method: 'GET', path: '/api/user', config: UserController.updateToken },
  { method: 'POST', path: '/call', config: UserController.addnewroom },
  { method: 'PUT', path: '/call', config: UserController.answercall },
  { method: 'GET', path: '/call', config: UserController.getAllUnansweredCall },
  { method: 'GET', path: '/', config: Index.main },
  { method: 'POST', path: '/join/{roomId}/{clientId}', config: Room.join },
  { method: 'POST', path: '/message/{roomId}/{clientId}', config: Room.message },
  { method: 'GET', path: '/r/{roomId}/{clientId}', config: Room.main },
  { method: 'POST', path: '/leave/{roomId}/{clientId}', config: Room.leave },
  { method: 'POST', path: '/turn', config: Index.turn },
  { method: 'GET', path: '/{param*}', handler: {
      directory: {
        path: 'public',
        listing: false
      }
    }
  }
];
