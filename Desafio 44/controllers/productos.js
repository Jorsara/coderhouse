const { query } = require('express');
const { Producto } = require('../schemas/productos');
const { logger } = require('../logs/logConfig');
var { graphqlHTTP }  = require('express-graphql');
var { buildSchema } = require('graphql');
const axios = require('axios');

//const fetch = require("node-fetch");

/* Graphql */
// GraphQL schema
var schema = buildSchema(`
    type Query {
        productos: [Producto]
    },
    type Mutation {
        agregarProducto(
          title: String!,
          descripcion: String!, 
          price: Int!, 
          thumbnail: String!, 
          codigo: Int!, 
          stock: Int!
        ): Producto,
        actualizarProducto(
          _id: String!,
          title: String!,
          descripcion: String!, 
          price: Int!, 
          thumbnail: String!, 
          codigo: Int!, 
          stock: Int!
        ): Producto,
        borrarProducto(
          _id: String!,
        ): Producto
    },
    type Producto{
      _id: String
      title: String
      price: Int
      thumbnail: String
      timestamp: Int
      descripcion: String
      codigo: Int
      stock: Int
    }
`);

const listarProductos = async () => {   
  try{
    let json = await Producto.find();
    return json; 
  }catch (err) {
    logger.error(err);
  }
};

const agregarProducto = async ({title, descripcion, price, thumbnail, codigo, stock}) => {    
  let prod = {title, descripcion, price, thumbnail, codigo, stock};
  try{
    const producto = new Producto(prod);
    producto.timestamp = Date.now();
    await producto.save().then(e=>logger.info(e));
    return producto;                         
  }
  catch (err) {
      logger.error(err);
  }    
};

const actualizarProducto = async ({_id, title, descripcion, price, thumbnail, codigo, stock}) => {   
  const  id  = _id;
  // Buscar que valores actualizar y hacer update
    await Producto.updateOne( {_id: id}, {$set: {title : title}})
    await Producto.updateOne( {_id: id}, {$set: {price : price}})
    await Producto.updateOne( {_id: id}, {$set: {thumbnail : thumbnail}})
    await Producto.updateOne( {_id: id}, {$set: {descripcion : descripcion}})
    await Producto.updateOne( {_id: id}, {$set: {codigo : codigo}})
    await Producto.updateOne( {_id: id}, {$set: {stock : stock}})

  let prod = {title, descripcion, price, thumbnail, codigo, stock};
  try{
    const producto = new Producto(prod);
    producto.timestamp = Date.now();
    await producto.save().then(e=>logger.info(e));
    return producto;                         
  }
  catch (err) {
      logger.error(err);
  }    
};

const borrarProducto = async ({_id}) => {   
  try {
    // Guardar el producto eliminado 
    const producto = await Producto.findById(_id); 

    // Eliminar el producto de la db y enviarlo como respuesta
    await Producto.findOneAndDelete({ _id: _id }).then(()=>{
        return producto;
    });                      
  } catch (err) {
    console.log(err);
  }
};

// Root resolver
var root = {
    productos: listarProductos,
    agregarProducto: agregarProducto,
    actualizarProducto: actualizarProducto,
    borrarProducto: borrarProducto
};

const graphql = graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
});

/* Graphql */

const vista = async ( req, res, next ) => {
  // Buscar todos los productos en la tabla y parsearlos a json
  try {
    let body = {
      query: `
            { query:  productos {codigo, title, descripcion, price, stock, thumbnail}  }
          `,
    };
    let options = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let response = await axios.post(
      "http://localhost:8080/productos/graphql",
      body,
      options
    );
    let json = response.data.data.query;
    let productos = {
      items: json,
      cantidad: 0,
    };
    productos.cantidad = productos.items.length;

    res.render("./layouts/index", { productos });
  } catch (err) {
    console.log(err);
  }
}; 

const listar = async ( req, res, next ) => {   
  try {
    let body = {
      query: `
            { query:  productos {_id, codigo, title, descripcion, price, stock, thumbnail}  }
          `,
    };
    let options = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let response = await axios.post(
      "http://localhost:8080/productos/graphql",
      body,
      options
    );
    let json = response.data.data.query;
    if(json.length > 0){
      let productos = {
          items: json,
          cantidad: 0
      }
      productos.cantidad = productos.items.length;
      res.send(productos);
    }else{
        res.send({error : 'No hay productos cargados.'});
    }     
  } catch (err) {
    console.log(err);
  }  
};

const listarId = async ( req, res, next ) => {  
  try {
    const { id } = req.params;
    let body = {
      query: `
            { query:  productos(id_:${id}) {_id, codigo, title, descripcion, price, stock, thumbnail}  }
          `,
    };
    let options = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let response = await axios.post(
      "http://localhost:8080/productos/graphql",
      body,
      options
    );
    let json = response.data.data.query;

    if(json){
      res.send(json);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  } catch (err) {
    console.log(err);
  }   

};

const agregar = async (req, res, next) => {
  const { title, descripcion, price, thumbnail, codigo, stock } = req.body;

  if (!title || !descripcion || !price || !thumbnail || !codigo || !stock) {
    res.json({message: "Le faltan campos al producto para poder ser cargado."});
  } else {
    try {
      let body = {
        query: `
            mutation agregarProducto($title: String!, $descripcion: String!, $price: Int!, $thumbnail: String!, $codigo: Int!, $stock: Int!) {
              agregarProducto( title:$title, descripcion:$descripcion, price:$price, thumbnail:$thumbnail, codigo:$codigo, stock:$stock){
                  title
                  price
                  thumbnail
                  descripcion
                  codigo
                  stock
                }
            }
        `,
        variables: req.body,
      };
      let options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      await axios.post('http://localhost:8080/productos/graphql', body, options);

      res.redirect("back");
    } catch (err) {
      console.log(err);
    }
  }
};

const actualizar = async ( req, res, next ) => {   
    try {
      let body = {
        query: `
            mutation actualizarProducto($_id: String!, $title: String!, $descripcion: String!, $price: Int!, $thumbnail: String!, $codigo: Int!, $stock: Int!) {
              actualizarProducto(_id:$_id, title:$title, descripcion:$descripcion, price:$price, thumbnail:$thumbnail, codigo:$codigo, stock:$stock){
                  _id
                  title
                  price
                  thumbnail
                  descripcion
                  codigo
                  stock
                }
            }
        `,
        variables: req.body,
      };
      let options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      let response = await axios.post('http://localhost:8080/productos/graphql', body, options);
      let json = response.data.data.query;

      res.send(json);
    } catch (err) {
      console.log(err);
    }
};

const borrar = async ( req, res, next ) => {  
  const { id } = req.params;    
  try {
    let body =  { 
        query: `
            mutation borrarProducto($_id: String!) {
                borrarProducto( _id: $_id){
                    _id
                    title
                    price
                    thumbnail
                    descripcion
                    codigo
                    stock
                }
            }
        `, 
        variables: {
            _id: id
        }
    }
    let options = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    let response = await axios.post('http://localhost:8080/productos/graphql', body, options);
    let json = response.data.data.query;

    res.send(json);
  }
  catch(error) {
      console.error(error)
  } 
};

// Buscar por nombre
const buscarNombre = async ( req, res, next ) => {       
  try{
    // Buscar el producto y mostrarlo
    const producto = await Producto.find({ title: { $eq: req.query.title } });
    if(producto.length > 0){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    logger.error(err);
  }  
};

// Buscar por codigo
const buscarCodigo = async ( req, res, next ) => {       
  try{
    // Buscar el producto y mostrarlo
    const producto = await Producto.find({ codigo: { $eq: req.query.codigo } });
    if(producto.length > 0){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    logger.error(err);
  }  
};

// Buscar por precio
const buscarPrecio = async ( req, res, next ) => {       
  try{
    // Buscar el producto y mostrarlo
    const producto = await Producto.find({ price: { $gt: req.query.minimo, $lt: req.query.maximo } });
    if(producto.length > 0){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    logger.error(err);
  }  
};

// Buscar por stock
const buscarStock = async ( req, res, next ) => {       
  try{
    // Buscar el producto y mostrarlo
    const producto = await Producto.find({ stock: { $gt: req.query.minimo, $lt: req.query.maximo } });
    if(producto.length > 0){
      res.send(producto);
    }else{
        res.send({error : 'Producto no encontrado.'});
    }
  }catch (err) {
    logger.error(err);
  }  
};

module.exports.listarId = listarId;
module.exports.listar = listar;
module.exports.vista = vista;
module.exports.agregar = agregar;
module.exports.actualizar = actualizar;
module.exports.borrar = borrar;
module.exports.buscarNombre = buscarNombre;
module.exports.buscarCodigo = buscarCodigo;
module.exports.buscarPrecio = buscarPrecio;
module.exports.buscarStock = buscarStock;
module.exports.graphql = graphql;