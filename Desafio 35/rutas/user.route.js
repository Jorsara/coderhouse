const express = require('express');
//const router = express();
const router = express.Router();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Usuario } = require('../schemas/usuario');
const nodemailer = require('nodemailer')
let nombreUsuario = { username:'Desconocido'};

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'virginie.hayes51@ethereal.email',
        pass: '41RySjypAAsNXSTcY3'
    },
    tls: {
        rejectUnauthorized: false
    }
});
const transporterGmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'drunkartp5@gmail.com',
        pass: 'kqdcrkwptgmionow'
    },
    tls: {
        rejectUnauthorized: false
    }
});

passport.use('login', new LocalStrategy({
    passReqToCallback:true    
    },
    async function (req,username,password,done){
        try{
            let usuarios = await Usuario.find();
            let user = usuarios.find(usuario => usuario.username == username);
            nombreUsuario = user;
            console.log(user);
            if (!user) return done(null,false)
            let success = user.username == username && user.password == password;
            if (!success) return done(null,false)
            user.count = 0;
            return done(null,user);                  
        }
        catch (err) {
            console.log(err);
        }    
    })
);
passport.use('register', new LocalStrategy({
    passReqToCallback:true    
    },
    function  (req,username,password,done){
       createUser = async function(){
        try{
            let usuario = new Usuario(req.body);
            let usuarios = await Usuario.find();
            let usuarioE = usuarios.filter(usuario => usuario.username == username).length;
            if(usuarioE) return done(null,false);
            usuario.username = username;
            usuario.password = password;
            await usuario.save().then(e=>console.log(e));      
            return done(null,usuario);               
        }
        catch (err) {
            console.log(err);
        }    
     }
       process.nextTick(createUser);
    })
);
passport.serializeUser(function(user,done){
    done(null,user.username)
})
passport.deserializeUser(async function(username,done){
    try{
        let usuarios = await Usuario.find();
        let usuario = usuarios.find(usuario => usuario.username == username);
        done(null,usuario);
    }catch (err) {
        console.log(err);
    }  
})
router.use(cookieParser())
router.use(session({
    secret:'89s89dsd',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:60000
    }
}))
router.use(passport.initialize());
router.use(passport.session());
router.use(express.json());
router.use(express.text());
router.use(express.urlencoded({extended:true}));

router.get('/',(req,res)=>{
    if (req.isAuthenticated())
        res.redirect('/user/datos')
    else
        res.redirect('/user/login')
})
router.get('/info',(req,res)=>{
    res.json(usuarios);
})
router.get('/my-session',(req,res)=>{
    res.send(req.session);
})
router.get('/datos',(req,res)=>{
    if (req.isAuthenticated()){
        let currentDate = new Date(); 
        let userName = nombreUsuario.username || 'Desconocido';
        const mail = `Gracias por logerate ${userName} a las ${currentDate}`;
        const mailOptions = {
            from: 'Codehouse',
            to: ['virginie.hayes51@ethereal.email'],
            subject: 'Notificación de Login',
            html: mail
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if(err) {
                console.log(err)
                return err
            }
            console.log(info)
        });    
        transporterGmail.sendMail(mailOptions, (err, info) => {
            if(err) {
                console.log(err)
                return err
            }
            console.log(info)
        });
            
        if (!req.user.count) req.user.count  = 0;
        req.user.count++;
        res.send('Estas autenticado')
    }else
    res.redirect('/user/login')
})

router.get('/register',(req,res)=>{
    if (req.isAuthenticated())
        res.redirect('/user/datos')
    else
        res.render('layouts',{layout: 'register'});
})
router.get('/login',(req,res)=>{
    if (req.isAuthenticated())        
        res.redirect('/user/datos')
    else
        res.render('layouts',{layout: 'login'});
})
router.get('/logout',(req,res)=>{
    let currentDate = new Date(); 
    let userName = nombreUsuario.username || 'Desconocido';
    const mail = `Gracias por hacer logout ${userName} a las ${currentDate}`;
    const mailOptions = {
        from: 'Codehouse',
        to: ['virginie.hayes51@ethereal.email'],
        subject: 'Notificación de Logout',
        html: mail
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log(err)
            return err
        }
        console.log(info)
    });

    req.logout();
    res.redirect('/user')
})

router.post('/login',passport.authenticate('login',{failureRedirect:'/user/error-login'}), (req,res)=>{
    res.redirect('/user')
})
router.post('/register',passport.authenticate('register',{failureRedirect:'/user/error-register'}),(req,res)=>{
    //res.redirect('/user')
    res.send('Registro exitoso.')
})
router.get('/error-login',(req,res)=>{
    res.send('Error al loguearse');
})
router.get('/error-register',(req,res)=>{
    res.send('Error al registrarse');
})

function checkIsLogin(req,res,next){
    if (req.isAuthenticated())
        next()
    else
        res.redirect('/login')
}
router.get('/hide',checkIsLogin,(req,res)=>{
    res.send('Soy una ruta protegida....');
})

module.exports = router;