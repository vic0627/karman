export default class TypeCheck {
  static isUndefined(value) {
    return value === undefined;
  }

  static isNull(value) {
    return value === null;
  }

  static isUdefinedOrNull(value) {
    return TypeCheck.isUndefined(value) || TypeCheck.isNull(value);
  }

  static isString(value) {
    return typeof value === "string";
  }

  static isNumber(value) {
    return typeof value === "number" && !isNaN(value);
  }
}
