const express = require('express');
const router = express.Router();

const materialController = require('../controllers/materialController');

router.get('/', materialController.readAllMaterials);

router.post('/', materialController.createMaterial);

module.exports = router;