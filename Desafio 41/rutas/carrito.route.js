const express = require('express');
const router = express.Router();

const { listar, listarId, agregar, borrar } = require('../controllers/carrito');

// Devuele json de carritos
router.get('/listar', listar);

// Devuelve carrito por id
router.get('/listar/:id', listarId);

// Guardar carrito por POST
router.post('/agregar', agregar);

// Eliminar carrito por DELETE
router.delete('/borrar/:id', borrar);

module.exports = router;