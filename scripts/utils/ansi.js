const ansi = (str) => `\x1b[${str}m`;

const reset = ansi(0);

const red = ansi("0;31");
const green = ansi("0;32");
const yellow = ansi("0;33");
const blue = ansi("0;34");
const purple = ansi("0;35");
const cyanBlue = ansi("0;36");
const white = ansi("0;37");

const color = {
  red,
  green,
  yellow,
  blue,
  purple,
  cyanBlue,
  white,
};

module.exports = {
  error(str) {
    return red + str + reset;
  },
  success(str) {
    return green + str + reset;
  },
  warn(str) {
    return yellow + str + reset;
  },
  /**
   *
   * @param {"red" | "green" | "yellow" | "blue" | "purple" | "cyanBlue" | "white"} colorName
   * @param {string} str
   */
  color(colorName, str) {
    return color[colorName] + str + reset;
  },
};
