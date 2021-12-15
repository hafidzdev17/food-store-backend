// (1) import router dari express
const router = require('express').Router();

// (2) import product controller 
const productController = require('./controller');

// (3) pasangkan route endpoint dengan method `store`
router.post('/products', productController.store);

// (4) export router 
module.exports = router;