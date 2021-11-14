const express = require('express');
const app = express();
const http = require('http').Server(app);
//const bodyParser = require('body-parser');
//const {options} = require("./database/mariaDB");
//const knex = require('knex')(options);
var compression = require('compression')
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
const winston = require('winston');
const cookie_parser = require('cookie-parser');
const session = require('express-session');
app.use(cookie_parser());
app.use(bodyParser());
const MongoStore = require('connect-mongo');
const advancedOptions = { userNewUrlParser: true, useUnifiedTopology: true };
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const { fork } = require('child_process');
const { Usuario } = require('./schemas/usuario');
const cluster = require('cluster') /* https://nodejs.org/dist/latest-v14.x/docs/api/cluster.html */
const numCPUs = require('os').cpus().length

database.connect();

const logger = winston.createLogger({
    level: 'warn',
    transports : [
        new winston.transports.Console({level:'info'}),
        new winston.transports.File({filename: './logs/error.log', level:'error'}),
        new winston.transports.File({filename: './logs/warn.log', level:'warn'})
    ]
});

logger.error('Test error');
logger.warn('Test warn');
logger.info('Test info');

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

app.get('/test',(req,res)=>{
    res.send('Heroku funcionado!');
});

if(process.argv[5] == 'CLUSTER'){
    /* MASTER */
    if(cluster.isMaster) {
        logger.info(numCPUs);
        logger.info(`PID MASTER ${process.pid}`);

        for(let i=0; i<numCPUs; i++) {
            cluster.fork()
        }

        cluster.on('exit', worker => {
            logger.info('Worker', worker.process.pid, 'died', new Date().toLocaleString())
            cluster.fork()
        })
    }
    /* --------------------------------------------------------------------------- */
    /* WORKERS */
    else {
        
        app.get('/info',async(req,res)=>{
            try{
                let username = process.argv[3];
                let password = process.argv[4]
                let usuarios = await Usuario.find();
                let user = usuarios.find(usuario => usuario.username == username);
                let success = user.username == username && user.password == password;
                if (!success){
                    res.send('El usuario no es valido.')
                }else{
                    logger.info('El usuario es valido.');
                    let info = {
                        argumentos: req.query,
                        plataforma: process.platform,
                        versionNode: process.version,
                        usoMemoria: process.memoryUsage(),
                        pathDeEjecucion: process.cwd(),
                        proccesId: process.pid,
                        carpetaCorriente: process.argv[0],
                        numCPUs
                    }
                    res.send(info);
                }          
            }
            catch (err) {
                loger.error(err);
            }       
        })
        app.get('/randoms',async(req,res)=>{
            try{
                let username = process.argv[3];
                let password = process.argv[4]
                let usuarios = await Usuario.find();
                let user = usuarios.find(usuario => usuario.username == username);
                let success = user.username == username && user.password == password;
                if (!success){
                    res.send('El usuario no es valido.')
                }else{
                    logger.info('El usuario es valido.');
                    let cant = req.query.cant - 1 || 100000000;
                    let numeros = {};
                    for(let i = 0; i <= cant; i++){
                        let random = Math.floor(Math.random() * (1001 -  1) + 1);
                        let existe = numeros[random];
                        if(existe){
                            numeros[random] = existe + 1;
                        }else{
                            numeros[random] = 1;
                        }
                    }
                    res.send(numeros);
                }          
            }
            catch (err) {
                logger.error(err);
            }       
        })
        let PORT = process.argv[2] || 8080;
        http.listen(PORT, () =>{
            logger.info('Escuchando en el puerto ' + PORT);
            logger.info(process.pid);
        });
    }
}
if(process.argv[5] == 'FORK'){
    app.get('/info',async(req,res)=>{
        try{
            let username = process.argv[3];
            let password = process.argv[4]
            let usuarios = await Usuario.find();
            let user = usuarios.find(usuario => usuario.username == username);
            let success = user.username == username && user.password == password;
            if (!success){
                res.send('El usuario no es valido.')
            }else{
                logger.info('El usuario es valido.');
                let info = {
                    argumentos: req.query,
                    plataforma: process.platform,
                    versionNode: process.version,
                    usoMemoria: process.memoryUsage(),
                    pathDeEjecucion: process.cwd(),
                    proccesId: process.pid,
                    carpetaCorriente: process.argv[0]
                }
                res.send(info);
            }          
        }
        catch (err) {
            logger.error(err);
        }       
    })
    app.get('/randoms',async(req,res)=>{
        try{
            let username = process.argv[3];
            let password = process.argv[4]
            let usuarios = await Usuario.find();
            let user = usuarios.find(usuario => usuario.username == username);
            let success = user.username == username && user.password == password;
            if (!success){
                res.send('El usuario no es valido.')
            }else{
                logger.info('El usuario es valido.');
                let cant = req.query.cant - 1 || 100000000;
                const computo = fork('./randoms.js', [cant])
                computo.send('start')
                computo.on('message', numeros => {
                    res.send(numeros)
                });
            }          
        }
        catch (err) {
            logger.error(err);
        }       
    })
    const PORT = process.env.PORT || 8080;
    http.listen(PORT, () =>{
        console.log('Escuchando en el puerto ' + PORT);
        //logger.info(process.pid);
    });
}

const author = new schema.Entity('authors');
const text = new schema.Entity('texts');
const chatSchema = new schema.Entity('chat',{
   authors: [author],
   text
});

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

    let mensajes = await Mensaje2.find().lean();
    
    //socket.emit('mensaje-inicial',{mensajes})
    //logger.info(JSON.stringify(mensajes));
    const normalizedData = normalize(mensajes, chatSchema);
    //logger.info(JSON.stringify(normalizedData));

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