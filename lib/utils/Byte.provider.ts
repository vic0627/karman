import type { ByteUnit, ByteString, ByteLib } from "src/types/byte.type";
import type { NumOrString } from "src/types/common.type";

export class Byte {
  byteUnits: ByteUnit[] = ["b", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb"];

  b = 1;
  kb = 2 ** 10;
  mb = 2 ** 20;
  gb = 2 ** 30;
  tb = 2 ** 40;
  pb = 2 ** 50;
  eb = 2 ** 60;
  zb = 2 ** 70;
  yb = 2 ** 80;

  #byteStr: ByteLib | undefined;

  get bytesString(): ByteLib {
    if (this.#byteStr) {
      return this.#byteStr;
    }

    const str: ByteLib | Record<string, string> = {};

    this.byteUnits.forEach((unit) => {
      str[unit] = unit;
    });

    this.#byteStr = str;

    return str;
  }
}

export class ByteConvertor extends Byte {
  constructor() {
    super();
  }

  isByteUnit(value: string) {
    return value in this.bytesString;
  }

  hasByteUnit(value: string) {
    if (!isNaN(+value)) {
      return false;
    }

    return this.byteUnits.reduce((pre, cur) => {
      if (pre) {
        return pre;
      }

      const exam = value.endsWith(cur);

      if (exam && cur !== this.bytesString.b) {
        const n = value.replace(cur, "");

        // console.log({ n });

        if (isNaN(+n)) {
          throw new SyntaxError(`Bad byte syntax '${value}'.`);
        }
      }

      return exam;
    }, false);
  }

  toNumber(value: string) {
    if (this.hasByteUnit(value)) {
      return this.#unitToBytes(value);
    }

    return +value;
  }

  toString(value: number) {
    return this.#bytesToUnit(value);
  }

  /**
   * 將數字(bytes)轉換為最接近的對應單位的儲存容量
   * @param bytes
   * @returns unit
   */
  #bytesToUnit(bytes: NumOrString): ByteString {
    if (isNaN(+bytes)) {
      throw new Error(`Invalid bytes '${bytes}' provided`);
    }

    bytes = +bytes;

    if (bytes < this.kb) {
      return `${bytes}b`;
    } else if (bytes >= this.kb && bytes < this.mb) {
      return `${(bytes / this.kb).toFixed(2)}kb`;
    } else if (bytes < this.gb) {
      return `${(bytes / this.mb).toFixed(2)}mb`;
    } else if (bytes < this.tb) {
      return `${(bytes / this.gb).toFixed(2)}gb`;
    } else if (bytes < this.pb) {
      return `${(bytes / this.tb).toFixed(2)}tb`;
    } else if (bytes < this.eb) {
      return `${(bytes / this.pb).toFixed(2)}pb`;
    } else if (bytes < this.zb) {
      return `${(bytes / this.eb).toFixed(2)}eb`;
    } else if (bytes < this.yb) {
      return `${(bytes / this.zb).toFixed(2)}zb`;
    } else {
      return `${(bytes / this.yb).toFixed(2)}yb`;
    }
  }

  /**
   * 將含有單位的儲存容量轉換為數字(bytes)
   * @param unit
   * @returns bytes
   */
  #unitToBytes(unit: ByteString | ByteUnit | string): number {
    const numericValue = parseFloat(unit);

    if (numericValue < 0) {
      throw new Error("Invalid negative value.");
    }

    const unitChar: string = unit.replace(numericValue + "", "");

    switch (unitChar) {
      case "b":
        return numericValue;
      case "kb":
        return numericValue * this.kb;
      case "mb":
        return numericValue * this.mb;
      case "gb":
        return numericValue * this.gb;
      case "tb":
        return numericValue * this.tb;
      case "pb":
        return numericValue * this.pb;
      case "eb":
        return numericValue * this.eb;
      case "zb":
        return numericValue * this.zb;
      case "yb":
        return numericValue * this.yb;
      default:
        throw new Error(`Invalid unit '${unit}' provided`);
    }
  }
}
