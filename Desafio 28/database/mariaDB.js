const options = {
    client:"mysql",
    connection:{
        port:3306,
        host:"127.0.0.1",
        user:"root",
        password:"",
        database:"coderhouse"
    },
    pool:{min:0,max:7}
}
module.exports = { options }