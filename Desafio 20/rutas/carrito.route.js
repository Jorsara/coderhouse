const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const router = express.Router();
let administrador = true;
app.use(bodyParser());

// Devuele json de productos
router.get('/listar', async (req, res)=>{    
    if (administrador){
        try {
            const data = await fs.promises.readFile('./carrito.json');
            const json = JSON.parse(data.toString('utf-8'))[0].productos;            
            if(json.length > 0){
                res.send(json);
            }else{
                res.send({error : 'No hay productos en el carrito.'});
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
            const data = await fs.promises.readFile('./carrito.json');
            const json = JSON.parse(data.toString('utf-8'))[0].productos; 
            const result = json.filter(product => product.id == req.params.id);

            if(result.length > 0){
                res.send(result[0]);
            }else{
                res.send({error : 'No se encontro el producto en el carrito.'});
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
            const data = await fs.promises.readFile('./carrito.json');
            const json = JSON.parse(data.toString('utf-8')); 
            json[0].productos.push({ ...req.body, id: json[0].productos.length + 1 });
            
            try {
                await fs.promises.writeFile('./carrito.json', JSON.stringify(json, null, '\t'));
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

// Eliminar producto por DELETE
router.delete('/borrar/:id', async (req, res)=>{      
    if (administrador){      
        try {
            const data = await fs.promises.readFile('./carrito.json');
            const json = JSON.parse(data.toString('utf-8'));        
            let foundIndex = json[0].productos.findIndex(x => x.id == req.params.id);
            prodEliminado = json[0].productos[foundIndex];
            json[0].productos = json[0].productos.filter(e => { return e.id != req.params.id; }); 
            
            try {
                await fs.promises.writeFile('./carrito.json', JSON.stringify(json, null, '\t'));
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