
const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const router = express.Router();

app.use(bodyParser());

// Vista de productos en tabla
router.get('/productos/vista', async (req, res)=>{    
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
});

// Devuele json de productos
router.get('/productos/listar', async (req, res)=>{    
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
});

// Devuelve producto por id
router.get('/productos/listar/:id', async (req, res)=>{    
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
});

// Guardar producto por POST
router.post('/productos/guardar', async (req, res)=>{            
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
});

// Actualizar producto por PUT
router.put('/productos/actualizar/:id', async (req, res)=>{            
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
});

// Eliminar producto por DELETE
router.delete('/productos/borrar/:id', async (req, res)=>{            
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
});

module.exports = router;