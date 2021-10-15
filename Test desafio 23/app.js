let mensajes = require('./mensajes.json');
let {normalize,schema} = require('normalizr');

const author = new schema.Entity('authors');
const text = new schema.Entity('texts');
const chatSchema = new schema.Entity('chat',{
   author: author,
   text
}, { idAttribute: '_id' });

const normalizedData = normalize(mensajes, Array.of(chatSchema))
console.log(JSON.stringify(normalizedData))