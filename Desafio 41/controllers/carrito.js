const { Carrito } = require('../schemas/carrito');
const { logger } = require('../logs/logConfig');
const accountSid = 'AC6cf57fa1b040c87ca2c7cbac3165dc6a';
const authToken = '38f585292533847c68046de4bd273d68';
const client = require('twilio')(accountSid, authToken);
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

      let result = carrito.productos.map(a => a.title);
      let productosMail = '';
      result.forEach(e => {
        productosMail = productosMail + `<p>${e}</p>`
      });

      //Mandar mail y whatsapp al administrador    
      const mail = `
                    <p><b>Nuevo pedido:</b></p>                    
                    <p>Nombre:</p>
                    <p>Email:</p><br>
                    <p><b>Productos</b></p>
                    ${productosMail}
      `;
      const mailOptions = {
        from: 'Coderhouse',
        to: ['nicholaus.kuhlman85@ethereal.email'],
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

      client.messages.create({
        body: `Nuevo pedido de...`,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+5492914421609'
      })
      .then(message => logger.info(message.sid))
      .catch(console.error);

      // SMS al usuario
      client.messages.create({
        body: `Su pedido fue recibido y se encuentra en camino`,
        from: '+18509044560',
        to: '+542914421609'
    })
    .then(message => logger.info(message.sid))
    .catch(console.error); 

      res.redirect('back');                         
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

module.exports.listarId = listarId;
module.exports.listar = listar;
module.exports.agregar = agregar;
module.exports.borrar = borrar;