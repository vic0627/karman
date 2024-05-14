export default function getData(res) {
  const { body, data } = res;

  return body ?? data ?? "no data";
}

Object.defineProperty(getData, "install", {
  value: (Karman) => {
    Karman.prototype._getData = getData;
  },
});
