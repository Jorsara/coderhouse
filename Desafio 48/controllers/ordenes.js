const { Ordenes } = require('../schemas/ordenes');
const { logger } = require('../logs/logConfig');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'nicholaus.kuhlman85@ethereal.email',
        pass: '6XBG43595WxNCfGQB7'
    },
    tls: {
        rejectUnauthorized: false
    }
});

const listar = async ( req, res, next ) => {   
  try{
    let ordenes = await Ordenes.find();
    if(ordenes.length > 0){
        res.send(ordenes);
    }else{
        res.send({error : 'No hay ordenes cargadas.'});
    }     
  }catch (err) {
    logger.error(err);
  }
};

const listarId = async ( req, res, next ) => {   
  try{
    // Buscar orden y mostrarla
    const { id } = req.params;  
    const orden = await Ordenes.findById(id);
    if(orden){
      res.send(orden);
    }else{
        res.send({error : 'Orden no encontrada.'});
    }
  }catch (err) {
    logger.error(err);
  }
};

const agregar = async ( req, res, next ) => {       
    try{
      const orden = new Ordenes(req.body);
      orden.timestamp = Date.now();
      const docCount = await Ordenes.countDocuments({}).exec();
      orden.numeroOrden = docCount + 1;
      await orden.save().then(e=>logger.info(e));
      
      let result = orden.productos.map(a => a.title);
      let productosMail = '';
      result.forEach(e => {
        productosMail = productosMail + `<p>${e}</p>`
      });
      
      //Mandar mail  
      const mail = `
                    <p><b>Nuevo pedido:</b></p>                    
                    <p><b>Productos</b></p>
                    ${productosMail}
      `;
      const mailOptions = {
        from: 'Coderhouse',
        to: [orden.email],
        subject: 'Nuevo pedido de...',
        html: mail
      }
      transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            logger.error(err)
            return err
        }
        logger.info(info);
      });

      res.send('Orden cargada.')
    }
    catch (err) {
        logger.error(err);
    }    
};

const borrar = async ( req, res, next ) => {     
  try {
       // Guardar la orden eliminada
      const { id } = req.params;  
      const orden = await Ordenes.findById(id); 

      // Eliminar la orden de la db y enviarlo como respuesta
      await Ordenes.findOneAndDelete({ _id: id }).then(()=>{
          res.send(orden); 
      });                      
  } catch (err) {
      logger.error(err);
  }
};

module.exports.listarId = listarId;
module.exports.listar = listar;
module.exports.agregar = agregar;
module.exports.borrar = borrar;