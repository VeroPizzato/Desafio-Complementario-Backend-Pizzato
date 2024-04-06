const ProductModel = require('../models/products')

class ProductManager {

    constructor() { }

    inicialize = async () => {
        // No hacer nada
        // Podríamos chequear que la conexión existe y está funcionando
        if (ProductModel.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
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

    getProductById = async (id) => {
        const producto = await ProductModel.findOne({ id })        
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
        await ProductModel.deleteOne({ _id: idProd })
    }
}

module.exports = ProductManager