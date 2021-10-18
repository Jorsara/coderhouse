const express = require('express');
const app = express();
const http = require('http').Server(app);
//const bodyParser = require('body-parser');
//const {options} = require("./database/mariaDB");
//const knex = require('knex')(options);
const carrito = require('./rutas/carrito.route');
const productos = require('./rutas/productos.route');
const user = require('./rutas/user.route');
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
const {normalize,schema} = require('normalizr');
const { Mongoose } = require('mongoose');
const cookie_parser = require('cookie-parser');
const session = require('express-session');
app.use(cookie_parser());
app.use(bodyParser());
const MongoStore = require('connect-mongo');
const advancedOptions = { userNewUrlParser: true, useUnifiedTopology: true };
database.connect();

app.use(session({
    store: MongoStore.create({mongoUrl:'mongodb+srv://root:root@cluster0.lcrh5.mongodb.net/test',ttl:600}),
    secret:'jljdfldjlkf',
    resave:false,
    saveUninitialized:false,
    rolling:true,
    cookie: {
      maxAge:60000
    }
}))

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
app.use('/user', user);

const author = new schema.Entity('authors');
const text = new schema.Entity('texts');
const chatSchema = new schema.Entity('chat',{
   authors: [author],
   text
});

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
    const normalizedData = normalize(mensajes, chatSchema);
    //console.log(JSON.stringify(normalizedData));

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