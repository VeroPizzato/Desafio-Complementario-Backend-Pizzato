const ProductModel = require('../models/products')

class ProductManager {

    #products
    static #ultimoIdProducto = 1

    constructor() {
        this.#products = []
     }

    inicialize = async () => {
        // No hacer nada
        // Podríamos chequear que la conexión existe y está funcionando
        if (ProductModel.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
        else {
            this.#products = await this.getProducts()
            ProductManager.#ultimoIdProducto = this.#getNuevoIdInicio()
        }
    }

    #getNuevoIdInicio = () => {
        let mayorID = 1
        this.#products.forEach(item => {
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
        const producto = await ProductModel.findOne({ _id: idProd })        
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
   
    addProduct = async(title, description, price, thumbnail, code, stock, status, category) => {        
        let result = await ProductModel.create({
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
        await ProductModel.updateOne({ _id: prodId }, producto)
    }

    deleteProduct = async (idProd) => {        
        await ProductModel.deleteOne({ id: idProd })
    }
}

module.exports = ProductManager