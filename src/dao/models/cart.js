const mongoose = require('mongoose')

const cartCollection = 'carts';

const cartSchema = new mongoose.Schema({
    id: {
        type: Number,
        requied: true,
        unique: true
    },
    arrayCart: [{ productId: Number, quantity: Number }]    
});

module.exports = mongoose.model(cartCollection, cartSchema);