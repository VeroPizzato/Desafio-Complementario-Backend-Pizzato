const CartModel = require('../models/cart')

class CartManager {

    constructor() { }

    inicialize = async () => {
        // No hacer nada
        // Podríamos chequear que la conexión existe y está funcionando
        if (CartModel.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
    }

    getCarts = async () => {
        try {
            const carts = await CartModel.find()
            return carts.map(d => d.toObject({ virtuals: true }))
        }
        catch (err) {
            return []
        }
    }

    getCartByCId = async (cid) => {
        const cart = await CartModel.findById(cid)
        //const cart = await CartModel.findOne(cid)
        console.log(cart)
    }

    addCart = async (arrayCart) => {
        let nuevoCarrito = await CartModel.create({
            arrayCart
        })
        console.log(nuevoCarrito)
    }

    deleteProductToCart = async (pid) => {
        let result = await CartModel.deleteOne({ _id: pid })
    }
}

module.exports = CartManager