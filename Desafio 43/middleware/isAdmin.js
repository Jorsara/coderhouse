const admin = true;
 const isAdmin = (req, res, next) => {
    if(admin){
        next()
    }else{
        throw new Error('Necesitas ser administrador para acceder a este metodo.')
    }
}

module.exports = isAdmin;
