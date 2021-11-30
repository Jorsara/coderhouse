const mongoose = require('mongoose');
const { logger } = require('../logs/logConfig');

const ConnectionToDatabase = async () => {
  try {
    await mongoose.connect("mongodb+srv://root:root@cluster0.lcrh5.mongodb.net/test", {});
    logger.info("Database Connected");
  } catch (error) {
    logger.error(error)
    //throw new Error();
  }
};

module.exports.connect = ConnectionToDatabase;

