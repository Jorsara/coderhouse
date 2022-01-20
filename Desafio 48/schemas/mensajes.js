const mongoose = require('mongoose');
const { Schema } = mongoose;

const mensajeSchema = new Schema({
  message: {
    value: String,
    email: String,
    tipo: String,
    dateStr: String
  },
  clientId: String
});
const Mensaje = mongoose.model('Mensaje', mensajeSchema);

module.exports.Mensaje = Mensaje;