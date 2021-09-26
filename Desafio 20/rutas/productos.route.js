const express = require('express');
const router = express.Router();
//const app = express();
//const fs = require('fs');
//const bodyParser = require('body-parser');
//const {options} = require("../mariaDB");
//const e = require('cors');
//const knex = require("knex")(options);
//app.use(bodyParser());
const isAdmin = require('../middleware/isAdmin');
const { listar, vista, listarId, agregar, actualizar, borrar } = require('../controllers/productos');

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

module.exports = router;