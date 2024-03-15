const babel = require("@rollup/plugin-babel");
const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const cleanup = require("rollup-plugin-cleanup");
const { resolve } = require("path");

const relativePathToRoot = "../../";

const getPath = (...paths) => resolve(__dirname, relativePathToRoot, ...paths);

const input = getPath("./lib/index.ts");

const privateFieldIndentifier = /^#[^#]+$/i;

/** @type {import('@rollup/plugin-terser').Options} */
const terserOptions = {
  mangle: {
    keep_classnames: true,
    properties: {
      regex: privateFieldIndentifier,
      keep_quoted: true,
    },
  },
};

/** @type {import("rollup-plugin-cleanup").Options} */
const cleanupOptions = { extensions: ["ts", "js", "cjs"], comments: [] };

const cleanupPlugin = cleanup(cleanupOptions);

/** @type {import("@rollup/plugin-babel").RollupBabelOutputPluginOptions} */
const babelOptions = {
  extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts"],
  babelHelpers: "bundled",
};

const babelPlugin = babel(babelOptions);

const baseFileName = "demo/vanilla/src/karman/index";

/** @type {import("rollup").OutputOptions[]} */
const output = [
  {
    name: "karman",
    file: getPath(`${baseFileName}.js`),
    format: "es",
    exports: "named",
  },
  // {
  //   name: "karman",
  //   file: getPath(`${baseFileName}.min.js`),
  //   format: "iife",
  //   exports: "named",
  //   /** @todo fix terser option */
  //   plugins: [terser(terserOptions)],
  // },
  // {
  //   name: "karman",
  //   file: getPath(`${baseFileName}.cjs`),
  //   format: "commonjs",
  //   exports: "named",
  // },
];

/** @type {import('@rollup/plugin-typescript').RollupTypescriptOptions} */
const tsOption = {
  tsconfig: getPath("tsconfig.json"),
};

const plugins = [babelPlugin, typescript(tsOption), nodeResolve(), cleanupPlugin];

module.exports = { input, output, plugins, treeshake: false };
