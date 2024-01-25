import type { NumOrString } from "./common.type";

export type ByteUnit = "b" | "kb" | "mb" | "gb" | "tb" | "pb" | "eb" | "zb" | "yb";

export type ByteString<N extends NumOrString = NumOrString> = `${N}${ByteUnit}`;

export type ByteLib = Record<ByteUnit, ByteUnit> | Record<string, string>;
