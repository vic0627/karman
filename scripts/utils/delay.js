module.exports = async function (delay, callback) {
  return await new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      if (typeof callback === "function") callback(resolve, reject);
      else resolve();

      clearTimeout(t);
    }, delay ?? 10);
  });
};
