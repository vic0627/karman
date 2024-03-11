module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }, "@babel/preset-typescript"]],
  plugins: [
    [
      "import",
      {
        libraryName: "lodash-es",
        libraryDirectory: "",
        camel2DashComponentName: false,
      },
    ],
  ],
};
