import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "@/types/karman/rules.type";
export default class IntersectionRules extends RuleSet {
    get valid(): boolean;
    constructor(...rules: ParamRules[]);
}
//# sourceMappingURL=intersection-rules.d.ts.map