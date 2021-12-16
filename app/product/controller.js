const fs = require('fs');
const path = require('path');

const Product = require('./model');
const config = require('../config');

async function index(req, res, next) {
    try {

        let {
            limit = 10, skip = 0
        } = req.query;

        // convert query string to int
        const limitInt = parseInt(limit);
        const skipInt = parseInt(skip);

        let products = await Product
            .find()
            .limit(limitInt)
            .skip(skipInt);
        return res.json(products);
    } catch (err) {
        next(err)
    }
}

async function store(req, res, next) {

    try {

        let payload = req.body;

        if (req.file) {

            // menangkap lokasi sementara file yang diupload:
            let tmp_path = req.file.path;

            // menangkap ekstensi dari file yang diupload
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];

            // membangun nama file baru lengkap dengan ekstensi asli
            let filename = req.file.filename + '.' + originalExt;

            // mengkonfigurasi tempat penyimpanan untuk file yang diupload
            let target_path = path.resolve(config.rootPath, `public/uploads/product/${filename}`);

            // (1) baca file yang masih di lokasi sementara 
            const src = fs.createReadStream(tmp_path);

            // (2) pindahkan file ke lokasi permanen
            const dest = fs.createWriteStream(target_path);

            // (3) mulai pindahkan file dari `src` ke `dest`
            src.pipe(dest);

            src.on('end', async () => {
                try {

                    let product = new Product({
                        ...payload,
                        image_url: filename
                    })
                    await product.save()
                    return res.json(product);

                } catch (err) {

                    // (1) jika error, hapus file yang sudah terupload pada direktori
                    fs.unlinkSync(target_path);

                    // (2) cek apakah error disebabkan validasi MongoDB
                    if (err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }

                    next(err);

                }
            });

            src.on('error', async () => {
                next(err);
            });

        } else {

            let product = new Product(payload);
            await product.save();
            return res.json(product);

        }
    } catch (err) {

        // ----- cek tipe error ---- //
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err);
    }
}

async function update(req, res, next) {

    try {

        let payload = req.body;

        if (req.file) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/uploads/product/${filename}`);

            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            src.on('end', async () => {
                try {

                    let product = await Product.findOne({
                        _id: req.params.id
                    });

                    let currentImage = `${config.rootPath}/public/uploads/product/${product.image_url}`;

                    if (fs.existsSync(currentImage)) {
                        fs.unlinkSync(currentImage)
                    }

                    product =
                        await Product
                        .findOneAndUpdate({
                            _id: req.params.id
                        }, {
                            ...payload,
                            image_url: filename
                        }, {
                            new: true,
                            runValidators: true
                        });

                    return res.json(product);
                } catch (err) {
                    // ----- cek tipe error ---- //
                    if (err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        });
                    }

                    next(err);
                }
            });

            src.on('error', async () => {
                next(err);
            });

        } else {

            // (6) update produk jika tidak ada file upload
            let product =
                await Product
                .findOneAndUpdate({
                    _id: req.params.id
                }, payload, {
                    new: true,
                    runValidators: true
                });

            return res.json(product);

        }
    } catch (err) {

        // ----- cek tipe error ---- //
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err);
    }
}

module.exports = {
    index,
    store,
    update
}