// (1) import model `Product`
const Product = require('./model');

async function store(req, res, next) {

    let payload = req.body

    // (1) buat Product baru menggunakan data dari `payload`
    let product = new Product(payload);

    // (2) simpan Product yang baru dibuat ke MongoDB
    await product.save();

    // (3) berikan response kepada client dengan mengembalikan product yang baru dibuat 
    return res.json(product);
}

module.exports = {
    store
}