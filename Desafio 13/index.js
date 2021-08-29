const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const api = require('./rutas/api.route');
const handlebars = require('express-handlebars');
const io = require('socket.io')(http);
const fs = require('fs');

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

// Establecer ruta /api
app.use('/api', api);

// Websocket
io.on('connection', async (socket)=>{
    console.log('Cliente conectado: ' + socket.id);
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
    
    socket.on('hello',(data)=>{
        console.log(data);
    })
})
