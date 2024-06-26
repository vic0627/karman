import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "./rules.type";

export type ParamPosition = "path" | "query" | "body";

export interface ParamDef {
  rules?: ParamRules | ParamRules[] | RuleSet;
  required?: boolean;
  position?: ParamPosition | ParamPosition[];
  defaultValue?: () => any;
}

export type ParamName = string;

export type Schema = Record<ParamName, ParamDef | null>;

export type PayloadDef = Schema | string[];
