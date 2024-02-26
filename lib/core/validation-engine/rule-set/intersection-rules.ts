import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "@/types/karman/rules.type";

export default class IntersectionRules extends RuleSet {
  public get valid(): boolean {
    return !this.errors.length;
  }

  constructor(...rules: ParamRules[]) {
    super(...rules);
  }
}
