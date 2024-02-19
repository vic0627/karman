import { ParamRules } from "src/types/karman/rules.type";

export default abstract class Validator {
  public abstract validate(rule: ParamRules, value: any): void;
}
