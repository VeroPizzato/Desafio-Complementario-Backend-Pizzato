const express = require('express');
const handlebars = require('express-handlebars')
const viewsRouter = require('./routes/views')
const { Server } = require('socket.io')
const mongoose = require('mongoose')

const cartsRouter = require('./routes/carts');
// const { router: productsRouter, productsManager } = require('./routes/products');
const { router: productsRouter } = require('./routes/products');

const chatModel = require('./dao/models/chat');

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

mongoose.connect('mongodb+srv://verizzato:Mavepi76@codercluster.wmmycws.mongodb.net/?retryWrites=true&w=majority&appName=CoderCluster',
{
    dbName: 'ecommerce'
})
const httpServer = app.listen(8080, () => {
    console.log('Servidor listo!!');
});

// creando un servidor para ws
const io = new Server(httpServer)
app.set('ws', io)


let messagesHistory = [];

io.on('connection', (clientSocket) => {
    console.log(`Cliente conectado con id: ${clientSocket.id}`)

    // enviar todos los mensajes hasta ese momento
    for (const data of messagesHistory) {
        clientSocket.emit('message', data)
    }

    clientSocket.on('message', async data => {
        messagesHistory.push(data);

        try {
            const { user, text } = data;
            const chatMessage = new chatModel({
                user,
                text
            });
                
            // Se persiste en Mongo
            const result = await chatMessage.save();
    
            console.log(`Mensaje de ${user} persistido en la base de datos.`);
        } catch (error) {
            console.error('Error al persistir el mensaje:', error);
        }

        io.emit('message', data);
    })

    clientSocket.on('authenticated', data => {
        clientSocket.broadcast.emit('newUserConnected', data);  // notificar a los otros usuarios que se conecto
    })

    // // Escucho el evento 'deleteProduct' emitido por el cliente
    // clientSocket.on('deleteProduct', async (productId) => {
    //     try {
    //         const id = parseInt(productId);
    //         console.log(productId)
    //         if (isNaN(id)) {
    //             throw new Error('Invalid productId: ' + productId);
    //         }
    //         await productsManager.deleteProduct(id);
    //         // Emitir evento 'productDeleted' a los clientes
    //         io.emit('productDeleted', id);
    //     } catch (error) {
    //         console.error('Error deleting product:', error);
    //     }
    // });

})

