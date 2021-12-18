const { persistenciaMemory } = require('./productosMemory.js');
const { persistenciaFileSystem } = require('./productosFileSystem.js');
const { persistenciaMongo } = require('./productosMongoDB.js');
const config = require('../config.js');

class FactoryProductos {
    static set(opcion) {
        console.log('**** PERSISTENCIA SELECCIONADA **** [' + opcion + ']')
        switch(opcion) {
            case 'Mem': return new persistenciaMemory()
            case 'File': return new persistenciaFileSystem()
            case 'Mongo': return new persistenciaMongo()
        }
    }
}

const opcion = config.PERSISTENCIA || 'Mongo'
const model = FactoryProductos.set(opcion);
module.exports.model = model;