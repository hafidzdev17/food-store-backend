// (1) import package `mongoose`
const mongoose = require('mongoose');

// (2) ambil module `model` dan `Schema` dari package `mongoose`
const {
    model,
    Schema
} = mongoose;


const productSchema = Schema({

    name: {
        type: String,
        minlength: [3, 'Panjang nama makanan minimal 3 karakter'],
        required: [true, 'Nama makanan harus diisi']
    },

    description: {
        type: String,
        maxlength: [1000, 'Panjang deskripsi maksimal 1000 karakter']
    },

    price: {
        type: Number,
        default: 0
    },

    image_url: String,

}, {
    timestamps: true
});

module.exports = model('Product', productSchema);