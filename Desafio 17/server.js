const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const {options} = require('./sqlite3');
const knex = require('knex')(options);
const carrito = require('./rutas/carrito.route');
const productos = require('./rutas/productos.route');
const handlebars = require('express-handlebars');
const io = require('socket.io')(http);
const fs = require('fs');
const router = express.Router();
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
        io.emit("actualizar-chat",{...data,id:socket.id});
        mensajes.push({message:data,id:socket.id});       

        // Defino si ya existe la tabla de mensajes
        let existe;
        try {            
            await knex.schema.hasTable('mensajes').then(e => { existe = e; });               
        } catch (err) {
            console.log(err);
        }
        // Si existe lo inserto en la tabla
        if (existe){
            try{
                await knex('mensajes').insert({...data,clientId:socket.id});                    
            }
            catch (err) {
                console.log(err);
            }
        }else{ 
            //Si no existe creo la tabla y luego lo inserto     
            try {
                await knex.schema.createTable('mensajes', (table) =>{
                    table.increments('id').notNullable().primary();
                    table.string('value', 150).notNullable();
                    table.string('email').notNullable();
                    table.string('dateStr').notNullable();
                    table.integer('clientId').notNullable();
                });
                await knex('mensajes').insert({...data,clientId:socket.id});      
            } catch (err) {
                console.log(err);
            } finally{
                knex.destroy();
            };
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