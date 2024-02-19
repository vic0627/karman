import { ParamRules } from "./rules.type";

export type ParamPosition = {
  path?: number;
  query?: boolean;
  body?: boolean;
};

export interface ParamDef extends ParamPosition {
  rules?: ParamRules[];
}

export type ParamName = string;

export type PayloadDef = Record<ParamName, ParamDef>;
