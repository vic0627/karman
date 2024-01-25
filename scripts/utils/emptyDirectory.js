const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const timeLog = require("../utils/timeLog.js");
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

const protectedPaths = ["src", ".husky", ".git", "docs", "example", "scripts"];
const protectedFiles = [
  ".eslintrc.cjs",
  ".gitignore",
  ".prettierignore",
  ".prettierrc",
  "babel.config.js",
  "jest.config.js",
  "package-lock.json",
  "package.json",
  "README.md",
  "tsconfig.json",
];

/**
 * @param {string[]} targetList
 * @param {string} target
 */
function hasProtectedTarget(targetList, target) {
  return targetList.some((forbid) => target.includes(forbid));
}

module.exports = async function emptyDirectory(...resolvePath) {
  if (!resolvePath?.length) throw new Error("paths required");

  try {
    const fullPath = path.resolve(...resolvePath);

    if (hasProtectedTarget(protectedPaths, fullPath))
      throw new Error(`Path '${fullPath}' contains forbidden directory`);

    const files = await readdir(fullPath);

    for (const file of files) {
      if (protectedFiles.includes(file)) throw new Error(`failed to delete protected file '${file}'`);

      const filePath = path.join(fullPath, file);

      const isDirectory = fs.statSync(filePath).isDirectory();

      if (isDirectory) await emptyDirectory(filePath);
      else await unlink(filePath);
    }

    // 刪除完畢後，刪除原始目錄
    await rmdir(fullPath);

    return true;
  } catch (error) {
    timeLog(error.message);

    const distNotExisit = error.message?.includes(
      "ENOENT: no such file or directory, scandir",
    ) && error.message?.includes("dist");

    return !!distNotExisit;
  }
};
