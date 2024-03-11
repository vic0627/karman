import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "@/types/karman/rules.type";
export default class UnionRules extends RuleSet {
    get valid(): boolean;
    constructor(...rules: ParamRules[]);
}
//# sourceMappingURL=union-rules.d.ts.map