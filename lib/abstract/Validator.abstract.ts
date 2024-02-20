import { ParamRules } from "src/types/karman/rules.type";

export type ValidateOption = { rule: ParamRules; param: string; value: any }

export default abstract class Validator {
  public abstract validate(option: ValidateOption): void;
}
