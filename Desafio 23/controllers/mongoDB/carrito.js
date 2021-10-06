const { Carrito } = require('../../schemas/carrito');

const listar = async ( req, res, next ) => {   
  try{
    let carritos = await Carrito.find();
    if(carritos.length > 0){
        res.send(carritos);
    }else{
        res.send({error : 'No hay carritos cargados.'});
    }     
  }catch (err) {
    console.log(err);
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
    console.log(err);
  }
};

const agregar = async ( req, res, next ) => {       
    try{
      const carrito = new Carrito(req.body);
      carrito.timestamp = Date.now();
      await carrito.save().then(e=>console.log(e));
      res.redirect('back');                         
    }
    catch (err) {
        console.log(err);
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
      console.log(err);
  }
};

module.exports.listarId = listarId;
module.exports.listar = listar;
module.exports.agregar = agregar;
module.exports.borrar = borrar;