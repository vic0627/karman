const http = require("http");
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");
const socket = require("socket.io");
const rollupBuild = require("./rollup/rollup-bundle.js");
const ansi = require("./utils/ansi.js");
const timeLog = require("./utils/time-log.js");

const PORT = process.argv[2] || 5678;
const URL = `http://localhost:${PORT}/`;

const getPath = (...paths) => path.resolve(__dirname, ...paths);

const init = async () => {
  try {
    timeLog("start dev:browser...");

    await rollupBuild();

    const server = http.createServer((req, res) => {
      const filePath = req.url === "/" ? "./index.html" : req.url.includes("/dist") ? "../.." + req.url : "." + req.url;
      const fullPath = getPath("../demo/browser", filePath);

      const contentType = { "Content-Type": "text/plain" };
      const fileType = fullPath.split(".").at(-1);

      switch (fileType) {
        case "js":
          contentType["Content-Type"] = "application/javascript";
          break;
        case "css":
          contentType["Content-Type"] = "text/css";
          break;
        case "html":
          contentType["Content-Type"] = "text/html";
          break;
      }

      fs.readFile(fullPath, (err, data) => {
        let statusCode = 200;
        let _data = data;

        if (err) {
          statusCode = 404;
          _data = "Not Found";
        }

        res.writeHead(statusCode, contentType);
        res.end(data);
      });
    });

    server.listen(PORT, () => {
      timeLog("browser server is running at " + ansi.color("cyanBlue", URL));
    });

    const io = socket(server);

    const watcher = chokidar.watch([getPath("../example/browser"), getPath("../src")]);

    let connect, socketEvent;

    io.on("connection", (e) => {
      if (!connect) {
        timeLog(ansi.success("dev:browser HMR ready"));
        connect = true;
      }

      socketEvent = e;
    });

    watcher.on("change", async (path) => {
      if (!socketEvent) return;

      timeLog(`file ${ansi.color("cyanBlue", path)} has changed. reloading...`);

      try {
        if (path.includes('src')) await rollupBuild();

        await socketEvent.emit("reload");

        timeLog(ansi.success("dev:browser reloaded"));
        timeLog("waiting for changes...");
      } catch (error) {
        console.error("reload failed", error);
      }
    });
  } catch (error) {
    console.error("start dev:browser failed", error);
  }
};

init();
