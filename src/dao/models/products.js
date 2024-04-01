const mongoose = require('mongoose')

const productCollection = 'products';

const productSchema = new mongoose.Schema({   
    title: String,
    description: String,
    price: Number,    
    thumbnail: Array,
    code: {
        type: String,
        unique: true
    },
    stock: Number,
    status: Boolean,
    category: String
});

module.exports = mongoose.model(productCollection, productSchema);
