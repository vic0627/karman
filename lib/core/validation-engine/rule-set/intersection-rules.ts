import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "@/types/rules.type";

export default class IntersectionRules extends RuleSet {
  protected readonly errorType: string = "IntersectionRules";
  public get valid(): boolean {
    return !this.errors.length;
  }

  constructor(...rules: ParamRules[]) {
    super(...rules);
  }
}
