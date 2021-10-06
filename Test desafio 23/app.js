let mensajes = require('./mensajes.json');
let {normalize,schema} = require('normalizr');

const author = new schema.Entity('authors');
const text = new schema.Entity('texts');
const chatSchema = new schema.Entity('chat',{
   authors: [author],
   text
});

const normalizedData = normalize(mensajes, chatSchema);
console.log(JSON.stringify(normalizedData))