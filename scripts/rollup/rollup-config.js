const babel = require("@rollup/plugin-babel");
const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const cleanup = require("rollup-plugin-cleanup");
const { resolve } = require("path");
const license = require("rollup-plugin-license");

const relativePathToRoot = "../../";

const getPath = (...paths) => resolve(__dirname, relativePathToRoot, ...paths);

const input = getPath("./lib/index.ts");

// const privateFieldIndentifier = /^#[^#]+$/i;

/** @type {import('@rollup/plugin-terser').Options} */
const terserOptions = {
  mangle: false,
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

const licensePlugin = license({
  sourcemap: true,
  cwd: process.cwd(),

  banner: {
    commentStyle: "regular",
    content: {
      file: getPath("./COPYRIGHT.txt"),
      encoding: "utf-8",
    },
  },

  thirdParty: {
    includePrivate: false,
    multipleVersions: true,
    output: {
      file: getPath("./dist/dependencies.txt"),
    },
  },
});

const baseFileName = "dist/karman";
const name = "karman";

/** @type {import("rollup").OutputOptions[]} */
const output = [
  {
    name,
    file: getPath(`${baseFileName}.js`),
    format: "es",
    exports: "named",
  },
  {
    name,
    file: getPath(`${baseFileName}.min.js`),
    format: "iife",
    exports: "named",
    /** @todo fix terser option */
    plugins: [terser(terserOptions)],
  },
  {
    name,
    file: getPath(`${baseFileName}.cjs`),
    format: "commonjs",
    exports: "named",
  },
];

/** @type {import('@rollup/plugin-typescript').RollupTypescriptOptions} */
const tsOption = {
  tsconfig: getPath("tsconfig.json"),
};

const plugins = [licensePlugin, babelPlugin, typescript(tsOption), nodeResolve(), cleanupPlugin];

module.exports = { input, output, plugins, treeshake: false };
