const fs = require("fs");
// const path = require("path");

module.exports = (sourcePath, destinationPath) => {
  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error("複製檔案時發生錯誤:", err);
    } else {
      console.log("檔案已成功複製");
    }
  });
};
