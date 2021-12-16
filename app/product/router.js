const router = require('express').Router();
const multer = require('multer');
const os = require('os');

const productController = require('./controller');

router.post('/products', multer({
    dest: os.tmpdir()
}).single('image'), productController.store);

module.exports = router;