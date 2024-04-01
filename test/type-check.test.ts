import { describe, beforeEach, it, expect } from "@jest/globals";
import TypeCheck from "@/utils/type-check.provider";

describe("TypeCheck", () => {
  let typeCheck: TypeCheck;

  beforeEach(() => {
    typeCheck = new TypeCheck();
  });

  describe("CorrespondingMap", () => {
    it("should return correct map of types to methods", () => {
      const expectedMap = {
        char: "isChar",
        string: "isString",
        number: "isNumber",
        int: "isInteger",
        nan: "isNaN",
        boolean: "isBoolean",
        object: "isObject",
        null: "isNull",
        function: "isFunction",
        array: "isArray",
        "object-literal": "isObjectLiteral",
        undefined: "isUndefined",
        bigint: "isBigInt",
        symbol: "isSymbol",
      };

      expect(typeCheck.CorrespondingMap).toEqual(expectedMap);
    });
  });

  describe("TypeSet", () => {
    it("should return correct array of types", () => {
      const expectedArray = [
        "char",
        "string",
        "number",
        "int",
        "nan",
        "boolean",
        "object",
        "null",
        "function",
        "array",
        "object-literal",
        "undefined",
        "bigint",
        "symbol",
      ];

      expect(typeCheck.TypeSet).toEqual(expectedArray);
    });
  });

  describe("isChar", () => {
    it("should return true if value is a single character string", () => {
      expect(typeCheck.isChar("a")).toBe(true);
      expect(typeCheck.isChar("")).toBe(false);
      expect(typeCheck.isChar("ab")).toBe(false);
      expect(typeCheck.isChar(1)).toBe(false);
    });
  });

  describe("isString", () => {
    it("should return true if value is a string", () => {
      expect(typeCheck.isString("")).toBe(true);
      expect(typeCheck.isString("hello")).toBe(true);
      expect(typeCheck.isString(123)).toBe(false);
    });
  });

  describe("isNumber", () => {
    it("should return true if value is a number", () => {
      expect(typeCheck.isNumber(123)).toBe(true);
      expect(typeCheck.isNumber(0)).toBe(true);
      expect(typeCheck.isNumber("123")).toBe(false);
      expect(typeCheck.isNumber(NaN)).toBe(false);
    });
  });

  describe("isInteger", () => {
    it("should return true if value is an integer", () => {
      expect(typeCheck.isInteger(123)).toBe(true);
      expect(typeCheck.isInteger(0)).toBe(true);
      expect(typeCheck.isInteger(123.45)).toBe(false);
      expect(typeCheck.isInteger("123")).toBe(false);
    });
  });

  describe("isNaN", () => {
    it("should return true if value is NaN", () => {
      expect(typeCheck.isNaN(NaN)).toBe(true);
      expect(typeCheck.isNaN(123)).toBe(false);
    });
  });

  describe("isBoolean", () => {
    it("should return true if value is a boolean", () => {
      expect(typeCheck.isBoolean(true)).toBe(true);
      expect(typeCheck.isBoolean(false)).toBe(true);
      expect(typeCheck.isBoolean(0)).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should return true if value is an object", () => {
      expect(typeCheck.isObject({})).toBe(true);
      expect(typeCheck.isObject([])).toBe(true);
      expect(typeCheck.isObject(() => {})).toBe(true);
      expect(typeCheck.isObject(null)).toBe(true);
      expect(typeCheck.isObject(undefined)).toBe(false);
      expect(typeCheck.isObject(123)).toBe(false);
    });
  });

  describe("isNull", () => {
    it("should return true if value is null", () => {
      expect(typeCheck.isNull(null)).toBe(true);
      expect(typeCheck.isNull(undefined)).toBe(false);
      expect(typeCheck.isNull(0)).toBe(false);
    });
  });

  describe("isFunction", () => {
    it("should return true if value is a function", () => {
      expect(typeCheck.isFunction(() => {})).toBe(true);
      expect(typeCheck.isFunction(function () {})).toBe(true);
      expect(typeCheck.isFunction(123)).toBe(false);
    });
  });

  describe("isArray", () => {
    it("should return true if value is an array", () => {
      expect(typeCheck.isArray([])).toBe(true);
      expect(typeCheck.isArray([1, 2, 3])).toBe(true);
      expect(typeCheck.isArray({})).toBe(false);
      expect(typeCheck.isArray("string")).toBe(false);
    });
  });

  describe("isObjectLiteral", () => {
    it("should return true if value is an object literal", () => {
      expect(typeCheck.isObjectLiteral({})).toBe(true);
      expect(typeCheck.isObjectLiteral({ key: "value" })).toBe(true);
      expect(typeCheck.isObjectLiteral([])).toBe(false);
      expect(typeCheck.isObjectLiteral(() => {})).toBe(false);
      expect(typeCheck.isObjectLiteral(null)).toBe(false);
    });
  });

  describe("isUndefined", () => {
    it("should return true if value is undefined", () => {
      expect(typeCheck.isUndefined(undefined)).toBe(true);
      expect(typeCheck.isUndefined(null)).toBe(false);
      expect(typeCheck.isUndefined(0)).toBe(false);
    });
  });

  describe("isUndefinedOrNull", () => {
    it("should return true if value is undefined or null", () => {
      expect(typeCheck.isUndefinedOrNull(undefined)).toBe(true);
      expect(typeCheck.isUndefinedOrNull(null)).toBe(true);
      expect(typeCheck.isUndefinedOrNull(0)).toBe(false);
      expect(typeCheck.isUndefinedOrNull("")).toBe(false);
    });
  });

  describe("isBigInt", () => {
    it("should return true if value is a BigInt", () => {
      expect(typeCheck.isBigInt(BigInt(10))).toBe(true);
      expect(typeCheck.isBigInt(10)).toBe(false);
    });
  });

  describe("isSymbol", () => {
    it("should return true if value is a symbol", () => {
      expect(typeCheck.isSymbol(Symbol())).toBe(true);
      expect(typeCheck.isSymbol("symbol")).toBe(false);
    });
  });
});
