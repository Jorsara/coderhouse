const { Usuario } = require('../schemas/usuario');
const nodemailer = require('nodemailer');
const { logger } = require('../logs/logConfig');

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

const user = async(req,res)=>{
    try{    
        if (req.isAuthenticated()){
        let usuario = await Usuario.find({'username': req.session.passport.user}).lean();
        usuario = usuario[0];
        //res.render('layouts',{usuario, layout: 'user'});}
        res.redirect('/productos/vista')
    }
    else
        res.redirect('/login')
    }
    catch(err){
        logger.error(err);
    }
}
const registerGet = (req,res)=>{
    if (req.isAuthenticated())
        res.redirect('/');
    else
        res.render('layouts',{layout: 'register'});
}
const loginGet = (req,res)=>{
    if (req.isAuthenticated()) 
        res.redirect('/');
    else
        res.render('layouts',{layout: 'login'});
}
const logoutGet = (req,res)=>{
    req.logout();
    res.redirect('/')
}
const logErrorGet = (req,res)=>{
    res.send('Error al loguearse');
}
const regErrorGet = (req,res)=>{
    res.send('Error al registrarse');
}

const loginPost = (req,res)=>{
    res.redirect('/')
}
const registerPost = (req,res)=>{
    let user = req.body;
    const mail = `
                    <p>Se registro un nuevo usuario con los siguientes datos:</p>
                    <p>Email: ${user.username}</p>
                    <p>Nombre: ${user.nombre}</p>
                    <p>Dirección: ${user.direccion}</p>
                    <p>Edad: ${user.edad}</p>
                    <p>Teléfono: ${user.telefono}</p>
    `;
    const mailOptions = {
        from: 'Coderhouse',
        to: ['nicholaus.kuhlman85@ethereal.email'],
        subject: 'Nuevo registro',
        html: mail
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            logger.error(err)
            return err
        }
        logger.info(info);
    });
    res.redirect('/');
}

module.exports.user = user;
module.exports.registerGet = registerGet;
module.exports.loginGet = loginGet;
module.exports.logoutGet = logoutGet;
module.exports.logErrorGet = logErrorGet;
module.exports.regErrorGet = regErrorGet;
module.exports.loginPost = loginPost;
module.exports.registerPost = registerPost;