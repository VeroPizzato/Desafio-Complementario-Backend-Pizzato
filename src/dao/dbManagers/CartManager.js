const CartModel = require('../models/cart')

class CartManager {

    static #ultimoIdCart = 1

    constructor() { }

    inicialize = async () => {
        // No hacer nada
        // Podríamos chequear que la conexión existe y está funcionando
        if (CartModel.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
        else {
            const carts = await this.getCarts()
            CartManager.#ultimoIdCart = this.#getNuevoIdInicio(carts)
        }
    }

    #getNuevoIdInicio = (carts) => {
        let mayorID = 1
        carts.forEach(item => {
            if (mayorID <= item.id)
                mayorID = item.id
        });
        mayorID = mayorID + 1
        return mayorID
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

    #getNuevoId() {
        const id = CartManager.#ultimoIdCart
        CartManager.#ultimoIdCart++
        return id
    }

    getCartByCId = async (cid) => {
        const cart = await CartModel.findOne({ id: cid })
        if (cart)
            return cart
        else {
            console.error(`Carrito con ID: ${cid} Not Found`)
            return
        }
    }

    addCart = async (arrayCart) => {
        let nuevoCarrito = await CartModel.create({
            id: this.#getNuevoId(),
            arrayCart
        })       
    }

    addProductToCart = async (cid, pid, quantity) => {
        const cart = await this.getCartByCId(cid)
        const listadoProducts = cart.arrayCart;
        const codeProduIndex = listadoProducts.findIndex(e => e.productId === pid);
        if (codeProduIndex === -1) {
            let productoNuevo = {
                productId: pid,
                quantity: quantity
            }
            listadoProducts.push(productoNuevo);
        } else {
            listadoProducts[codeProduIndex].quantity += quantity;
        }
        await CartModel.updateOne({ id: cid }, cart)
    }

    deleteCart = async (cid) => {
        await CartModel.deleteOne({ id: cid });
    }
}

module.exports = CartManager