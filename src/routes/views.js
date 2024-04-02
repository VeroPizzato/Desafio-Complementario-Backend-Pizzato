const fs = require('fs')
const { Router } = require('express')

const router = Router()

const ProductManager = require('../dao/ProductManager')

const filenameProd = `${__dirname}/../../productos.json`
const productsManager = new ProductManager(filenameProd)

const { validarNuevoProducto } = require('./products')

router.get('/home', async (_, res) => {
    try {
        const products = await productsManager.getProducts()

        res.render('home', {
            title: 'Home',
            styles: ['productos.css'],
            products
        });
    } catch (error) {
        console.error('Error al al cargar los productos:', error);
    }
})

router.get('/realtimeproducts', async (_, res) => {
    try {
        const products = await productsManager.getProducts()

        res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            styles: ['productos.css'],
            products,
            useWS: true,
            scripts: [
                'realTimeProducts.js'
            ]
        });
    } catch (error) {
        console.error('Error al al cargar los productos en tiempo real:', error);
    }
});

router.post('/realtimeproducts', validarNuevoProducto, async (req, res) => {
    try {
        
        const product = req.body
        // Agregar el producto en el ProductManager
        // Convertir el valor status "true" o "false" a booleano        
        var boolStatus = JSON.parse(product.status)
        product.thumbnail = ["/images/" + product.thumbnail]
        product.price = +product.price
        product.stock = +product.stock
        await productsManager.addProduct(
            product.title,
            product.description,
            +product.price,
            product.thumbnail,
            product.code,
            +product.stock,
            boolStatus,
            product.category);

        // Notificar a los clientes mediante WS que se agrego un producto nuevo             
        req.app.get('ws').emit('newProduct', product)        
        res.redirect('/realtimeproducts')
        // res.status(201).json({ message: "Producto agregado correctamente" })
    } catch (error) {
        console.error('Error al agregar el producto:', error);
    }
});

router.get('/newProduct', async (_, res) => {
    res.render('newProduct', {
        title: 'Nuevo Producto',
    })
});

router.get('/', (_, res) => {
    res.render('index', {
        title: 'Aplicación de chat',
        useWS: true,
        useSweetAlert: true,
        scripts: [
            'index.js'
        ]
    })
})

const main = async () => {
    await productsManager.inicialize()
}
main()

module.exports = router