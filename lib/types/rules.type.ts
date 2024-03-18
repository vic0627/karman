export type Type =
  | "char"
  | "string"
  | "number"
  | "int"
  | "nan"
  | "boolean"
  | "object"
  | "null"
  | "function"
  | "array"
  | "object-literal"
  | "undefined"
  | "bigint"
  | "symbol";

export type ObjectLiteral = { [x: string | number | symbol]: any };

export type Prototype = { new (...args: any[]): any };

export type RegExpWithMessage = { regexp: RegExp; errorMessage?: string };

export type RegularExpression = RegExp | RegExpWithMessage;

export type CustomValidator = ((param: string, value: any) => void) & { _karman: true };

export interface ParameterDescriptor {
  min?: number;
  max?: number;
  equality?: number;
  /**
   * - `"self"`: test the value itself
   * @default "length"
   */
  measurement?: "self" | "length" | "size" | string;
}

export type ParamRules = Type | Prototype | RegularExpression | CustomValidator | ParameterDescriptor;
