const mongoose = require('mongoose');
const { Schema } = mongoose;

const mensajeSchema = new Schema({
  author: {
    id: String,
    nombre: String,
    apellido: String,
    edad: String,
    alias: String,
    avatar: String
  },
  text: String
});
const Mensaje2 = mongoose.model('Mensaje2', mensajeSchema);

module.exports.Mensaje2 = Mensaje2;
