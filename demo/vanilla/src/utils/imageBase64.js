/**
 * @param {File} file
 * @returns {Promise<string>}
 */
export default function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

Object.defineProperties(convertToBase64, "install", {
  value: (karman) => {
    Object.defineProperty(karman, "_convertToBase64", { value: convertToBase64 });
  },
});
