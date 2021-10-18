const express = require('express');
const router = express.Router();
const session = require('express-session');

router.get('/login', async ( req, res) => {     
    const {nombre} = req.query;
    var date = new Date();
    date.setTime(date.getTime() + (60 * 1000));
    if (nombre){
        req.session.userName = nombre;
        res.render('layouts',{layout: 'user', locals: {userName:nombre}});
    }
    if(req.session.userName){     
        res.render('layouts',{layout: 'user', locals: {userName:req.session.userName}});
    }
    else{
        res.render('layouts',{layout: 'user'});
    }
}); 

router.get('/logout', async ( req, res) => {     
    if (req.session.userName){
        let nombre = req.session.userName;
        req.session.destroy((err) => {
            if (!err) res.render('layouts',{layout: 'user-logout', locals: {userName:nombre}});
            else res.send({ error: err });
        });
    }
    else res.send({error:'no hay usuario logeado'})
}); 

module.exports = router;