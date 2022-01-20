const express = require('express');
const router = express.Router();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Usuario } = require('../schemas/usuario');
const { logger } = require('../logs/logConfig');

passport.use('login', new LocalStrategy({
    passReqToCallback:true    
    },
    async function (req,username,password,done){
        try{
            let usuarios = await Usuario.find();
            let user = usuarios.find(usuario => usuario.username == username);
            nombreUsuario = user;
            if (!user) return done(null,false)
            let success = user.username == username && user.validPassword(password);
            if (!success) return done(null,false)
            user.count = 0;
            return done(null,user);                  
        }
        catch (err) {
            logger.error(err);
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
            usuario.setPassword(req.body.password); 
            await usuario.save().then(e=>logger.info(e));      
            return done(null,usuario);               
        }
        catch (err) {
            logger.error(err);
        }    
     }
       process.nextTick(createUser);
    })
);
passport.serializeUser(function(user,done){
    done(null,user.username)
});
passport.deserializeUser(async function(username,done){
    try{
        let usuarios = await Usuario.find();
        let usuario = usuarios.find(usuario => usuario.username == username);
        done(null,usuario);
    }catch (err) {
        logger.error(err);
    }  
});
router.use(cookieParser());
router.use(session({
    secret:'89s89dsd',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:60000
    }
}));
router.use(passport.initialize());
router.use(passport.session());
router.use(express.json());
router.use(express.text());
router.use(express.urlencoded({extended:true}));

const { user, registerGet, loginGet, logoutGet, logErrorGet, regErrorGet, loginPost, registerPost } = require('../controllers/user');

router.get('/', user);
router.get('/register', registerGet);
router.get('/login', loginGet);
router.get('/logout', logoutGet);
router.get('/error-login', logErrorGet);
router.get('/error-register', regErrorGet);

router.post('/login', passport.authenticate('login',{failureRedirect:'/error-login'}), loginPost);
router.post('/register', passport.authenticate('register',{failureRedirect:'/error-register'}), registerPost);

module.exports = router;