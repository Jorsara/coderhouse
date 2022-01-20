let json = [
  {
    title: "Gorro",
    price: 405,
    thumbnail:
      "https://cdn3.iconfinder.com/data/icons/education-209/64/graduation-square-academic-cap-school-128.png",
    id: 1,
    timestamp: 1632081103866,
    descripcion: "Lorem ipsum",
    codigo: 31,
    stock: 5,
    categoria: 2,
  },
  {
    title: "Reloj",
    price: 830,
    thumbnail:
      "https://cdn3.iconfinder.com/data/icons/education-209/64/clock-stopwatch-timer-time-128.png",
    id: 2,
    timestamp: 1632081103866,
    descripcion: "Lorem ipsum",
    codigo: 32,
    stock: 5,
    categoria: 2,
  },
  {
    title: "Calculadora",
    price: 350,
    thumbnail:
      "https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-128.png",
    id: 3,
    timestamp: 1632081103866,
    descripcion: "Lorem ipsum",
    codigo: 33,
    stock: 5,
    categoria: 3,
  },
];

const { logger } = require("../logs/logConfig");

const persistenciaMemory = class persistenciaMemory {
  constructor(){}

  vista = async (req, res, next) => {
    try {
      // Buscar todos los productos en la tabla y parsearlos a json
      let productos = {
        items: json,
        cantidad: 0,
      };
      productos.cantidad = productos.items.length;

      res.render("./layouts/index", { productos });
    } catch (err) {
      logger.error(err);
    }
  };

  listar = async (req, res, next) => {
    try {
      if (json.length > 0) {
        let productos = {
          items: json,
          cantidad: 0,
        };
        productos.cantidad = productos.items.length;
        res.send(productos);
      } else {
        res.send({ error: "No hay productos cargados." });
      }
    } catch (err) {
      logger.error(err);
    }
  };

  categoria = async (req, res, next) => {
    try {
      // Buscar el producto y mostrarlo
      const result = json.filter((product) => product.categoria == req.params.id);
      if (result.length > 0) {
        res.send(result);
      } else {
        res.send({ error: "Producto no encontrado." });
      }
    } catch (err) {
      logger.error(err);
    }
  };

  listarId = async (req, res, next) => {
    try {
      // Buscar el producto y mostrarlo
      const result = json.filter((product) => product.id == req.params.id);
      if (result.length > 0) {
        res.send(result[0]);
      } else {
        res.send({ error: "Producto no encontrado." });
      }
    } catch (err) {
      logger.error(err);
    }
  };

  agregar = async (req, res, next) => {
    const { title, descripcion, price, thumbnail, codigo, stock } = req.body;

    if (!title || !descripcion || !price || !thumbnail || !codigo || !stock) {
      res.json({
        message: "Le faltan campos al producto para poder ser cargado.",
      });
    } else {
      try {
        json.push({ ...req.body, id: json.length + 1, timestamp: Date.now() });
        res.redirect("back");
      } catch (err) {
        logger.error(err);
      }
    }
  };

  actualizar = async (req, res, next) => {
    try {
      let prodActualizado = req.body;
      prodActualizado.id = req.params.id;
      let foundIndex = json.findIndex((x) => x.id == req.params.id);

      if (prodActualizado.hasOwnProperty("title")) {
        json[foundIndex].title = prodActualizado.title;
      }
      if (prodActualizado.hasOwnProperty("price")) {
        json[foundIndex].price = prodActualizado.price;
      }
      if (prodActualizado.hasOwnProperty("thumbnail")) {
        json[foundIndex].thumbnail = prodActualizado.thumbnail;
      }
      if (prodActualizado.hasOwnProperty("descripcion")) {
        json[foundIndex].descripcion = prodActualizado.descripcion;
      }
      if (prodActualizado.hasOwnProperty("codigo")) {
        json[foundIndex].codigo = prodActualizado.codigo;
      }
      if (prodActualizado.hasOwnProperty("stock")) {
        json[foundIndex].stock = prodActualizado.stock;
      }

      // Enviar producto actualizado
      res.send(json[foundIndex]);
    } catch (err) {
      logger.error(err);
    }
  };

  borrar = async (req, res, next) => {
    try {
      // Guardar el producto eliminado
      let foundIndex = json.findIndex((x) => x.id == req.params.id);
      prodEliminado = json[foundIndex];

      // Eliminar el producto  y enviarlo como respuesta
      let jsonNuevo = json.filter((e) => {
        return e.id != req.params.id;
      });
      json = jsonNuevo;
      res.send(prodEliminado);
    } catch (err) {
      logger.error(err);
    }
  };
};

module.exports.persistenciaMemory = persistenciaMemory;
