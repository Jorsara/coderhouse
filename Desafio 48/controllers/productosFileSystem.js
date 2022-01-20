const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser());
const { logger } = require("../logs/logConfig");
const fs = require("fs");

const persistenciaFileSystem = class persistenciaFileSystem {
  constructor() {
    (async () => {
      try {
        await fs.promises.readFile("./productos.json");
      } catch (err) {
        logger.error(err);
      }
    })();
  }
  vista = async (req, res, next) => {
    try {
      // Buscar todos los productos y parsearlos a json
      const data = await fs.promises.readFile("./productos.json");
      const json = JSON.parse(data.toString("utf-8"));

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
      const data = await fs.promises.readFile("./productos.json");
      const json = JSON.parse(data.toString("utf-8"));

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
      const data = await fs.promises.readFile("./productos.json");
      const json = JSON.parse(data.toString("utf-8"));
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
      const data = await fs.promises.readFile("./productos.json");
      const json = JSON.parse(data.toString("utf-8"));
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
        const data = await fs.promises.readFile("./productos.json");
        const json = JSON.parse(data.toString("utf-8"));
        json.push({ ...req.body, id: json.length + 1, timestamp: Date.now() });

        try {
          await fs.promises.writeFile(
            "./productos.json",
            JSON.stringify(json, null, "\t")
          );
          res.redirect("back");
        } catch (err) {
          logger.error(err);
        }
      } catch (err) {
        logger.error(err);
      }
    }
  };

  actualizar = async (req, res, next) => {
    try {
      const data = await fs.promises.readFile("./productos.json");
      const json = JSON.parse(data.toString("utf-8"));
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
      try {
        await fs.promises.writeFile(
          "./productos.json",
          JSON.stringify(json, null, "\t")
        );
        res.send(json[foundIndex]);
      } catch (err) {
        logger.error(err);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  borrar = async (req, res, next) => {
    try {
      const data = await fs.promises.readFile("./productos.json");
      const json = JSON.parse(data.toString("utf-8"));
      let foundIndex = json.findIndex((x) => x.id == req.params.id);
      prodEliminado = json[foundIndex];
      let jsonNuevo = json.filter((e) => {
        return e.id != req.params.id;
      });

      try {
        await fs.promises.writeFile(
          "./productos.json",
          JSON.stringify(jsonNuevo, null, "\t")
        );
        res.send(prodEliminado);
      } catch (err) {
        logger.error(err);
      }
    } catch (err) {
      logger.error(err);
    }
  };
};

module.exports.persistenciaFileSystem = persistenciaFileSystem;
