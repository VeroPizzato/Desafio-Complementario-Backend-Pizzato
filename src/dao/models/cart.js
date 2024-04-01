const mongoose = require('mongoose')

const cartCollection = 'carts';

const cartSchema = new mongoose.Schema({
    arrayCart: [{ product: String, quantity: Number }]
});


module.exports = mongoose.model(cartCollection, cartSchema);