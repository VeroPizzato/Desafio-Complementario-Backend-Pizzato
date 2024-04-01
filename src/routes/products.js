const { Router } = require('express')
const productModel = require('../dao/models/products.js');

const router = Router()

const ProductManager = require('../dao/ProductManager')

const filenameProd = `${__dirname}/../../productos.json`
const productsManager = new ProductManager(filenameProd)

// Middleware para validacion de datos al agregar un producto 
async function validarNuevoProducto(req, res, next) {
    const product = req.body;
    product.price = +product.price
    product.stock = +product.stock
    product.thumbnail = [product.thumbnail]
    var boolStatus = JSON.parse(product.status);

    if (!product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, salvo la ruta de la imagen' });
    }
    if (isNaN(product.price) || isNaN(product.stock)) {
        res.status(400).json({ error: "Invalid number format" })
        return
    }
    if (!productsManager.soloNumPositivos(product.price)) {
        res.status(400).json({ error: "Precio negativo" })
        return
    }
    if (!productsManager.soloNumPositivosYcero(product.stock)) {
        res.status(400).json({ error: "Stock negativo" })
        return
    }
    if (!Array.isArray(product.thumbnail)) {
        res.status(400).json({ error: "El campo thumbnail es invalido." })
        return
    }
    else {
        let rutasValidas = true
        product.thumbnail.forEach(ruta => {
            if (typeof ruta != "string") {
                rutasValidas = false;
                return;
            }
        })
        if (!rutasValidas) {
            res.status(400).json({ error: "El campo thumbnail es invalido." })
            return
        }
    }
    const listadoProductos = await productsManager.getProducts()
    const codeIndex = listadoProductos.findIndex(e => e.code === product.code)
    if (codeIndex !== -1) {
        res.status(400).json({ error: "Codigo ya existente" })
        return
    }
    if (!productsManager.soloNumYletras(product.code)) {
        res.status(400).json({ error: "El campo codigo identificador es invalido." })
        return
    }
    if (typeof boolStatus != "boolean") {
        res.status(400).json({ error: "El campo status es invalido." })
        return
    }
    next()
}

// Middleware para validacion de datos al actualizar un producto 
// Si algun dato es vacio no se actualiza
async function validarProdActualizado(req, res, next) {
    const { title, description, price, thumbnail, code, stock, status, category } = req.body;
    let idProd = +req.params.pid

    const listadoProductos = await productsManager.getProducts()
    const codeIndex = listadoProductos.findIndex(e => e.id === idProd);
    if (codeIndex === -1) {
        res.status(400).json({ error: "Producto con ID:" + idProd + " not Found" })
        return
    }
    else {
        if (price !== '') {
            if (isNaN(price)) {
                res.status(400).json({ error: "Error. El campo precio es invalido." })
                return
            }
            if (!productsManager.soloNumPositivos(price)) {
                res.status(400).json({ error: "Precio negativo" })
                return
            }
        }
        if (stock !== '') {
            if (isNaN(stock)) {
                res.status(400).json({ error: "El campo stock es invalido." })
                return
            }
            if (!productsManager.soloNumPositivosYcero(stock)) {
                res.status(400).json({ error: "Precio negativo" })
                return
            }
        }
        if (!Array.isArray(thumbnail)) {
            res.status(400).json({ error: "El campo thumbnail es invalido." })
            return
        }
        else {
            let rutasValidas = true
            thumbnail.forEach(ruta => {
                if (typeof ruta != "string") {
                    rutasValidas = false;
                    return;
                }
            })
            if (!rutasValidas) {
                res.status(400).json({ error: "El campo thumbnail es invalido." })
                return
            }
        }
        if (code !== '') {
            if (!productsManager.soloNumYletras(code)) {
                res.status(400).json({ error: "El campo codigo identificador es invalido." })
                return
            }
        }
        if (typeof status != "boolean") {
            res.status(400).json({ error: "El campo status es invalido." })
            return
        }
    }
    next()
}

router.get('/', async (req, res) => {    
    try {
        // let cantLimite = req.query.limit
        // if (cantLimite) {
        //     if (isNaN(cantLimite) || (cantLimite < 0)) {
        //         // HTTP 400 => hay un error en el request o alguno de sus parámetros
        //         res.status(400).json({ error: "Invalid limit format" })
        //         return
        //     }
        //     const productos = await productModel.find().limit(cantLimite); 
        //     res.status(200).json(productos)  // HTTP 200 OK
        //     return
        // }

        const productos = await productModel.find()   
        console.log(productos)    
        res.status(200).json(productos)  // HTTP 200 OK
        return
    }
    catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }

    // const productos = await productModel.find().limit(cantLimite);

    // res.status(200).json(productos)  // HTTP 200 OK
});

router.post('/', async (req, res) => {

    try {
        const {
            title,
            description,
            price,           
            thumbnail,
            code,
            stock,
            status,
            category
        } = req.body;

        if (!title || !code) {
            return res.send({
                status: "Error",
                error: 'Datos incompletos'
            });
        }

        let result = await productModel.create({
            title,
            description,
            price,            
            thumbnail,
            code,
            stock,
            status,
            category
        });

        res.json(result)

        res.send({
            result: 'sucess',
            payload: result
        });
    } catch (error) {
        res.send({
            status: "Error",
            error: 'Se produjo un error fatal'
        });
    }

})

// router.get('/', async (req, res) => {
//     let cantLimite = req.query.limit

//     const listadoProductos = await productsManager.getProducts()
//     let prodFiltrados = []

//     if (cantLimite) {
//         if (isNaN(cantLimite) || (cantLimite < 0)) {
//             // HTTP 400 => hay un error en el request o alguno de sus parámetros
//             res.status(400).json({ error: "Invalid limit format" })
//             return
//         }
//         prodFiltrados = listadoProductos.slice(0, cantLimite)
//     }
//     else prodFiltrados = listadoProductos

//     res.status(200).json(prodFiltrados)  // HTTP 200 OK
// })

// router.get('/:pid', (req, res) => {
//     const productId = +req.params.pid

//     if (isNaN(productId)) {
//         // HTTP 400 => hay un error en el request o alguno de sus parámetros
//         res.status(400).json({ error: "Invalid ID format" })
//         return
//     }

//     const productByID = productsManager.getProductById(productId)
//     if (!productByID) {
//         res.status(404).json({ error: "Id inexistente!" })  // HTTP 404 => el ID es válido, pero no se encontró ese producto
//         return
//     }
//     res.status(200).json(productByID)    // HTTP 200 OK
// })

// router.post('/', validarNuevoProducto, async (req, res) => {
//     const producto = req.body

//     await productsManager.addProduct(producto.title, producto.description, producto.price, producto.thumbnail, producto.code, producto.stock, producto.status, producto.category)

//     res.status(201).json({ message: `Producto con Id ${producto.id} agregado correctamente` })
// })

// router.put('/:pid', validarProdActualizado, async (req, res) => {
//     const productID = +req.params.pid
//     const producto = req.body

//     await productsManager.updateProduct(productID, producto);

//     return res.status(200).json({ message: `Producto con Id ${producto.id} actualizado correctamente` });
// });

// router.delete('/:pid', async (req, res) => {
//     let idProd = +req.params.pid;
//     const listadoProductos = await productsManager.getProducts()
//     const codeIndex = listadoProductos.findIndex(e => e.id === idProd);
//     if (codeIndex === -1) {
//         res.status(400).json({ error: "Producto con ID:" + idProd + " not Found" })
//         return
//     }
//     else {
//         await productsManager.deleteProduct(idProd);
//     }
//     res.status(200).json({ message: "Producto Eliminado correctamente" })    // HTTP 200 OK
// });

const main = async () => {
    await productsManager.inicialize()
}
main()

module.exports = { router, productsManager, validarNuevoProducto };