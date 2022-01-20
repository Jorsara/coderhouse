const mongoose = require('mongoose');
const { Schema } = mongoose;

const productoSchema = new Schema({
  title: String,
  price: Number,
  thumbnail: String,
  id: Number,
  timestamp: Number,
  descripcion: String,
  codigo: Number,
  stock: Number,
  categoria: Number
});
const Producto = mongoose.model('Producto', productoSchema);

module.exports.Producto = Producto;