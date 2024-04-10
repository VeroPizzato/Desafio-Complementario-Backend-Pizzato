const { Router } = require('express')
const router = Router()
const { validarNuevoProducto } = require('./products')

router.get('/', async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')
        const products = await ProductManager.getProducts()
        res.render('home', {
            title: 'Home',
            styles: ['productos.css'],
            products
        })
    } catch (error) {
        console.error('Error al al cargar los productos:', error)
    }
})

router.get('/home', async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')
        const products = await ProductManager.getProducts()
        res.render('home', {
            title: 'Home',
            styles: ['productos.css'],
            products
        })
    } catch (error) {
        console.error('Error al al cargar los productos:', error)
    }
})

router.get('/realtimeproducts', async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')
        const products = await ProductManager.getProducts()
        res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            styles: ['productos.css'],
            products,
            useWS: true,
            scripts: [
                'realTimeProducts.js'
            ]
        })
    } catch (error) {
        console.error('Error al al cargar los productos en tiempo real:', error)
    }
})

router.post('/realtimeproducts', validarNuevoProducto, async (req, res) => {
    try {
        const ProductManager = req.app.get('ProductManager')
        const product = req.body
        // Agregar el producto en el ProductManager
        // Convertir el valor status "true" o "false" a booleano        
        var boolStatus = JSON.parse(product.status)
        product.thumbnail = ["/images/" + product.thumbnail]
        product.price = +product.price
        product.stock = +product.stock
        await ProductManager.addProduct(
            product.title,
            product.description,
            +product.price,
            product.thumbnail,
            product.code,
            +product.stock,
            boolStatus,
            product.category)      
        // Notificar a los clientes mediante WS que se agrego un producto nuevo             
        req.app.get('ws').emit('newProduct', product)        
        res.redirect('/realtimeproducts')
        // res.status(201).json({ message: "Producto agregado correctamente" })
    } catch (error) {
        console.error('Error al agregar el producto:', error)
    }
})

router.get('/newProduct', async (_, res) => {
    res.render('newProduct', {
        title: 'Nuevo Producto',
    })
})

router.get('/chat', (_, res) => {
    res.render('chat', {
        title: 'Aplicación de chat',
        useWS: true,
        useSweetAlert: true,
        scripts: [
            'chat.js'
        ]
    })
})

module.exports = router