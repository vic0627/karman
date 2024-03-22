const { rollup } = require("rollup");
const { resolve } = require("path");
const emptyDirectory = require("../utils/empty-directory.js");
const timeLog = require("../utils/time-log.js");
const copyFile = require("../utils/copy-file.js");

const MANUAL_BUILD = process.argv[2] === "--manual";

const relativePathToRoot = "../../";

const getPath = (...paths) => resolve(__dirname, relativePathToRoot, ...paths);

const build = async (callback) => {
  /** @type {import('rollup').RollupBuild | undefined} */
  let bundle;
  let buildFailed = false;

  try {
    timeLog("start cleaning 'dist' dir...");

    const clean = await emptyDirectory(__dirname, "../../dist");

    if (!clean) throw new Error('failed to clean up "dist" dir');

    const { input, output, plugins } = require("./rollup-config.js");

    /** @param {import('rollup').RollupBuild} bundle  */
    const generateOutputs = async (bundle) => {
      for (const outputOptions of output) {
        await bundle.write(outputOptions);
      }
    };

    timeLog("start rollup...");

    bundle = await rollup({ input, plugins });

    await generateOutputs(bundle);

    if (typeof callback === "function") callback();
  } catch (error) {
    buildFailed = true;
    console.error(error);
  }

  if (bundle) {
    copyFile(getPath("./declrations/index.d.ts"), getPath("./dist/karman.d.ts"));
    await bundle.close();
  }

  if (MANUAL_BUILD) process.exit(buildFailed ? 1 : 0);
};

if (MANUAL_BUILD) build();
else module.exports = build;
