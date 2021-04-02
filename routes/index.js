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
const upload = multer({ storage });
const router = express.Router();

// var readStream = createReadStream(
//   __dirname + "/../public/files/AgADGgIAAuavQFY.mp4"
// );
// readStream.on("data", (data) => {
//   res.write(data);
// });
// readStream.on("end", (data) => {
//   res.status(200).send();
// });

// https://betterprogramming.pub/video-stream-with-node-js-and-html5-320b3191a6b6

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

router.get("/", function (req, res, next) {
  res.render("index", { title: "TelePlayer Bot" });
});

var download = function (url, dest, callback) {
  var file = fs.createWriteStream(dest);
  return https
    .get(url, function (response) {
      response.pipe(file);
      file.on("finish", function () {
        file.close(
          callback({
            success: true,
            message: "File downloaded Successfully.",
            url,
          })
        ); // close() is async, call cb after close completes.
      });
    })
    .on("error", function (err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (callback) callback(err.message);
    });
};

router.get("/get-stream-tape-url", async (req, res, next) => {
  // --------------------------------------------- using web-scrapper ---------------------------------------------- //
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(req.query?.url);
  const [el] = await page.$x('//*[@id="videolink"]');
  const textContent = await page.evaluate((el) => el.textContent, el);
  await browser.close();

  const url = `https://www.${textContent?.substr(2)}`;
  axios
    .head(url)
    .then((response) => {
      download(
        response.request?.res
          ?.responseUrl /* "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" */,
        __dirname + "/../public/stylesheets/hey.mp4",
        (response) => {
          res.status(200).send({ url, response });
        }
      );
    })
    .catch((err) => {
      res.status(400).send({ err, success: false });
    });

  // --------------------------------------------- using HTTP request ---------------------------------------------- //
  // axios
  //   .get(req.query?.url)
  //   .then((response) => {
  //     // console.log(response);
  //     const doc = parse(response.data);
  //     res.status(200).send({
  //       response: {
  //         url: `https://www.${doc
  //           .querySelector("#videolink")
  //           ?.textContent?.substr(2)}`,
  //       },
  //     });
  //   })
  //   .catch((err) => {
  //     res.status(400).send({ err: err.response });
  //   });
});

router.get("/play-stream-tape-video", async (req, res, next) => {
  // let movieStream = fs.createReadStream(req.query?.path);
  // movieStream.on("open", function () {
  //   res.writeHead(206, {
  //     "Content-Range": "bytes " + start + "-" + end + "/" + total,
  //     "Accept-Ranges": "bytes",
  //     "Content-Length": chunksize,
  //     "Content-Type": "video/mp4",
  //   });
  //   // This just pipes the read stream to the response object (which goes
  //   //to the client)
  //   movieStream.pipe(res);
  // });
  // movieStream.on("error", function (err) {
  //   res.end(err);
  // });
  // var fileUrl = req.query?.path;
  // var range = req?.headers.range;
  // var positions, start, end, total, chunksize;
  // // HEAD request for file metadata
  // request(
  //   {
  //     url: fileUrl,
  //     method: "HEAD",
  //   },
  //   function (error, response, body) {
  //     console.log(response, fileUrl);
  //     setResponseHeaders(response.headers);
  //     pipeToResponse();
  //   }
  // );
  // function setResponseHeaders(headers) {
  //   positions = range.replace(/bytes=/, "").split("-");
  //   start = parseInt(positions[0], 10);
  //   total = headers["content-length"];
  //   end = positions[1] ? parseInt(positions[1], 10) : total - 1;
  //   chunksize = end - start + 1;
  //   res.writeHead(206, {
  //     "Content-Range": "bytes " + start + "-" + end + "/" + total,
  //     "Accept-Ranges": "bytes",
  //     "Content-Length": chunksize,
  //     "Content-Type": "video/mp4",
  //   });
  // }
  // function pipeToResponse() {
  //   var options = {
  //     url: fileUrl,
  //     headers: {
  //       range: "bytes=" + start + "-" + end,
  //       connection: "keep-alive",
  //     },
  //   };
  //   request(options).pipe(res);
  // }
  // axios
  //   .head(
  //     "https://www.streamtape.com/get_video?id=qro9VX69Jrszp71&expires=1617411573&ip=F0OPKRgOKxSHDN&token=lIOWHKeLrfzZ"
  //   )
  //   .then((res) => console.log(res))
  //   .catch((err) => console.log("Error => ", err));
  // res.render("video", { url: req.query?.path });
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.goto(
  //   "https://www.streamtape.com/get_video?id=qro9VX69Jrszp71&expires=1617434580&ip=F0OPKRgOKxSHDN&token=9QDZaBAq6uzZ"
  // );
  // await browser.close();
  // res.status(200).send({ success: true });
});

router.post("/downloadPost", upload.single("file"), function (req, res) {
  res.status(200).send({ success: true });
});

router.get("/health-check", function (req, res, next) {
  res.render("health-check", { title: "TelePlayer Bot Health Check" });
});

module.exports = router;
