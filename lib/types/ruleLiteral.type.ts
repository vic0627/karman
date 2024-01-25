import type { ByteString } from "./byte.type";
import { ClassSignature } from "./common.type";
import { RuleErrorOption } from "./ruleError.type";

export type CountableWithByte = "blob" | "file" | "arraybuffer";

export type CountableType = "string" | "number" | "int" | "filelist" | CountableWithByte;

export type UncountableType = "any" | "null" | "boolean" | "object" | "date";

export type BasicType = CountableType | UncountableType;

export type TypeLimitationLiteral<
  C extends CountableType = CountableType,
  N extends ByteString<number> | number = number,
> = `${C}@${N}` | `${C}@${N}:` | `${C}@${N}:${N}` | `${C}@:${N}`;

export type LimitationType =
  | CountableType
  | TypeLimitationLiteral
  | TypeLimitationLiteral<CountableWithByte, ByteString<number> | number>;

export type BasicRuleType = LimitationType | UncountableType;

export type ArrayLiteral<T extends BasicRuleType = BasicRuleType, N extends number = number> =
  | `${T}[]`
  | `${T}[${N}]`
  | `${T}[${N}:]`
  | `${T}[:${N}]`
  | `${T}[${N}:${N}]`;

export type RuleLiteral = ArrayLiteral | BasicRuleType | string;

export type OptionalProp = `$${string}`;

export type PropKey = OptionalProp | string;

export type TypeValidator = (value: unknown) => boolean;

export interface TypeMetadata {
  _type: BasicType;
  countable: boolean;
  measureUnit: string | "length" | "size" | null | keyof Record<string, unknown>;
  allowBytes: boolean;
  proto: unknown;
  test: TypeValidator;
}

export type TypeDef = [
  /** 型別名稱 */
  _type: BasicType,
  /** 是否可數 */
  countable: boolean,
  /** 可數屬性 */
  measureUnit: "length" | "size" | "byteLength" | null,
  /** 是否允許用 byte 作為單位 */
  allowBytes: boolean,
  /** 型別原型 */
  proto: ClassSignature | null,
  /** 型別驗證函式 */
  test: TypeValidator,
];

export interface Limitation {
  max?: number;
  min?: number;
  equal?: number;
}

export interface Rule {
  type: BasicType | string;
  typeInfo?: TypeMetadata;
  limitation?: boolean;
  hasArray?: boolean;
  typeLimitation?: Limitation;
  arrayLimitation?: Limitation;
}

export type RuleValidator = (param: string, value: unknown) => RuleErrorOption;
