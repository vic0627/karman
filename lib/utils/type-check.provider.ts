import { ObjectLiteral, Type } from "@/types/rules.type";

export default class TypeCheck {
  get CorrespondingMap(): Record<Type, keyof this> {
    return {
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
  }

  get TypeSet(): Type[] {
    return [
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
  }

  isChar(value: any): boolean {
    return typeof value === "string" && value.length === 1;
  }

  isString(value: any): value is string {
    return typeof value === "string";
  }

  isNumber(value: any): value is number {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }

  isInteger(value: any): boolean {
    return typeof value === "number" && !isNaN(value) && Number.isInteger(value);
  }

  isNaN(value: any): boolean {
    return isNaN(value) && value !== undefined;
  }

  isBoolean(value: any): value is boolean {
    return typeof value === "boolean";
  }

  isObject(value: any): value is object {
    const isObj = typeof value === "object" && value !== null;

    return isObj || Array.isArray(value) || typeof value === "function";
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
    return typeof value === "object" && !Array.isArray(value) && value !== null;
  }

  isUndefined(value: any): value is undefined {
    return value === undefined;
  }

  isUndefinedOrNull(value: any): value is null | undefined {
    return value === undefined || value === null;
  }

  isBigInt(value: any): value is bigint {
    return typeof value === "bigint";
  }

  isSymbol(value: any): value is symbol {
    return typeof value === "symbol";
  }

  isValidName(value: any): value is string {
    return typeof value === "string" && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value);
  }
}

export const typeCheck = new TypeCheck();
