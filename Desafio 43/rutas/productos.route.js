const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const { model } = require('../controllers/productos');

// Vista de productos en tabla
router.get('/vista', model.vista);

// Devuele json de productos
router.get('/listar', model.listar);

// Devuelve producto por id
router.get('/listar/:id', model.listarId);

// Guardar producto por POST
router.post('/agregar', isAdmin, model.agregar);

// Actualizar producto por PUT
router.put('/actualizar/:id', isAdmin, model.actualizar);

// Eliminar producto por DELETE
router.delete('/borrar/:id', isAdmin, model.borrar);

// Buscar por nombre
router.get('/buscarNombre', model.buscarNombre);

// Buscar por codigo
router.get('/buscarCodigo', model.buscarCodigo);

// Buscar por precio
router.get('/buscarPrecio', model.buscarPrecio);

// Buscar por stock
router.get('/buscarStock', model.buscarStock);

module.exports = router;