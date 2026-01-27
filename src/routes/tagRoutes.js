const express = require('express');
const router = express.Router();

const tagController = require('../controllers/tagController');

router.get('/', tagController.readAllTags);

router.post('/', tagController.createTag);

module.exports = router;