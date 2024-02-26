import RuleSet from "src/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "src/types/karman/rules.type";

export default class UnionRules extends RuleSet {
  get valid(): boolean {
    return this.rules.length > this.errors.length;
  }

  constructor(...rules: ParamRules[]) {
    super(...rules);
  }
}
