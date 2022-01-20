const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const { model } = require('../controllers/productos');

// Vista de productos en tabla
router.get('/vista', model.vista);

// Devuele json de productos
router.get('/', model.listar);

// Devuele producto por categoria
router.get('/categoria/:id', model.categoria);

// Devuelve producto por id
router.get('/:id', model.listarId);

// Guardar producto por POST
router.post('/', isAdmin, model.agregar);

// Actualizar producto por PUT
router.put('/:id', isAdmin, model.actualizar);

// Eliminar producto por DELETE
router.delete('/:id', isAdmin, model.borrar);

module.exports = router;