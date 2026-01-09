const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//Husk nu for helvede rækkefølgen... De mere specifikke først...

router.get('/', userController.getAll);
module.exports = router;