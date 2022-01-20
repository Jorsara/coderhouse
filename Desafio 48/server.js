const express = require('express');
const app = express();
const http = require('http').Server(app);
var compression = require('compression')
const carrito = require('./rutas/carrito.route');
const productos = require('./rutas/productos.route');
const user = require('./rutas/user.route');
const chat = require('./rutas/chat.route');
const ordenes = require('./rutas/ordenes.route');
const handlebars = require('express-handlebars');
const io = require('socket.io')(http);
const router = express.Router();
const database = require('./database/connection');
const { Producto } = require('./schemas/productos');
const { Mensaje } = require('./schemas/mensajes');
const bodyParser = require('body-parser');
const cookie_parser = require('cookie-parser');
const session = require('express-session');
app.use(cookie_parser());
app.use(bodyParser());
const MongoStore = require('connect-mongo');
const { logger } = require('./logs/logConfig');
let {PORT} = require('yargs').argv;
path = require('path'),

database.connect();
app.use(compression());

app.use(session({
    store: MongoStore.create({mongoUrl:'mongodb+srv://root:root@cluster0.lcrh5.mongodb.net/test',ttl:600}),
    secret:'jljdfldjlkf',
    resave:false,
    saveUninitialized:false,
    rolling:true,
    cookie: {
      maxAge:600000
    }
}))

//app.use(bodyParser());
//app.use(express.static('public'));

app.get('/assets/js/script.js',function(req,res){
    res.sendFile(path.join(__dirname + '/assets/js/script.js')); 
});
app.get('/assets/css/style.css',function(req,res){
    res.sendFile(path.join(__dirname + '/assets/css/style.css')); 
});


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
app.use('/ordenes', ordenes);
app.use('/productos', productos);
app.use('/chat', chat);
app.use('/', user);

// Websocket
io.on('connection', async (socket)=>{
    logger.info('Cliente conectado: ' + socket.id);

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
        logger.error(err);
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
            await mensajeNuevo.save().then(e=>logger.info(e));                   
        }
        catch (err) {
            logger.error(err);
        }
        if(data.value === 'administrador'){
            client.messages.create({
                body: `El usuario ${data.email} envio el mensaje ${data.value}`,
                from: '+18509044560',
                to: '+542914421609'
            })
            .then(message => logger.info(message.sid))
            .catch(logger.error('Error al enviar sms'));     
        }   
    })
});
    
let puerto = PORT || 8080;
http.listen(puerto, () =>{
    logger.info('Escuchando en el puerto ' + puerto);
});

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