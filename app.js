var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Need to set NTBA_FIX_319 to true as an environment variable to fix the warning ===> node-telegram-bot-api deprecated Automatic enabling of cancellation of promises is deprecated. In the future, you will have to enable it yourself. See https://github.com/yagop/node-telegram-bot-api/issues/319. internal/modules/cjs/loader.js:1063:30
const { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_API_SERVER } = require("./config");
const TelegramBot = require("node-telegram-bot-api");

// Replace the value below with the Telegram token you receive from @BotFather
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
  polling: true,
  baseApiUrl: TELEGRAM_BOT_API_SERVER,
});

// Listen for any kind of message. There are different kinds of messages.
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  // console.log("----------------------");
  console.log(msg);
  bot.sendMessage(chatId, `${chatId} Received your message before file`);
  // console.log("----------------------");
  // bot.sendDocument(chatId, 'BQACAgUAAxkBAAMwYEjEVPwi3vMRD8tqM06Bq6DwMVcAAhoCAALmr0BWNwaUwVQk_VgeBA');
  // BQACAgUAAxkBAAMwYEjEVPwi3vMRD8tqM06Bq6DwMVcAAhoCAALmr0BWNwaUwVQk_VgeBA - 54 mb
  // BQACAgEAAxkBAAIBX2BNgF51dkuITqjo8FVuc3P-zhTLAAILAAOLxPlHlYIOj8IEIeAeBA - 300mb
  // BAACAgUAAxkBAAPrYEn3HsNxhFOvh-w6DJfHKms0t7AAAm8LAAKmlVFWOb4AAYv-3A4-HgQ - 3.5mb
  // BQACAgQAAxkBAAIB92BYl-RV3jRKMQu0nzkKUrySiVGqAAI3AgAC8kY4UqTuVcy7pKYvHgQ
  await bot
    .getFile(
      "BQACAgUAAxkBAAMwYEjEVPwi3vMRD8tqM06Bq6DwMVcAAhoCAALmr0BWNwaUwVQk_VgeBA"
    )
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

  // bot.downloadFile("")
  // `${this.options.baseApiUrl}/file/bot${this.token}/${resp.file_path}`
  // bot.downloadFile('BQACAgEAAxkBAAOsYEnmYBYf02qlhXbyD_DPBZHmkFsAAgsAA4vE-UeVgg6PwgQh4B4E', './public/files').then(res => console.log(res)).catch(err => console.log(err));
  bot.sendMessage(chatId, `${chatId} Received your message after file`);
  // bot.sendAnimation(chatId, 'https://media3.giphy.com/media/ZBQhoZC0nqknSviPqT/giphy.gif?cid=ecf05e47ria5x2m9p3yr98kbgt5fvai1kyprbe6n6p95mpna&rid=giphy.gif');

  // bot.deleteMessage()
});

module.exports = app;
