const express = require('express');
const app = express();
const http = require('http').Server(app);
//const bodyParser = require('body-parser');
const {options} = require("./database/mariaDB");
const knex = require('knex')(options);
const carrito = require('./rutas/carrito.route');
const productos = require('./rutas/productos.route');
const handlebars = require('express-handlebars');
const io = require('socket.io')(http);
// const fs = require('fs');
const router = express.Router();
const database = require('./database/connection');
// const { Database } = require('sqlite3');
const { Producto } = require('./schemas/productos');
const { Mensaje } = require('./schemas/mensajes');
const {persistencia} = require('./peristencia');
const bodyParser = require('body-parser');
app.use(bodyParser());

database.connect();

http.listen(8080, () =>{
    console.log('Escuchando en el puerto 8080.');
});

//app.use(bodyParser());
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

switch (persistencia){
    case 1: {
        // Websocket
        io.on('connection', async (socket)=>{
            console.log('Cliente conectado: ' + socket.id);

            /* Mandar productos a cliente */
            try {
                let json = await Producto.find().lean();
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
            let mensajes = await Mensaje.find().lean();
            socket.emit('mensaje-inicial',{mensajes})

            // Recibo el mensaje del usuario
            socket.on('mensaje-nuevo', async(data)=>{        
                io.emit("actualizar-chat",{message:data,clientId:socket.id});
                try{
                    const mensajeNuevo = new Mensaje({message:data,clientId:socket.id});
                    await mensajeNuevo.save().then(e=>console.log(e));                   
                }
                catch (err) {
                    console.log(err);
                }             
            })
        })
    }
    case 2: {
        // Websocket
        io.on('connection', async (socket)=>{
            console.log('Cliente conectado: ' + socket.id);

            /* Mandar productos a cliente */
            try {
                await knex('productos').select('*').then(data => {
                    let string = JSON.stringify(data);
                    let json = JSON.parse(string);          
                    if(json.length > 0){
                        let productos = {
                            items: json,
                            cantidad: 0
                        }
                        productos.cantidad = productos.items.length;
                        socket.emit('productos',{productos}) 
                    }else{
                        socket.emit('productos',{}) 
                    } 
                });       
            } catch (err) {
            console.log(err);
            }    

            /* Chat */
            // Emito el mensaje del usuario
            try {
                await knex('mensajes').select('*').then(data => {
                    let string = JSON.stringify(data);
                    let json = JSON.parse(string); 
                    let mensajes = [];
                    json.forEach(message=>{                        
                        mensajes.push({message:message});
                    })      

                    if(json.length > 0){
                        socket.emit('mensaje-inicial',{mensajes}) 
                    }else{
                        socket.emit('mensaje-inicial',{}) 
                    } 
                });       
            } catch (err) {
            console.log(err);
            }

            // Recibo el mensaje del usuario
            socket.on('mensaje-nuevo', async(data)=>{        
                io.emit("actualizar-chat",{message:data,clientId:socket.id});
                try{
                    console.log(data);
                    data.clientId = socket.id;
                    await knex('mensajes').insert(data).then(e=>console.log(e));                       
                }
                catch (err) {
                    console.log(err);
                }                        
            })
        })
    }
}
function error404(req, res, next){
    let error = new Error(),
        locals = {
            title: 'Error 404',
            description: 'Recurso no encontrado',
            error: error
        }

    error.status = 404;
    res.render('error', locals);
    //next();
}
app.use(error404);
module.exports = router;