const mongoose = require('mongoose');
const { Schema } = mongoose;

const ordenesSchema = new Schema({
  timestamp: String,
  numeroOrden: Number,
  estado: String,
  email: String,
  productos: [
    {
      title: String,
      price: Number,
      codigo: Number,
      cantidad: Number
    }
  ]
});
const Ordenes = mongoose.model('Ordenes', ordenesSchema);

module.exports.Ordenes = Ordenes;