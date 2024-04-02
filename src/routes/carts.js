const { Router } = require('express');
const cartModel = require('../dao/models/cart.js');
const router = Router();

router.get('/', async (req, res) => {
    try {
        let carrito = await cartModel.find();      
        res.status(200).json(carrito)  // HTTP 200 OK
        return
    }
    catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
})

router.get('/:cid', async (req, res) => {
    let cidCart = req.params.cid;
    
    let cartByCID = await cartModel.findById(cidCart) 

    if (!cartByCID) {
        res.status(404).json({ error: "Id inexistente!" })  // HTTP 404 => el ID es válido, pero no se encontró ese carrito
        return
    }
   
    res.status(200).json(cartByCID)    // HTTP 200 OK
})


router.post('/', async (req, res) => {
    try {
        let { arrayCart } = req.body;
                   
        let nuevoCarrito = await cartModel.create({
            arrayCart
        });

        res.status(201).json({ message: "Carrito agregado correctamente" })  // HTTP 201 OK      

    }  catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
})

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;       
      
        // Buscar el carrito por su ID
        const cartExistente = await cartModel.findById(cid);      

        // Verifica si el producto ya está en el carrito
        if (cartExistente && Array.isArray(cartExistente.arrayCart)) {
            const productoEnCarrito = cartExistente.arrayCart.find(elem => elem.productId === pid);

            if (productoEnCarrito) {
                // Si ya existe, agrego 1
                productoEnCarrito.quantity += 1;
            } else {
                // Si el producto no está en el carrito, lo agrego con cantidad 1
                cartExistente.arrayCart.push({ productId: pid, quantity: 1 });
            }

            // Guardar el carrito actualizado
            await cartExistente.save();

            res.status(200).json({message: "Producto agregado al carrito con éxito"})  // HTTP 200 OK

        } else {
            res.status(404).json({mesage: 'El carrito no existe o no esta definido correctamente'});
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })    
    }
});

router.delete('/:pid', async (req, res) => {

    let { pid } = req.params;   
  
    let result = await cartModel.deleteOne({
        _id: pid
    });

    res.status(200).json(result)  // HTTP 200 OK
})

// const CartManager = require('../dao/CartManager');
// const ProductManager = require('../dao/ProductManager')

// const filenameCart = `${__dirname}/../../carrito.json`
// const carritoManager = new CartManager(filenameCart)

// const filenameProd = `${__dirname}/../../productos.json`
// const productsManager = new ProductManager(filenameProd)

// // Middleware para validacion de datos al agregar un carrito 
// async function validarNuevoCarrito(req, res, next) {
//     const { products } = req.body;
    
//     products.forEach(producto => {      
//         const prod = productsManager.getProductById(producto.id);
//         if (!prod) {
//             res.status(400).json({ error: "Producto con ID:" + producto.id + " not Found" })
//             return
//         }
//         if (isNaN(producto.quantity) || (!productsManager.soloNumPositivos(producto.quantity))) {
//             res.status(400).json({ error: "Invalid quantity format" })
//             return
//         }
//     });   

//     next()
// }

// // Middleware para validacion de carrito existente 
// async function ValidarCarritoExistente(req, res, next) { 
//     let cId = +req.params.cid; 
//     const cart = carritoManager.getCartByCId(cId);
//     if (!cart) {
//         res.status(400).json({ error: "Carrito con ID:" + cId + " not Found" })
//         return
//     }

//     next()
// }

// // Middleware para validacion de producto existente 
// async function ValidarProductoExistente(req, res, next) {
//     let pId = +req.params.pid;
//     const prod = productsManager.getProductById(pId)    
//     if (!prod) {
//         res.status(400).json({ error: "Producto con ID:" + pId + " not Found" })
//         return
//     }

//     next()
// }

// router.post('/', validarNuevoCarrito, async (req, res) => {
//     const { products } = req.body; 
  
//     const nuevoCarrito = await carritoManager.addCart(products);
    
//     res.status(201).json({ message: "Carrito agregado correctamente", carrito: nuevoCarrito })
// })

// router.get('/:cid', async (req, res) => {
//     let cidCart = +req.params.cid;

//     if (isNaN(cidCart)) {
//         // HTTP 400 => hay un error en el request o alguno de sus parámetros
//         res.status(400).json({ error: "Invalid ID format" })
//         return
//     }

//     let cartByCID = await carritoManager.getCartByCId(cidCart); 

//     if (!cartByCID) {
//         res.status(404).json({ error: "Id inexistente!" })  // HTTP 404 => el ID es válido, pero no se encontró ese carrito
//         return
//     }
//     res.status(200).json(cartByCID)    // HTTP 200 OK
// })

// router.post('/:cid/product/:pid', ValidarCarritoExistente, ValidarProductoExistente, async (req, res) => {   
//     let idCart = +req.params.cid;
//     let idProd = +req.params.pid;
//     let quantity = 1;       

//     await carritoManager.addProductToCart(idCart, idProd, quantity);

//     res.status(200).json(`Se agregaron ${quantity} producto/s con ID ${idProd} al carrito con ID ${idCart}`)    // HTTP 200 OK
// })

// const main = async () => {
//     await productsManager.inicialize()    
//     await carritoManager.inicialize()
// }
// main()

module.exports = router;