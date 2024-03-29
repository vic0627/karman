const copyFile = require("./utils/copy-file.js");
const { resolve } = require("path");

const getPath = (...paths) => resolve(__dirname, "../", ...paths);
const declrationPath = getPath("./declrations/index.d.ts");
const copy = () => copyFile(declrationPath, getPath("./dist/karman.d.ts"));

const EMIT = process.argv[2] === "--emit";

if (EMIT) copy();
else module.exports = copy;
