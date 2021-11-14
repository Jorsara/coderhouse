const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const {persistencia} = require('../peristencia');

switch (persistencia){
    case 1: {
        const { listar, vista, listarId, agregar, actualizar, borrar, buscarNombre, buscarCodigo, buscarPrecio, buscarStock } = require('../controllers/mongoDB/productos');
        // Vista de productos en tabla
        router.get('/vista', vista);
    
        // Devuele json de productos
        router.get('/listar', listar);
    
        // Devuelve producto por id
        router.get('/listar/:id', listarId);
    
        // Guardar producto por POST
        router.post('/agregar', isAdmin, agregar);
    
        // Actualizar producto por PUT
        router.put('/actualizar/:id', isAdmin, actualizar);
    
        // Eliminar producto por DELETE
        router.delete('/borrar/:id', isAdmin, borrar);

        // Buscar por nombre
        router.get('/buscarNombre', buscarNombre);

        // Buscar por codigo
        router.get('/buscarCodigo', buscarCodigo);

        // Buscar por precio
        router.get('/buscarPrecio', buscarPrecio);

        // Buscar por stock
        router.get('/buscarStock', buscarStock);
    }
    case 2: {
        const { listar, vista, listarId, agregar, actualizar, borrar, buscarNombre, buscarCodigo, buscarPrecio, buscarStock } = require('../controllers/mariaDB/productos');

        // Vista de productos en tabla
        router.get('/vista', vista);
    
        // Devuele json de productos
        router.get('/listar', listar);
    
        // Devuelve producto por id
        router.get('/listar/:id', listarId);
    
        // Guardar producto por POST
        router.post('/agregar', isAdmin, agregar);
    
        // Actualizar producto por PUT
        router.put('/actualizar/:id', isAdmin, actualizar);
    
        // Eliminar producto por DELETE
        router.delete('/borrar/:id', isAdmin, borrar);

        // Buscar por nombre
        router.get('/buscarNombre', buscarNombre);

        // Buscar por codigo
        router.get('/buscarCodigo', buscarCodigo);

        // Buscar por precio
        router.get('/buscarPrecio', buscarPrecio);

        // Buscar por stock
        router.get('/buscarStock', buscarStock);
    }
}

module.exports = router;