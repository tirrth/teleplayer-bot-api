var express = require("express");
const { v4: uuid } = require("uuid");
const multer = require("multer");
const { default: axios } = require("axios");
const { parse } = require("node-html-parser");
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/files");
  },
  filename: function (req, file, callback) {
    console.log({ ...req.body });
    callback(null, req.body?.file_unique_id || `${uuid()}`);
  },
});
const upload = multer({ storage });
const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "TelePlayer Bot" });
});

router.get("/get-stream-tape-url", (req, res, next) => {
  axios
    .get(req.query.url)
    .then((response) => {
      console.log(response);
      const doc = parse(response.data);
      res.status(200).send({
        response: {
          url: doc.querySelector("#videolink")?.textContent?.substr(2),
        },
      });
    })
    .catch((err) => {
      res.status(400).send({ err: err.response });
    });
});

router.post("/downloadPost", upload.single("file"), function (req, res) {
  res.status(200).send({ success: true });
});

router.get("/health-check", function (req, res, next) {
  res.render("health-check", { title: "TelePlayer Bot Health Check" });
});

module.exports = router;
