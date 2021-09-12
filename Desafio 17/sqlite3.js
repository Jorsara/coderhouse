const options = {
    client:'sqlite3',
    connection:{
        filename: './db/mensajes.sqlite'
    },
    useNullAsDefault:true
}
module.exports = { options }