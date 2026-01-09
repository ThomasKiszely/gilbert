const express = require('express');
const router = express.Router();
const viewController = require('./controllers/viewController');

//Husk nu for helvede rækkefølgen... De mere specifikke først...

router.get('/', viewController.showIndex);
module.exports = router;