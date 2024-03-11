import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "./rules.type";
export type ParamPosition = {
    path?: number;
    query?: boolean;
    body?: boolean;
};
export interface ParamDef extends ParamPosition {
    rules?: ParamRules | ParamRules[] | RuleSet;
}
export type ParamName = string;
export type PayloadDef = Record<ParamName, ParamDef>;
//# sourceMappingURL=payload-def.type.d.ts.map