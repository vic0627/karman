export type Type =
  | "char"
  | "string"
  | "number"
  | "int"
  | "float"
  | "nan"
  | "boolean"
  | "object"
  | "function"
  | "array"
  | "object-literal"
  | "null"
  | "undefined"
  | "bigint"
  | "symbol";

export type Prototype = { new (...args: any[]): any }

export type RegExpWithMessage = { regexp: RegExp; errorMessage: string };

export type RegularExpression = RegExp | RegExpWithMessage;

export type CustomValidator = (value: any) => void;

export interface ParameterDescriptor {
  min?: number;
  max?: number;
  /**
   * - `"self"`: test the value itself
   * @default "length"
   */
  measurement?: "self" | "length" | "size" | string;
  /**
   * @default false
   */
  required?: boolean;
}

export type ParamRules = (Type | Prototype | RegularExpression | CustomValidator | ParameterDescriptor)[];
