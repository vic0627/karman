const { rollup } = require("rollup");
const emptyDirectory = require("../utils/empty-directory.js");
const timeLog = require("../utils/time-log.js");
const emitDeclaration = require("../emit-declaration.js");
// const { resolve } = require("path");
// const copyFile = require("../utils/copy-file.js");

const MANUAL_BUILD = process.argv.includes("--manual");

// const relativePathToRoot = "../../";
// const ROOT_PATH = process.cwd();
// const getPath = (...paths) => resolve(ROOT_PATH, ...paths);

const build = async (callback = () => timeLog("build process end")) => {
  /** @type {import('rollup').RollupBuild | undefined} */
  let bundle;
  let buildFailed = false;

  try {
    timeLog("start cleaning 'dist' dir...");

    const clean = await emptyDirectory(__dirname, "../../dist");

    if (!clean) throw new Error('failed to clean up "dist" dir');

    const config = require("./rollup-config.js");

    /** @param {import('rollup').RollupBuild} bundle  */
    const generateOutputs = async (bundle) => {
      for (const outputOptions of config.output) {
        await bundle.write(outputOptions);
      }
    };

    timeLog("start rollup...");

    bundle = await rollup(config);

    await generateOutputs(bundle);

    // copyFile(getPath("./package.json"), getPath("./demo/iife/node_modules/@vic0627/karman/package.json"));

    if (typeof callback === "function") callback();
  } catch (error) {
    buildFailed = true;
    console.error(error);
  }

  if (bundle) {
    emitDeclaration();
    await bundle.close();
  }

  if (MANUAL_BUILD) process.exit(buildFailed ? 1 : 0);
};

if (MANUAL_BUILD) build();
else module.exports = build;
