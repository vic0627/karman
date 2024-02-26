import RuleSet from "src/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "src/types/karman/rules.type";

export default class IntersectionRules extends RuleSet {
  public get valid(): boolean {
    return !this.errors.length;
  }

  constructor(...rules: ParamRules[]) {
    super(...rules);
  }
}
