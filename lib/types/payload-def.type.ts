import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "./rules.type";

export type ParamPosition = "path" | "query" | "body"

export interface ParamDef {
  rules?: ParamRules | ParamRules[] | RuleSet;
  required?: boolean;
  position?: ParamPosition | ParamPosition[];
}

export type ParamName = string;

export type PayloadDef = Record<ParamName, ParamDef>;
