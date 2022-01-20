const mongoose = require('mongoose');
const { Schema } = mongoose;

const carritoSchema = new Schema({
  timestamp: String,
  email: String,
  direccion: String,
  productos: [
    {
      title: String,
      price: Number,
      codigo: Number,
      cantidad: Number
    }
  ]
});
const Carrito = mongoose.model('Carrito', carritoSchema);

module.exports.Carrito = Carrito;