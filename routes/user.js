const express = require('express')
const router = express.Router();
const fetchuser = require('../middleware/fetchUser');
const homeController = require("../controller/homeController");


router.get('/', fetchuser, homeController.home)
router.post('/createSecrets', fetchuser, homeController.createSecrets)
router.post('/deleteSecret', fetchuser, homeController.deleteSecrets)
router.put('/updateSecret/:id', fetchuser,homeController.updateSecrets)
router.post('/password/forgot',homeController.forgotPassword);
router.put('/password/reset/:token',homeController.resetPassword);
module.exports = router;
