import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "@/types/rules.type";

export default class UnionRules extends RuleSet {
  get valid(): boolean {
    return this.rules.length > this.errors.length;
  }

  constructor(...rules: ParamRules[]) {
    super(...rules);
  }
}
