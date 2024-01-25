import type { TypeDef } from "src/types/ruleLiteral.type";

const TYPES: TypeDef[] = [
  ["string", true, "length", false, null, (value) => typeof value === "string"],
  ["number", true, null, false, null, (value) => typeof value === "number"],
  ["int", true, null, false, null, (value) => typeof value === "number" && Number.isInteger(value)],
  ["blob", true, "size", true, Blob, (value) => value instanceof Blob && !(value instanceof File)],
  ["file", true, "size", true, File, (value) => value instanceof File],
  ["filelist", true, "length", false, FileList, (value) => value instanceof FileList],
  ["any", false, null, false, null, () => true],
  ["null", false, null, false, null, (value) => value === null || value === undefined || isNaN(+value)],
  ["boolean", false, null, false, null, (value) => typeof value === "boolean"],
  ["object", false, null, false, null, (value) => typeof value === "object" && !Array.isArray(value)],
  ["date", false, null, false, Date, (value) => value instanceof Date],
  ["arraybuffer", true, "byteLength", true, ArrayBuffer, (value) => value instanceof ArrayBuffer],
];

export default TYPES;
