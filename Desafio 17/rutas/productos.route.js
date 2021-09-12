const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const router = express.Router();
const {options} = require("../mariaDB");
const e = require('cors');
const knex = require("knex")(options);
let administrador = true;
app.use(bodyParser());

// Vista de productos en tabla
router.get('/vista', async (req, res)=>{        
    if (administrador){        
        try {           
            // Buscar todos los productos en la tabla y parsearlos a json
            await knex('productos').select('*').then(data => {
                let string = JSON.stringify(data);
                let json = JSON.parse(string);
                let productos = {
                    items: json,
                    cantidad: 0
                }
                productos.cantidad = productos.items.length;
                res.render('./layouts/index', {productos});  
            });    
        } catch (err) {
            console.log(err);
        }    
    }else{
        res.send({ error : -1, descripcion: 'Ruta /vista método GET no autorizada'})
    }
});

// Devuele json de productos
router.get('/listar', async (req, res)=>{    
    if (administrador){
        try {
            // Buscar todos los productos en la tabla y parsearlos a json
            await knex('productos').select('*').then(data => {
                let string = JSON.stringify(data);
                let json = JSON.parse(string);
                let productos = {
                    items: json,
                    cantidad: 0
                }
                productos.cantidad = productos.items.length;
                if(json.length > 0){
                    let productos = {
                        items: json,
                        cantidad: 0
                    }
                    productos.cantidad = productos.items.length;
                    res.send(productos);
                }else{
                    res.send({error : 'No hay productos cargados.'});
                }     
            });      
        } catch (err) {
            console.log(err);
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /listar método GET no autorizada'})
    }
});

// Devuelve producto por id
router.get('/listar/:id', async (req, res)=>{    
    if (administrador){
        try {
            // Buscar el producto y mostrarlo
            await knex('productos').where({id : req.params.id}).then(data => {
                let string = JSON.stringify(data);
                let json = JSON.parse(string);

                if(json.length > 0){
                    res.send(json[0]);
                }else{
                    res.send({error : 'Producto no encontrado.'});
                }
            });
        } catch (err) {
            console.log(err);
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /listar método GET no autorizada'})
    }
});

// Guardar producto por POST
router.post('/agregar', async (req, res)=>{            
    if (administrador){
        // Verificio si existe la tabla en una variable global
        let existe;
        try {            
            await knex.schema.hasTable('productos').then(e => { existe = e; });               
        } catch (err) {
            console.log(err);
        }
        // Si existe la inserto en la tabla
        if (existe){
            try{
                await knex('productos').insert(req.body).then(e=>console.log(e));
                res.redirect('back');                         
            }
            catch (err) {
                console.log(err);
            }
        }else{ 
            // Si no existe creo la tabla y luego la inserto          
            try {
                await knex.schema.createTable('productos', (table) =>{
                    table.increments('id').notNullable();
                    table.string('title').notNullable();
                    table.float('price').notNullable();
                    table.string('thumbnail').notNullable();
                });
                await knex('productos').insert(req.body).then(e=>console.log(e));
                res.redirect('back');
            } catch (err) {
                console.log(err);
            } finally{
                knex.destroy();
            };
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /agregar método POST no autorizada'})
    }
});

// Actualizar producto por PUT
router.put('/actualizar/:id', async (req, res)=>{      
    if (administrador){      
        try {
            // Buscar que valores actualizar y hacer update
            let prodActualizado = req.body;
            prodActualizado.id = req.params.id;
            if (prodActualizado.hasOwnProperty('title')){
                await knex('productos').where({id : req.params.id}).update({title : prodActualizado.title})
            }
            if (prodActualizado.hasOwnProperty('price')){
                await knex('productos').where({id : req.params.id}).update({price : prodActualizado.price})
            }
            if (prodActualizado.hasOwnProperty('thumbnail')){
                await knex('productos').where({id : req.params.id}).update({thumbnail : prodActualizado.thumbnail})
            }

            // Enviar producto actualizado
            await knex('productos').where({id : req.params.id}).then(data => {
                let string = JSON.stringify(data);
                let json = JSON.parse(string);
                res.send(json);
            });
        } catch (err) {
            console.log(err);
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /actualizar método PUT no autorizada'})
    }
});

// Eliminar producto por DELETE
router.delete('/borrar/:id', async (req, res)=>{      
    if (administrador){      
        try {
             // Guardar el producto eliminado
            let prodEliminado;
            await knex('productos').where({id : req.params.id}).then(data => {
                let string = JSON.stringify(data);
                prodEliminado = JSON.parse(string);
            });             
            // Eliminar el producto de la tabla y enviarlo como respuesta
            await knex('productos').where({id : req.params.id}).del().then(()=>{
                res.send(prodEliminado); 
            });                      
        } catch (err) {
            console.log(err);
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /borrar método DELETE no autorizada'})
    }
});

module.exports = router;