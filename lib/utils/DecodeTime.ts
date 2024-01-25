/* eslint-disable no-fallthrough */
type AcceptTime = "d" | "h" | "m" | "s";

export default class DecodeTime {
  get #day() {
    return "d";
  }

  get #hour() {
    return "h";
  }

  get #minute() {
    return "m";
  }

  get #second() {
    return "s";
  }

  #testNumChar(source: string) {
    if (source.length > 1) {
      return false;
    }

    return /^[0-9.]$/.test(source);
  }

  #testNumString(source: string) {
    return /^(?!\\.)(\d+\.?\d*|\.\d+)$/.test(source);
  }

  #isUnit(source: string) {
    return [this.#day, this.#hour, this.#minute, this.#second].includes(source);
  }

  #getIndex(source: string, target: AcceptTime): [firstIdx: number, lastIdx: number] {
    return [source.indexOf(target), source.lastIndexOf(target)];
  }

  #has(source: string, target: AcceptTime) {
    const [firstIdx, lastIdx] = this.#getIndex(source, target);

    return firstIdx !== -1 && firstIdx === lastIdx;
  }

  #getNum(source: string, target: AcceptTime) {
    const [unitIdx] = this.#getIndex(source, target);

    let n = "";

    for (let i = unitIdx - 1; i >= 0; i--) {
      const char = source[i];

      if (this.#testNumChar(char)) {
        n = n + char;

        continue;
      }

      break;
    }

    const result = Number(n);

    if (isNaN(result)) {
      return 0;
    }

    return result;
  }

  #getTime(source: number, target: AcceptTime) {
    let ratio = 1;

    switch (target) {
      case this.#day:
        ratio *= 24;
      case this.#hour:
        ratio *= 60;
      case this.#minute:
        ratio *= 60;
      case this.#second:
        ratio *= 1000;
    }

    return source * ratio;
  }

  #destructureTimeString(source: string, target: AcceptTime) {
    if (!this.#has(source, target)) {
      return ["0", target];
    }

    const [idx] = this.#getIndex(source, target);

    let timeString = "";

    for (let i = idx - 1; i >= 0; i--) {
      const char = source[i];

      if (!this.#testNumChar(source)) {
        break;
      }

      timeString = char + timeString;
    }

    return [timeString, target];
  }

}
