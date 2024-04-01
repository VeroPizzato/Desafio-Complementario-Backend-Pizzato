const { Router } = require('express');
const router = Router();

const CartManager = require('../dao/CartManager');
const ProductManager = require('../dao/ProductManager')

const filenameCart = `${__dirname}/../../carrito.json`
const carritoManager = new CartManager(filenameCart)

const filenameProd = `${__dirname}/../../productos.json`
const productsManager = new ProductManager(filenameProd)

// Middleware para validacion de datos al agregar un carrito 
async function validarNuevoCarrito(req, res, next) {
    const { products } = req.body;
    
    products.forEach(producto => {      
        const prod = productsManager.getProductById(producto.id);
        if (!prod) {
            res.status(400).json({ error: "Producto con ID:" + producto.id + " not Found" })
            return
        }
        if (isNaN(producto.quantity) || (!productsManager.soloNumPositivos(producto.quantity))) {
            res.status(400).json({ error: "Invalid quantity format" })
            return
        }
    });   

    next()
}

// Middleware para validacion de carrito existente 
async function ValidarCarritoExistente(req, res, next) { 
    let cId = +req.params.cid; 
    const cart = carritoManager.getCartByCId(cId);
    if (!cart) {
        res.status(400).json({ error: "Carrito con ID:" + cId + " not Found" })
        return
    }

    next()
}

// Middleware para validacion de producto existente 
async function ValidarProductoExistente(req, res, next) {
    let pId = +req.params.pid;
    const prod = productsManager.getProductById(pId)    
    if (!prod) {
        res.status(400).json({ error: "Producto con ID:" + pId + " not Found" })
        return
    }

    next()
}

router.post('/', validarNuevoCarrito, async (req, res) => {
    const { products } = req.body; 
  
    const nuevoCarrito = await carritoManager.addCart(products);
    
    res.status(201).json({ message: "Carrito agregado correctamente", carrito: nuevoCarrito })
})

router.get('/:cid', async (req, res) => {
    let cidCart = +req.params.cid;

    if (isNaN(cidCart)) {
        // HTTP 400 => hay un error en el request o alguno de sus parámetros
        res.status(400).json({ error: "Invalid ID format" })
        return
    }

    let cartByCID = await carritoManager.getCartByCId(cidCart); 

    if (!cartByCID) {
        res.status(404).json({ error: "Id inexistente!" })  // HTTP 404 => el ID es válido, pero no se encontró ese carrito
        return
    }
    res.status(200).json(cartByCID)    // HTTP 200 OK
})

router.post('/:cid/product/:pid', ValidarCarritoExistente, ValidarProductoExistente, async (req, res) => {   
    let idCart = +req.params.cid;
    let idProd = +req.params.pid;
    let quantity = 1;       

    await carritoManager.addProductToCart(idCart, idProd, quantity);

    res.status(200).json(`Se agregaron ${quantity} producto/s con ID ${idProd} al carrito con ID ${idCart}`)    // HTTP 200 OK
})

const main = async () => {
    await productsManager.inicialize()    
    await carritoManager.inicialize()
}
main()

module.exports = router;