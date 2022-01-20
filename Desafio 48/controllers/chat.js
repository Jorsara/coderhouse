const { logger } = require("../logs/logConfig");

const chat = async (req, res, next) => {
    const chat = true;
    try {
      res.render("./layouts/chat", {chat});
    } catch (err) {
      logger.error(err);
    }
};

module.exports.chat = chat;
