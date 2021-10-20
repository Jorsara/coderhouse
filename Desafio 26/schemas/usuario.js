const mongoose = require('mongoose');
const { Schema } = mongoose;

const usuarioSchema = new Schema({
  username:String,
  password:String
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports.Usuario = Usuario;