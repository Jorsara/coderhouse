const axios = require('axios');

const listarProductos = () => {
axios('http://localhost:8080/productos/listar')
.then(response => {
    // Obtenemos los datos
    let fyh = response.data
    console.log(fyh);
})
.catch(error => {
  console.log(error)
})
}
listarProductos();

const agregarProducto = () => {
  axios.post('http://localhost:8080/productos/agregar', {
    "title": "Pizarra",
    "price": 2600,
    "thumbnail": "https://cdn3.iconfinder.com/data/icons/education-209/64/board-math-class-school-128.png",
    "timestamp": 1638115940827,
    "descripcion": "Lorem ipsum",
    "codigo": 36,
    "stock": 100
  })
  .then(response => {
      // Obtenemos los datos
      console.log(response.data);
  })
  .catch(error => {
    console.log(error)
  })
}
agregarProducto();

const actualizarProducto = () => {
  axios.put('http://localhost:8080/productos/actualizar/61a3aa64c10c62970b5b695d', {
    "price": 3000,
    "stock": 90
  })
  .then(response => {
      // Obtenemos los datos
      console.log(response.data);
  })
  .catch(error => {
    console.log(error)
  })
}
actualizarProducto();

const borrarProducto = () => {
  axios.delete('http://localhost:8080/productos/borrar/61b0cefb674676b361224431')
  .then(response => {
      // Obtenemos los datos
      console.log(response.data);
  })
  .catch(error => {
    console.log(error)
  })
}
borrarProducto();

