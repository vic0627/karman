type ObjectLiteral = { [x: string | number | symbol]: any };

export default class TypeCheck {
  isUndefined(value: any): value is undefined {
    return value === undefined;
  }

  isNull(value: any): value is null {
    return value === null;
  }

  isUndefinedOrNull(value: any): value is null | undefined {
    return this.isUndefined(value) || this.isNull(value);
  }

  isString(value: any): value is string {
    return typeof value === "string";
  }

  isNumber(value: any): value is number {
    return typeof value === "number" && !isNaN(value);
  }

  isObject(value: any): value is object {
    return typeof value === "object" && !this.isNull(value);
  }

  isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  isObjectLiteral(value: any): value is ObjectLiteral {
    return this.isObject(value) && !this.isArray(value);
  }

  isBoolean(value: any): value is boolean {
    return typeof value === "boolean";
  }

  isBigInt(value: any): value is bigint {
    return typeof value === "bigint";
  }

  isFunction(value: any): value is Function {
    return typeof value === "function";
  }

  isSymbol(value: any): value is symbol {
    return typeof value === "symbol";
  }
}
