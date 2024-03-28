const fs = require("fs");
const timeLog = require("./time-log.js")
// const path = require("path");

module.exports = (sourcePath, destinationPath) => {
  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error(`copy ${sourcePath} failed`, err);
    } else {
      timeLog(`${sourcePath} has copied`);
    }
  });
};
