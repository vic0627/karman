import { ParamRules } from "@/types/rules.type";
import ValidationError from "../validation-error/validation-error";

export default class RuleSet {
  protected readonly rules: ParamRules[];
  protected errors: string[] = [];
  protected readonly errorType: string = "RuleSet";

  public get valid(): boolean {
    return true;
  }

  constructor(...rules: ParamRules[]) {
    this.rules = rules;
  }

  public execute(callbackfn: (value: ParamRules, index: number, array: ParamRules[]) => void) {
    this.rules.forEach((value, index, array) => {
      try {
        callbackfn(value, index, array);
      } catch (error) {
        if (error instanceof Error) this.errors.push(`[${index}] ${error.message}`);
      }
    });

    if (!this.valid) throw new ValidationError(`${this.errorType}\n${this.errors.join("\n")}`);
  }
}
