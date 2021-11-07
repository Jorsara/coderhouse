const mongoose = require('mongoose');

const ConnectionToDatabase = async () => {
  try {
    await mongoose.connect("mongodb://pepe:asd456@localhost:27017/ecommerce", {});
    console.log("Database Connected");
  } catch (error) {
    throw new Error();
  }
};

module.exports.connect = ConnectionToDatabase;

