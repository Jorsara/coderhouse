const {options} = require("../../database/mariaDB");
const knex = require("knex")(options);

// Devuele json de carritos
const listar = async ( req, res, next ) => {  
  try {
      // Buscar todos los carritos en la tabla y parsearlos a json
      await knex('carritos').select('*').then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);
          if(json.length > 0){
              res.send(json);
          }else{
              res.send({error : 'No hay carritos cargados.'});
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
      await knex('carritos').where({id : req.params.id}).then(data => {
          let string = JSON.stringify(data);
          let json = JSON.parse(string);

          if(json.length > 0){
              res.send(json[0]);
          }else{
              res.send({error : 'Carrito no encontrado.'});
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
      await knex.schema.hasTable('carritos').then(e => { existe = e; });               
  } catch (err) {
      console.log(err);
  }
  // Si existe la inserto en la tabla
  if (existe){
      try{
          req.body.productos = JSON.stringify(req.body.productos);
          await knex('carritos').insert(req.body).then(e=>console.log(e));
          res.redirect('back');                         
      }
      catch (err) {
          console.log(err);
      }
  }else{ 
      // Si no existe creo la tabla y luego la inserto          
      try {
          await knex.schema.createTable('carritos', (table) =>{
              table.increments('id').notNullable();
              table.string('timestamp').notNullable();              
              table.string('productos').notNullable();
          });
          
          req.body.productos = JSON.stringify(req.body.productos);
          await knex('carritos').insert(req.body).then(e=>console.log(e));
          res.redirect('back');
      } catch (err) {
          console.log(err);
      } finally{
          knex.destroy();
      };
  }
};

// Eliminar producto por DELETE
const borrar = async ( req, res, next ) => {   
  try {
        // Guardar el producto eliminado
      let prodEliminado;
      await knex('carritos').where({id : req.params.id}).then(data => {
          let string = JSON.stringify(data);
          prodEliminado = JSON.parse(string);
      });             
      // Eliminar el producto de la tabla y enviarlo como respuesta
      await knex('carritos').where({id : req.params.id}).del().then(()=>{
          res.send(prodEliminado); 
      });                      
  } catch (err) {
      console.log(err);
  }
};

module.exports.listarId = listarId;
module.exports.listar = listar;
module.exports.agregar = agregar;
module.exports.borrar = borrar;