const express = require('express');
const app = express();
const http = require('http').Server(app);
//const bodyParser = require('body-parser');
//const {options} = require("./database/mariaDB");
//const knex = require('knex')(options);
const carrito = require('./rutas/carrito.route');
const productos = require('./rutas/productos.route');
const handlebars = require('express-handlebars');
const io = require('socket.io')(http);
// const fs = require('fs');
const router = express.Router();
const database = require('./database/connection');
// const { Database } = require('sqlite3');
const { Producto } = require('./schemas/productos');
const { Mensaje2 } = require('./schemas/mensajes');
const {persistencia} = require('./peristencia');
const bodyParser = require('body-parser');
const {normalize,schema, denormalize} = require('normalizr');
const { Mongoose } = require('mongoose');
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

const author = new schema.Entity('authors');
const text = new schema.Entity('texts');
const chatSchema = new schema.Entity('chat',{
    author: author,
    text
 }, { idAttribute: '_id' });

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

    let mensajes = await Mensaje2.find().lean();
    
    //socket.emit('mensaje-inicial',{mensajes})
    //console.log(JSON.stringify(mensajes));
    const normalizedData = normalize(mensajes, Array.of(chatSchema))
    //console.log(JSON.stringify(normalizedData));
    //const denormalizedData = denormalize(normalizedData, Array.of(chatSchema), normalizedData.entities);
    //console.log(JSON.stringify(denormalizedData));
    const sizeO = Buffer.byteLength(JSON.stringify(mensajes));
    const sizeN = Buffer.byteLength(JSON.stringify(normalizedData));
    const comp = parseFloat(sizeN * 100 / sizeO - 100).toFixed(2);
    socket.emit('mensaje-inicial',{normalizedData, comp})

    // Recibo el mensaje del usuario
    socket.on('mensaje-nuevo', async(data)=>{        
        io.emit("actualizar-chat",{message:data,clientId:socket.id});
        try{
            //console.log(data);
            const mensajeNuevo = new Mensaje2({text:data.text, author:{
                id: data.author,
                nombre:"Juan",
                apellido:"Rodriguez",
                edad:"23",
                alias:"Juan",
                avatar:"URL"
            }});
            await mensajeNuevo.save().then(e=>console.log(e));                   
        }
        catch (err) {
            console.log(err);
        }             
    })
})
    
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