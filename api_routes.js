// api-routes.js
// Initialize express router
let router = require('express').Router();
// Set default API response
router.get('/', function (req, res) {
/*    res.setHeader('Access-Control-Allow-Origin', 'https://almacfufin.herokuapp.com');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
   res.setHeader('Access-Control-Allow-Credentials', true);
   */
    res.json({
        status: 'API is Working',
        message: 'Welcome to the library sub-system of the blind support application',
    });
});

  // Import user controller
var userController=require('./controllers/userController');
router.route('/user/register')
  .post(userController.register);
router.route('/call')
  .post(userController.addnewroom)
  .put(userController.answercall)
  .get(userController.getAllUnansweredCall);
// Export API routes
module.exports = router;
