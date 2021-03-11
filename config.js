const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_API_SERVER: process.env.TELEGRAM_BOT_API_SERVER
};
