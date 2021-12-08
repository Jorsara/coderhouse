const mongoose = require('mongoose');
const { Schema } = mongoose;

const carritoSchema = new Schema({
  timestamp: String,
  productos: [
    {
      title: String,
      price: Number,
      thumbnail: String,
      id: Number,
      timestamp: Number,
      descripcion: String,
      codigo: Number,
      stock: Number
    }
  ]
});
const Carrito = mongoose.model('Carrito', carritoSchema);

module.exports.Carrito = Carrito;