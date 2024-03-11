import { ParamRules } from "@/types/karman/rules.type";
export default class RuleSet {
    protected readonly rules: ParamRules[];
    protected errors: Error[];
    get valid(): boolean;
    constructor(...rules: ParamRules[]);
    execute(callbackfn: (value: ParamRules, index: number, array: ParamRules[]) => void): void;
}
//# sourceMappingURL=rule-set.d.ts.map