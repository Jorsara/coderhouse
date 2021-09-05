const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const router = express.Router();
let administrador = true;
app.use(bodyParser());

// Vista de productos en tabla
router.get('/vista', async (req, res)=>{    
    if (administrador){
        try {
            const data = await fs.promises.readFile('./productos.json');
            const json = JSON.parse(data.toString('utf-8'));        
            
            let productos = {
                items: json,
                cantidad: 0
            }
            productos.cantidad = productos.items.length;
            res.render('./layouts/index', {productos});          
        } catch (err) {
        console.log('Error');
        }    
    }else{
        res.send({ error : -1, descripcion: 'Ruta /vista método GET no autorizada'})
    }
});

// Devuele json de productos
router.get('/listar', async (req, res)=>{    
    if (administrador){
        try {
            const data = await fs.promises.readFile('./productos.json');
            const json = JSON.parse(data.toString('utf-8'));
            
            if(json.length > 0){
                let productos = {
                    items: json,
                    cantidad: 0
                }
                productos.cantidad = productos.items.length;
                res.send(productos);
            }else{
                res.send({error : 'no hay productos cargados'});
            }        
        } catch (err) {
        console.log('Error');
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /listar método GET no autorizada'})
    }
});

// Devuelve producto por id
router.get('/listar/:id', async (req, res)=>{    
    if (administrador){
        try {
            const data = await fs.promises.readFile('./productos.json');
            const json = JSON.parse(data.toString('utf-8')); 
            const result = json.filter(product => product.id == req.params.id);

            if(result.length > 0){
                res.send(result[0]);
            }else{
                res.send({error : 'producto no encontrado'});
            }
        } catch (err) {
        console.log('Error');
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /listar método GET no autorizada'})
    }
});

// Guardar producto por POST
router.post('/agregar', async (req, res)=>{            
    if (administrador){
        try {
            const data = await fs.promises.readFile('./productos.json');
            const json = JSON.parse(data.toString('utf-8')); 
            json.push({ ...req.body, id: json.length + 1 });
            
            try {
                await fs.promises.writeFile('./productos.json', JSON.stringify(json, null, '\t'));
                res.redirect('back');
            } catch (err) {
                throw new Error(err);
            }
        } catch (err) {
        console.log('Error');
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /agregar método POST no autorizada'})
    }
});

// Actualizar producto por PUT
router.put('/actualizar/:id', async (req, res)=>{      
    if (administrador){      
        try {
            const data = await fs.promises.readFile('./productos.json');
            const json = JSON.parse(data.toString('utf-8')); 
            let prodActualizado = req.body;
            prodActualizado.id = req.params.id;
            let foundIndex = json.findIndex(x => x.id == req.params.id);
            if (prodActualizado.hasOwnProperty('title')){
                json[foundIndex].title = prodActualizado.title;
            }
            if (prodActualizado.hasOwnProperty('price')){
                json[foundIndex].price = prodActualizado.price;
            }
            if (prodActualizado.hasOwnProperty('thumbnail')){
                json[foundIndex].thumbnail = prodActualizado.thumbnail;
            }
            //json[foundIndex] = prodActualizado;

            try {
                await fs.promises.writeFile('./productos.json', JSON.stringify(json, null, '\t'));
                res.send(json[foundIndex])
            } catch (err) {
                throw new Error(err);
            }
        } catch (err) {
        console.log('Error');
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /actualizar método PUT no autorizada'})
    }
});

// Eliminar producto por DELETE
router.delete('/borrar/:id', async (req, res)=>{      
    if (administrador){      
        try {
            const data = await fs.promises.readFile('./productos.json');
            const json = JSON.parse(data.toString('utf-8'));        
            let foundIndex = json.findIndex(x => x.id == req.params.id);
            prodEliminado = json[foundIndex];
            let jsonNuevo = json.filter(e => { return e.id != req.params.id; }); 
            
            try {
                await fs.promises.writeFile('./productos.json', JSON.stringify(jsonNuevo, null, '\t'));
                res.send(prodEliminado)
            } catch (err) {
                throw new Error(err);
            }
        } catch (err) {
        console.log('Error');
        }
    }else{
        res.send({ error : -1, descripcion: 'Ruta /borrar método DELETE no autorizada'})
    }
});

module.exports = router;