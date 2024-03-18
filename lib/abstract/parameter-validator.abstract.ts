import { ParamRules } from "@/types/rules.type";

export type ValidateOption = { required: boolean; rule: ParamRules; param: string; value: any };

export default abstract class Validator {
  public abstract validate(option: ValidateOption): void;
}
