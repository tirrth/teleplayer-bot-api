var express = require("express");
const { v4: uuid } = require("uuid");
const puppeteer = require("puppeteer");
const multer = require("multer");
var https = require("https");
var fs = require("fs");
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
const got = require("got");
const upload = multer({ storage });
const router = express.Router();
const cp = require("child_process");

// var readStream = createReadStream(
//   __dirname + "/../public/files/AgADGgIAAuavQFY.mp4"
// );
// readStream.on("data", (data) => {
//   res.write(data);
// });
// readStream.on("end", (data) => {
//   res.status(200).send();
// });

// ------------ References ------------ //
// https://betterprogramming.pub/video-stream-with-node-js-and-html5-320b3191a6b6
// https://youtu.be/ZjBLbXUuyWg

// app.get('/video', function(req, res) {
//   const path = 'assets/sample.mp4'
//   const stat = fs.statSync(path)
//   const fileSize = stat.size
//   const range = req.headers.range
//   if (range) {
//     const parts = range.replace(/bytes=/, "").split("-")
//     const start = parseInt(parts[0], 10)
//     const end = parts[1]
//       ? parseInt(parts[1], 10)
//       : fileSize-1
//     const chunksize = (end-start)+1
//     const file = fs.createReadStream(path, {start, end})
//     const head = {
//       'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//       'Accept-Ranges': 'bytes',
//       'Content-Length': chunksize,
//       'Content-Type': 'video/mp4',
//     }
//     res.writeHead(206, head);
//     file.pipe(res);
//   } else {
//     const head = {
//       'Content-Length': fileSize,
//       'Content-Type': 'video/mp4',
//     }
//     res.writeHead(200, head)
//     fs.createReadStream(path).pipe(res)
//   }
// });

const downloadFileWithHTTPS = function (url, dest, callback) {
  var file = fs.createWriteStream(dest);
  const httpsRequest = https.get(url, (response) => {
    if (response.statusCode != 200) {
      return callback({ err: "Response status was " + response.statusCode });
    }
    response.pipe(file);

    // close() is async, call cb after close completes.
    file.on("finish", function () {
      file.close(
        callback({
          success: true,
          message: "File downloaded Successfully.",
        })
      );
    });
  });

  httpsRequest.on("error", function (err) {
    // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (callback) {
      return callback(err);
    }
  });

  file.on("error", (err) => {
    // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (callback) {
      return callback(err);
    }
  });
};

const downloadFileWithCurl = async function (uri, filename) {
  let command = `curl ${uri} -o ${filename}`;
  cp.execSync(command);
};

const _getStreamtapeVideoUrl = async (streamtape_video_link) => {
  // --------------------------------------------- puppeteer web-scrapper implementation ---------------------------------------------- //
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(streamtape_video_link);
  const [el] = await page.$x('//*[@id="videolink"]');
  const textContent = await page.evaluate((el) => el.textContent, el);
  await browser.close();
  const url = `https://www.${textContent?.substr(2)}`;
  return axios.head(url);
};

router.get("/", function (req, res, next) {
  res.render("index", { title: "TelePlayer Bot" });
});

router.get("/play-video", function (req, res, next) {
  res.render("stream-tape-video", { url: req.query?.url });
});

router.get("/play-remote-video", function (req, res, next) {
  got.stream(req.query?.rvu).pipe(res);
});

router.get("/get-streamtape-video-url", async (req, res, next) => {
  _getStreamtapeVideoUrl(req.query?.url)
    .then((response) => {
      res.status(200).send({
        success: true,
        streamtape_video_url: `${req.protocol}://${
          req.headers.host
        }/play-remote-video?rvu=${encodeURI(
          response.request?.res?.responseUrl
        )}`,
      });
    })
    .catch((err) => {
      res.status(400).send({ err, success: false });
    });
});

router.get("/play-streamtape-video", async (req, res, next) => {
  _getStreamtapeVideoUrl(req.query?.url)
    .then((response) => {
      got.stream(response.request?.res?.responseUrl).pipe(res);

      // --------------------- download file using https core module --------------------- //
      // downloadFileWithHTTPS(
      //   response.request?.res?.responseUrl,
      //   __dirname + "/../public/stylesheets/hey.mp4",
      //   (response) => {
      //     res.status(200).send({ url, ...response });
      //   }
      // );

      // --------------------- download file using child_process core module (Keeping it here just for learning purpose) --------------------- //
      // await downloadFileWithCurl(
      //   response.request?.res?.responseUrl,
      //   __dirname + "/../public/stylesheets/hey.mp4"
      // );
      // res.status(200).send({ url });
    })
    .catch((err) => {
      res.status(400).send({ err, success: false });
    });
});

router.post("/downloadPost", upload.single("file"), function (req, res) {
  res.status(200).send({ success: true });
});

router.get("/health-check", function (req, res, next) {
  res.render("health-check", { title: "TelePlayer Bot Health Check" });
});

module.exports = router;
