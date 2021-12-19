const express = require('express');
const app = express();
const http = require('http').Server(app);
var compression = require('compression')
const carrito = require('./rutas/carrito.route');
const productos = require('./rutas/productos.route');
const user = require('./rutas/user.route');
const handlebars = require('express-handlebars');
const io = require('socket.io')(http);
const router = express.Router();
const database = require('./database/connection');
const { Producto } = require('./schemas/productos');
const { Mensaje } = require('./schemas/mensajes');
const bodyParser = require('body-parser');
const { normalize, schema } = require('normalizr');
const cookie_parser = require('cookie-parser');
const session = require('express-session');
app.use(cookie_parser());
app.use(bodyParser());
const MongoStore = require('connect-mongo');
const { fork } = require('child_process');
const { Usuario } = require('./schemas/usuario');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const { logger } = require('./logs/logConfig');
let {PORT} = require('yargs').argv;
const config = require('./config.js');
console.log({config});
console.log(PORT);

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

if(config.MODO == 'CLUSTER'){
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
                let username = config.USER;
                let password = config.PASSWORD;
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
        
        let puerto = PORT || 8080;
        http.listen(puerto, () =>{
            logger.info('Escuchando en el puerto ' + puerto);
            //logger.info(process.pid);
        });
    }
}
if(config.MODO == 'FORK'){
    app.get('/info',async(req,res)=>{
        try{
            let username = config.USER;
            let password = config.PASSWORD;
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
    
    let puerto = PORT || 8080;
    http.listen(puerto, () =>{
        logger.info('Escuchando en el puerto ' + puerto);
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

    let mensajes = await Mensaje.find().lean();
    
    socket.emit('mensaje-inicial',{mensajes})
    //logger.info(JSON.stringify(mensajes));
    //const normalizedData = normalize(mensajes, chatSchema);
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