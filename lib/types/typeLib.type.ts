import { TypeMetadata } from "./ruleLiteral.type";

export type TypeLibWithName = Map<string, TypeMetadata>;

export interface TypeLibrary {
  [namespace: string]: TypeLibWithName;
}
