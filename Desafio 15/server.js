const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const carrito = require('./rutas/carrito.route');
const productos = require('./rutas/productos.route');
const handlebars = require('express-handlebars');
const io = require('socket.io')(http);
const fs = require('fs');
const mensajes = [];

http.listen(8080, () =>{
    console.log('Escuchando en el puerto 8080.');
});

app.use(bodyParser());
app.use(express.static('public'));

// Configuración de handlebars
app.engine(
    'hbs',
    handlebars({
        extname: '.hbs',
        defaultLayout: 'index.hbs',
        layoutsDir: __dirname + '/views/layouts',
        partialsDir: __dirname + '/views/partials/'
    })
);
app.set('view engine', 'hbs');
app.set('views', './views');

// Establecer rutas
app.use('/carrito', carrito);
app.use('/productos', productos);

// Websocket
io.on('connection', async (socket)=>{
    console.log('Cliente conectado: ' + socket.id);

    /* Mandar productos a cliente */
    try {
        const data = await fs.promises.readFile('productos.json');
        const json = JSON.parse(data.toString('utf-8'));        
        
        let productos = {
            items: json,
            cantidad: 0
        }
        productos.cantidad = productos.items.length;

        socket.emit('productos',{productos})   
    } catch (err) {
    console.log(err);
    }    

    /* Chat */
    // Emito el mensaje del usuario
    socket.emit('message',{mensajes})

    // Recibo el mensaje del usuario
    socket.on('mensaje-nuevo', async(data)=>{
        console.log(data);
        io.emit("actualizar-chat",{...data,id:socket.id})
        mensajes.push({message:data,id:socket.id})

        // Guardar mensaje en archivo
        try {
            const jData = await fs.promises.readFile('./mensajes.json');
            const json = JSON.parse(jData.toString('utf-8')); 
            json.push({message:data,id:socket.id});
            
            try {
                await fs.promises.writeFile('./mensajes.json', JSON.stringify(json, null, '\t'));
            } catch (err) {
                throw new Error(err);
            }
        } catch (err) {
        console.log(err);
        }
    })
})
