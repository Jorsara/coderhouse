const { Carrito } = require('../schemas/carrito');
const { logger } = require('../logs/logConfig');

const listar = async ( req, res, next ) => {   
  try{
    let carritos = await Carrito.find();
    if(carritos.length > 0){
        res.send(carritos);
    }else{
        res.send({error : 'No hay carritos cargados.'});
    }     
  }catch (err) {
    logger.error(err);
  }
};

const listarId = async ( req, res, next ) => {   
  try{
    // Buscar el carrito y mostrarlo
    const { id } = req.params;  
    const carrito = await Carrito.findById(id);
    if(carrito){
      res.send(carrito);
    }else{
        res.send({error : 'Carrito no encontrado.'});
    }
  }catch (err) {
    logger.error(err);
  }
};

const agregar = async ( req, res, next ) => {       
    try{
      const carrito = new Carrito(req.body);
      carrito.timestamp = Date.now();
      await carrito.save().then(e=>logger.info(e));    
      res.send('Carrito cargado correctamente.');
    }
    catch (err) {
        logger.error(err);
    }    
};

const borrar = async ( req, res, next ) => {     
  try {
       // Guardar el carrito eliminado
      const { id } = req.params;  
      const carrito = await Carrito.findById(id); 

      // Eliminar el carrito de la db y enviarlo como respuesta
      await Carrito.findOneAndDelete({ _id: id }).then(()=>{
          res.send(carrito); 
      });                      
  } catch (err) {
      logger.error(err);
  }
};

actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Buscar que valores actualizar y hacer update
    if (req.body.hasOwnProperty("direccion")) {
      await Carrito.updateOne(
        { _id: id },
        { $set: { direccion: req.body.direccion } }
      );
    }
    if (req.body.hasOwnProperty("email")) {
      await Carrito.updateOne(
        { _id: id },
        { $set: { email: req.body.email } }
      );
    }
    if (req.body.hasOwnProperty("productos")) {
      await Carrito.updateOne(
        { _id: id },
        { $set: { productos: req.body.productos } }
      );
    }

    // Enviar orden actualizado
    const carrito = await Carrito.findById(id);
    res.send(carrito);
  } catch (err) {
    logger.error(err);
  }
};

module.exports.listarId = listarId;
module.exports.listar = listar;
module.exports.agregar = agregar;
module.exports.borrar = borrar;
module.exports.actualizar = actualizar;