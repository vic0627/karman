import { RuleLiteral, PropKey, RuleValidator } from "./ruleLiteral.type";

export type RuleEvaluation = RuleValidator | RegExp;

export type ValidRule = string | RuleLiteral | RuleEvaluation;

export type ObjectRules = symbol | ValidRule | ValidRule[];

export type RuleObjectInterface = Record<PropKey, ObjectRules>;

export interface Payload {
  [key: string]: any;
}

export interface TypeCheckResult {
  rotCheck: boolean;
  roType: "function" | "regexp" | "rot" | null;
  reason: string | null;
  rot: unknown;
  hasLimitation?: boolean;
  hasArray?: boolean;
  type?: string;
}

export enum RuleArrayType {
  intersection,
  union,
}

export interface RuleArrayQueueObject {
  type: RuleArrayType;
  rules: RuleValidator[];
}

export interface RuleArrayExecutorArgs extends RuleArrayQueueObject {
  param: string;
  value: unknown;
}
