import { ObjectLiteral, Type } from "src/types/karman/rules.type";

export default class TypeCheck {
  get CorrespondingMap(): Record<Type, keyof this> {
    return {
      char: "isChar",
      string: "isString",
      number: "isNumber",
      int: "isInteger",
      float: "isFloat",
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
  }

  get TypeSet(): Type[] {
    return [
      "char",
      "string",
      "number",
      "int",
      "float",
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
  }

  isChar(value: any): boolean {
    return this.isString(value) && value.length === 1;
  }

  isString(value: any): value is string {
    return typeof value === "string";
  }

  isNumber(value: any): value is number {
    return typeof value === "number" && !isNaN(value);
  }

  isInteger(value: any): boolean {
    return this.isNumber(value) && Number.isInteger(value);
  }

  isFloat(value: any): boolean {
    return !this.isInteger(value);
  }

  isNaN(value: any): boolean {
    return this.isNaN(value);
  }

  isBoolean(value: any): value is boolean {
    return typeof value === "boolean";
  }

  isObject(value: any): value is object {
    return typeof value === "object";
  }

  isNull(value: any): value is null {
    return value === null;
  }

  isFunction(value: any): value is Function {
    return typeof value === "function";
  }

  isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  isObjectLiteral(value: any): value is ObjectLiteral {
    return this.isObject(value) && !this.isArray(value) && !this.isNull(value);
  }

  isUndefined(value: any): value is undefined {
    return value === undefined;
  }

  isUndefinedOrNull(value: any): value is null | undefined {
    return this.isUndefined(value) || this.isNull(value);
  }

  isBigInt(value: any): value is bigint {
    return typeof value === "bigint";
  }

  isSymbol(value: any): value is symbol {
    return typeof value === "symbol";
  }
}
