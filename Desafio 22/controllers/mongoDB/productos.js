const { query } = require('express');
const { Producto } = require('../../schemas/productos');
const faker = require('faker');
const { fake } = require('faker');
  
const vistaTest = async ( req, res, next ) => {   
  try {           
      let cant = req.query.cant || 50;
      let items = [];  
      for (let i = 0; i < cant; i++){
        let item = {
          id:i+1,
          title:faker.commerce.productName(),
          price:faker.commerce.price(),
          thumbnail:faker.image.imageUrl(),
          descripcion:faker.commerce.productDescription(),
          codigo:i+1,
          stock:faker.datatype.number(),
        }
        items.push(item)
      }
      let productos = {
        items,
        cantidad: cant
      }
      res.render('./layouts/index', {productos});    
  } catch (err) {
      console.log(err);
  }    
};

const vista = async ( req, res, next ) => {   
  try {           
      // Buscar todos los productos en la tabla y parsearlos a json
      let json = await Producto.find().lean();
      let productos = {
        items: json,
        cantidad: 0
      }
      productos.cantidad = productos.items.length;

      res.render('./layouts/index', {productos});    
  } catch (err) {
      console.log(err);
  }    
}; 

const listar = async ( req, res, next ) => {   
  try{
    let json = await Producto.find();
    if(json.length > 0){
        let productos = {
            items: json,
            cantidad: 0
        }
        productos.cantidad = productos.items.length;
        res.send(productos);
    }else{
        res.send({error : 'No hay productos cargados.'});
    }     
  }catch (err) {
    console.log(err);
  }
};

const listarId = async ( req, res, next ) => {   
  try{
    // Buscar el producto y mostrarlo
    const { id } = req.params;  
    const producto = await Producto.findById(id);
    if(producto){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    console.log(err);
  }
};

const agregar = async ( req, res, next ) => {       
  const { title, descripcion, price, thumbnail, codigo, stock } = req.body;

  if (!title || !descripcion || !price || !thumbnail || !codigo || !stock){
    res.json({ message: "Le faltan campos al producto para poder ser cargado." });
  }else{
    try{
      const producto = new Producto(req.body);
      producto.timestamp = Date.now();
      await producto.save().then(e=>console.log(e));
      res.redirect('back');                         
    }
    catch (err) {
        console.log(err);
    }    
  }
};

const actualizar = async ( req, res, next ) => {       
  try {
    const { id } = req.params;
    // Buscar que valores actualizar y hacer update
    if (req.body.hasOwnProperty('title')){
      await Producto.updateOne( {_id: id}, {$set: {title : req.body.title}})
    }
    if (req.body.hasOwnProperty('price')){
      await Producto.updateOne( {_id: id}, {$set: {price : req.body.price}})
    }
    if (req.body.hasOwnProperty('thumbnail')){
      await Producto.updateOne( {_id: id}, {$set: {thumbnail : req.body.thumbnail}})
    }
    if (req.body.hasOwnProperty('descripcion')){
      await Producto.updateOne( {_id: id}, {$set: {descripcion : req.body.descripcion}})
    }
    if (req.body.hasOwnProperty('codigo')){
      await Producto.updateOne( {_id: id}, {$set: {codigo : req.body.codigo}})
    }
    if (req.body.hasOwnProperty('stock')){
      await Producto.updateOne( {_id: id}, {$set: {stock : req.body.stock}})
    }  

    // Enviar producto actualizado
    const producto = await Producto.findById(id);
    res.send(producto);
  } catch (err) {
      console.log(err);
  }
};

const borrar = async ( req, res, next ) => {     
  try {
       // Guardar el producto eliminado
      const { id } = req.params;  
      const producto = await Producto.findById(id); 

      // Eliminar el producto de la db y enviarlo como respuesta
      await Producto.findOneAndDelete({ _id: id }).then(()=>{
          res.send(producto); 
      });                      
  } catch (err) {
      console.log(err);
  }
};

// Buscar por nombre
const buscarNombre = async ( req, res, next ) => {       
  try{
    // Buscar el producto y mostrarlo
    const producto = await Producto.find({ title: { $eq: req.query.title } });
    if(producto.length > 0){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    console.log(err);
  }  
};

// Buscar por codigo
const buscarCodigo = async ( req, res, next ) => {       
  try{
    // Buscar el producto y mostrarlo
    const producto = await Producto.find({ codigo: { $eq: req.query.codigo } });
    if(producto.length > 0){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    console.log(err);
  }  
};

// Buscar por precio
const buscarPrecio = async ( req, res, next ) => {       
  try{
    // Buscar el producto y mostrarlo
    const producto = await Producto.find({ price: { $gt: req.query.minimo, $lt: req.query.maximo } });
    if(producto.length > 0){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    console.log(err);
  }  
};

// Buscar por stock
const buscarStock = async ( req, res, next ) => {       
  try{
    // Buscar el producto y mostrarlo
    const producto = await Producto.find({ stock: { $gt: req.query.minimo, $lt: req.query.maximo } });
    if(producto.length > 0){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    console.log(err);
  }  
};

module.exports.listarId = listarId;
module.exports.listar = listar;
module.exports.vista = vista;
module.exports.agregar = agregar;
module.exports.actualizar = actualizar;
module.exports.borrar = borrar;
module.exports.buscarNombre = buscarNombre;
module.exports.buscarCodigo = buscarCodigo;
module.exports.buscarPrecio = buscarPrecio;
module.exports.buscarStock = buscarStock;
module.exports.vistaTest = vistaTest;