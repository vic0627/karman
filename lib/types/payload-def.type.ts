import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "./rules.type";

export type ParamPosition = {
  path?: number;
  query?: boolean;
  body?: boolean;
};

export interface ParamDef extends ParamPosition {
  rules?: ParamRules | ParamRules[] | RuleSet;
  required?: boolean;
}

export type ParamName = string;

export type PayloadDef = Record<ParamName, ParamDef>;
