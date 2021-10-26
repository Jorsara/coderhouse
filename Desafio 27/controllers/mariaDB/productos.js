const {options} = require("../../database/mariaDB");
const knex = require("knex")(options);

// Vista de productos en tabla
const vista = async ( req, res, next ) => {       
  try {           
      // Buscar todos los productos en la tabla y parsearlos a json
      await knex('productos').select('*').then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);
          let productos = {
              items: json,
              cantidad: 0
          }
          productos.cantidad = productos.items.length;
          res.render('./layouts/index', {productos});  
      });    
  } catch (err) {
      console.log(err);
  }    
};

// Devuele json de productos
const listar = async ( req, res, next ) => {  
  try {
      // Buscar todos los productos en la tabla y parsearlos a json
      await knex('productos').select('*').then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);
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
      });      
  } catch (err) {
      console.log(err);
  }
};

// Devuelve producto por id
const listarId = async ( req, res, next ) => {  
  try {
      // Buscar el producto y mostrarlo
      await knex('productos').where({id : req.params.id}).then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);

          if(json.length > 0){
              res.send(json[0]);
          }else{
              res.send({error : 'Producto no encontrado.'});
          }
      });
  } catch (err) {
      console.log(err);
  }
};

// Guardar producto por POST
const agregar = async ( req, res, next ) => {         
  // Verificio si existe la tabla en una variable global
  let existe;
  try {            
      await knex.schema.hasTable('productos').then(e => { existe = e; });               
  } catch (err) {
      console.log(err);
  }
  // Si existe la inserto en la tabla
  if (existe){
      try{
          console.log(req.body);
          await knex('productos').insert(req.body).then(e=>console.log(e));
          res.redirect('back');                         
      }
      catch (err) {
          console.log(err);
      }
  }else{ 
      // Si no existe creo la tabla y luego la inserto          
      try {
          await knex.schema.createTable('productos', (table) =>{
              table.increments('id').notNullable();
              table.string('title').notNullable();
              table.float('price').notNullable();
              table.string('thumbnail').notNullable();
              table.string('descripcion').notNullable();
              table.string('codigo').notNullable();
              table.string('timestamp').notNullable();
              table.string('stock').notNullable();
          });
          await knex('productos').insert(req.body).then(e=>console.log(e));
          res.redirect('back');
      } catch (err) {
          console.log(err);
      } finally{
          knex.destroy();
      };
  }
};

// Actualizar producto por PUT
const actualizar = async ( req, res, next ) => {    
  try {
      // Buscar que valores actualizar y hacer update
      let prodActualizado = req.body;
      prodActualizado.id = req.params.id;
      if (prodActualizado.hasOwnProperty('title')){
          await knex('productos').where({id : req.params.id}).update({title : prodActualizado.title})
      }
      if (prodActualizado.hasOwnProperty('price')){
          await knex('productos').where({id : req.params.id}).update({price : prodActualizado.price})
      }
      if (prodActualizado.hasOwnProperty('thumbnail')){
          await knex('productos').where({id : req.params.id}).update({thumbnail : prodActualizado.thumbnail})
      }

      // Enviar producto actualizado
      await knex('productos').where({id : req.params.id}).then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);
          res.send(json);
      });
  } catch (err) {
      console.log(err);
  }
};

// Eliminar producto por DELETE
const borrar = async ( req, res, next ) => {   
  try {
        // Guardar el producto eliminado
      let prodEliminado;
      await knex('productos').where({id : req.params.id}).then(data => {
          let string = JSON.stringify(data);
          prodEliminado = JSON.parse(string);
      });             
      // Eliminar el producto de la tabla y enviarlo como respuesta
      await knex('productos').where({id : req.params.id}).del().then(()=>{
          res.send(prodEliminado); 
      });                      
  } catch (err) {
      console.log(err);
  }
};

// Buscar por nombre
const buscarNombre = async ( req, res, next ) => {       
  try {
    // Buscar el producto y mostrarlo
    await knex('productos').where({title : req.query.title}).then(data => {
        let string = JSON.stringify(data);
        let json = JSON.parse(string);

        if(json.length > 0){
            res.send(json[0]);
        }else{
            res.send({error : 'Producto no encontrado.'});
        }
    });
  } catch (err) {
      console.log(err);
  }
};

// Buscar por codigo
const buscarCodigo = async ( req, res, next ) => {       
    try {
      // Buscar el producto y mostrarlo
      await knex('productos').where({codigo : req.query.codigo}).then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);
  
          if(json.length > 0){
              res.send(json[0]);
          }else{
              res.send({error : 'Producto no encontrado.'});
          }
      });
    } catch (err) {
        console.log(err);
    }
};

// Buscar por precio
const buscarPrecio = async ( req, res, next ) => {       
    try {
      // Buscar el producto y mostrarlo
      await knex('productos').where('price', '<=', req.query.maximo).where('price', '>=', req.query.minimo).then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);
  
          if(json.length > 0){
              res.send(json);
          }else{
              res.send({error : 'Producto no encontrado.'});
          }
      });
    } catch (err) {
        console.log(err);
    }
};

// Buscar por stock
const buscarStock = async ( req, res, next ) => {       
    try {
      // Buscar el producto y mostrarlo
      await knex('productos').where('stock', '<=', req.query.maximo).where('stock', '>=', req.query.minimo).then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);
  
          if(json.length > 0){
              res.send(json);
          }else{
              res.send({error : 'Producto no encontrado.'});
          }
      });
    } catch (err) {
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