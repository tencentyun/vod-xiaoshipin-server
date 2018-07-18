const express = require('express');
const router = express.Router();
const handler = require('./handler');


router.all('/get_next_file', handler.get_next_file);

router.all('/', handler.review);


module.exports = router;
