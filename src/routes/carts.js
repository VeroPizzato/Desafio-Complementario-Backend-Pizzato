const { Router } = require('express')

const router = Router()

// // Middleware para validacion de datos al agregar un carrito 
async function validarNuevoCarrito(req, res, next) {
    const ProductManager = req.app.get('ProductManager')
    const { products } = req.body    
    products.forEach(producto => {      
        const prod = ProductManager.getProductById(producto.id)
        if (!prod) {
            res.status(400).json({ error: "Producto con ID:" + producto.id + " not Found" })
            return
        }
        if (isNaN(producto.quantity) || (!ProductManager.soloNumPositivos(producto.quantity))) {
            res.status(400).json({ error: "Invalid quantity format" })
            return
        }
    })
    next()
}

// Middleware para validacion de carrito existente 
async function ValidarCarritoExistente(req, res, next) { 
    const CartManager = req.app.get('CartManager')
    let cId = +req.params.cid 
    const cart = CartManager.getCartByCId(cId)
    if (!cart) {
        res.status(400).json({ error: "Carrito con ID:" + cId + " not Found" })
        return
    }

    next()
}

// Middleware para validacion de producto existente 
async function ValidarProductoExistente(req, res, next) {
    const ProductManager = req.app.get('ProductManager')
    let pId = +req.params.pid
    const prod = ProductManager.getProductById(pId)    
    if (!prod) {
        res.status(400).json({ error: "Producto con ID:" + pId + " not Found" })
        return
    }

    next()
}

router.get('/', async (req, res) => {
    try {
        const CartManager = req.app.get('CartManager')
        const carts = await CartManager.getCarts()      
        res.status(200).json(carts)  // HTTP 200 OK
        return
    }
    catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
})

router.get('/:cid', async (req, res) => {
    const CartManager = req.app.get('CartManager')
    let cidCart = req.params.cid    
    let cartByCID = await CartManager.getCartByCId(cidCart) 
    if (!cartByCID) {
        res.status(404).json({ error: "Id inexistente!" })  // HTTP 404 => el ID es válido, pero no se encontró ese carrito
        return
    }   
    res.status(200).json(cartByCID)    // HTTP 200 OK
})


router.post('/', validarNuevoCarrito, async (req, res) => {
    try {
        const CartManager = req.app.get('CartManager')
        let { arrayCart } = req.body                   
        await CartManager.addCart(arrayCart)  
        res.status(201).json({ message: "Carrito agregado correctamente" })  // HTTP 201 OK      

    }  catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
})

router.post('/:cid/product/:pid', ValidarCarritoExistente, ValidarProductoExistente, async (req, res) => {
    try {
        const CartManager = req.app.get('CartManager')
        const { cid, pid } = req.params    
        // Buscar el carrito por su ID
        const cartExistente = await CartManager.getCartByCId(cid) 
        // Verifica si el producto ya está en el carrito
        if (cartExistente && Array.isArray(cartExistente.arrayCart)) {
            const productoEnCarrito = cartExistente.arrayCart.find(elem => elem.productId === pid)
            if (productoEnCarrito) {
                // Si ya existe, agrego 1
                productoEnCarrito.quantity += 1
            } else {
                // Si el producto no está en el carrito, lo agrego con cantidad 1
                cartExistente.arrayCart.push({ productId: pid, quantity: 1 })
            }
            // Guardar el carrito actualizado
            await cartExistente.save()
            res.status(200).json({message: "Producto agregado al carrito con éxito"})  // HTTP 200 OK
        } else {
            res.status(404).json({mesage: 'El carrito no existe o no esta definido correctamente'})
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })    
    }
})

router.delete('/:pid', async (req, res) => {
    let { pid } = req.params
    await CartManager.deleteProductToCart(pid) 
    res.status(200).json(result)  // HTTP 200 OK
})

module.exports = router