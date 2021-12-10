const mongoose = require('mongoose');
const { Schema } = mongoose;
var crypto = require('crypto');

const usuarioSchema = new Schema({
  username:String,
  nombre:String,
  direccion:String,
  edad:String,
  telefono:String,
  hash : String,
  salt : String
});

// Setear salt y hash
usuarioSchema.methods.setPassword = function(password) { 
  this.salt = crypto.randomBytes(16).toString('hex'); 
  this.hash = crypto.pbkdf2Sync(password, this.salt,  
  1000, 64, `sha512`).toString(`hex`); 
}; 
   
// Verificar la contraseña
usuarioSchema.methods.validPassword = function(password) { 
  var hash = crypto.pbkdf2Sync(password,  
  this.salt, 1000, 64, `sha512`).toString(`hex`); 
  return this.hash === hash; 
}; 

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports.Usuario = Usuario;