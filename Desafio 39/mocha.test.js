const assert = require('assert').strict;
const axios = require('axios');
describe("Manejar productos", function(){
    // Listar productos
    it('Listar productos', async function(){
        const productos = await axios('http://localhost:8080/productos/listar');
        console.log(productos.data);
        assert.notEqual(productos.data.length, 0);
    });

    // Agregar un producto de prueba y validar la respuesta
    it('Agregar producto', async function(){
        let producto;
        await axios.post('http://localhost:8080/productos/agregar', {
            "title": "Pizarra",
            "price": 2600,
            "thumbnail": "https://cdn3.iconfinder.com/data/icons/education-209/64/board-math-class-school-128.png",
            "timestamp": 1638115940827,
            "descripcion": "Lorem ipsum",
            "codigo": 36,
            "stock": 100
        }).then(response => {
            // Obtenemos los datos
            producto = response.data;
        })
        assert.match(producto.title, /Pizarra/);
    });
    
    // Actualizar producto
    it('Actualizar producto', async function(){
        let producto;
        await axios.put('http://localhost:8080/productos/actualizar/61a3aa64c10c62970b5b695d', {
            "price": 3500
        })
        .then(response => {
            // Obtenemos los datos
            producto = response.data;
            console.log(producto);
        })
        assert.equal(producto.price, 3500);
    });

    // Eliminar un producto
    it('Eliminar producto', async function(){
        let lengthOriginal;
        let lengthNuevo;
        await axios('http://localhost:8080/productos/listar').then(response => {
            // Obtenemos los datos
            lengthOriginal = response.data.items.length;
            console.log(`Cantidad original: ${lengthOriginal}`);
        });
        let producto;
        await axios.delete('http://localhost:8080/productos/borrar/61b0cee6674676b361224429')
        .then(response => {
            // Obtenemos los datos
            producto = response.data;
            console.log(producto);
        });
        await axios('http://localhost:8080/productos/listar').then(response => {
            // Obtenemos los datos
            lengthNuevo = response.data.items.length;
            console.log(`Cantidad nueva: ${lengthNuevo}`);
        });
        assert.notEqual(lengthOriginal, lengthNuevo);
    });
});