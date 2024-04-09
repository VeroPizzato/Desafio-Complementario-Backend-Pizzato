const ProductModel = require('../models/products')

class ProductManager {
 
    static #ultimoIdProducto = 1

    constructor() {}

    inicialize = async () => {
        // No hacer nada
        // Podríamos chequear que la conexión existe y está funcionando
        if (ProductModel.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
        else {
            const products = await this.getProducts()
            ProductManager.#ultimoIdProducto = this.#getNuevoIdInicio(products)
        }
    }

    #getNuevoIdInicio = (products) => {
        let mayorID = 1
        products.forEach(item => {
            if (mayorID <= item.id)
                mayorID = item.id
        });
        mayorID = mayorID + 1
        return mayorID
    }

    getProducts = async () => {
        try {
            const products = await ProductModel.find()
            return products.map(d => d.toObject({ virtuals: true }))           
        }
        catch (err) {
            return []
        }
    }

    getProductById = async (idProd) => {       
        const producto = await ProductModel.findOne({ id: idProd })       
        if (producto)
            return producto
        else {
            console.error(`Producto con ID: ${idProd} Not Found`)
            return
        }
    }

    #getNuevoId() {
        const id = ProductManager.#ultimoIdProducto
        ProductManager.#ultimoIdProducto++
        return id
    }

    soloNumYletras = (code) => {
        return (/^[a-z A-Z 0-9]+$/.test(code))
    }

    soloNumPositivos = (code) => {
        return (/^[0-9]+$/.test(code) && (code > 0))
    }

    soloNumPositivosYcero = (code) => {
        return (/^[0-9]+$/.test(code) && (code >= 0))
    }

    addProduct = async (title, description, price, thumbnail, code, stock, status, category) => {
        let product = await ProductModel.create({
            id: this.#getNuevoId(),
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category
        })       
    }

    updateProduct = async (prodId, producto) => {
        await ProductModel.updateOne({ id: prodId }, producto)
    }

    deleteProduct = async (idProd) => {
        await ProductModel.deleteOne({ id: idProd })
    }
}

module.exports = ProductManager