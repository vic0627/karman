import alias from "@rollup/plugin-alias";
import resolve from "@rollup/plugin-node-resolve";
import path from "path";

const getPath = (...paths) => path.resolve(__dirname, ...paths);

const customResolver = resolve({
  extensions: [".js"],
});

/** @type {import('vite').UserConfig} */
export default {
  // root: "./",
  optimizeDeps: {
    exclude: ["@vic0627/karman"]
  },
  plugins: [
    alias({
      entries: [
        { find: "@karman", replacement: getPath("./src/karman") },
        { find: "@/", replacement: "./src/" },
      ],
    }),
  ],
};
