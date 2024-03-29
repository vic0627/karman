export default {
  min: 1000 * 60,
  /** @private */
  install(k) {
    Object.defineProperty(k, "_constant", { value: this });
  },
};
