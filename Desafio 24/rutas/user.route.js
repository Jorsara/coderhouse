const express = require('express');
const router = express.Router();

router.get('/login', async ( req, res) => {     
    const {nombre} = req.query;
    var date = new Date();
    date.setTime(date.getTime() + (60 * 1000));
    if (nombre){
        res.cookie('userName',nombre, {expires:date}).render('layouts',{layout: 'user', locals: {userName:nombre}});
    }
    if(req.cookies.userName){        
        res.render('layouts',{layout: 'user', locals: {userName:req.cookies.userName}});
    }
    else{
        res.render('layouts',{layout: 'user'});
    }
}); 

router.get('/logout', async ( req, res) => {     
    if (req.cookies.userName){
        let nombre = req.cookies.userName;
        res.clearCookie('userName').render('layouts',{layout: 'user-logout', locals: {userName:nombre}});
    }
    else res.send({error:'no hay usuario logeado'})
}); 

module.exports = router;