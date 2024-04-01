const express = require('express');
const handlebars = require('express-handlebars')
const viewsRouter = require('./routes/views')
const { Server } = require('socket.io')
const mongoose = require('mongoose')

const cartsRouter = require('./routes/carts');
const { router: productsRouter, productsManager } = require('./routes/products');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/../public`))

// configuramos handlebars 
app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter)

mongoose.connect('mongodb+srv://verizzato:Mavepi76@codercluster.wmmycws.mongodb.net/?retryWrites=true&w=majority&appName=CoderCluster')

const httpServer = app.listen(8080, () => {    
    console.log('Servidor listo!!');
});

// creando un servidor para ws
const wsServer = new Server(httpServer)
app.set('ws', wsServer)

wsServer.on('connection', (clientSocket) => {
    console.log(`Cliente conectado con id: ${clientSocket.id}`)

    // Escucho el evento 'deleteProduct' emitido por el cliente
    clientSocket.on('deleteProduct', async (productId) => {
        try {
            const id = parseInt(productId);  
            console.log(productId)          
            if (isNaN(id)) {
                throw new Error('Invalid productId: ' + productId);
            }            
            await productsManager.deleteProduct(id);   
            // Emitir evento 'productDeleted' a los clientes
            wsServer.emit('productDeleted', id);                   
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    });
    
})

