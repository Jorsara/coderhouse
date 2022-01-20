const express = require('express');
const router = express.Router();

const { listar, listarId, agregar, borrar, actualizar } = require('../controllers/carrito');

// Devuele json de carritos
router.get('/', listar);

// Devuelve carrito por id
router.get('/:id', listarId);

// Guardar carrito por POST
router.post('/', agregar);

// Eliminar carrito por DELETE
router.delete('/:id', borrar);

// Actualizar carrito
router.put('/:id', actualizar);

module.exports = router;