import { ParamRules } from "@/types/rules.type";

export default class RuleSet {
  protected readonly rules: ParamRules[];
  protected errors: Error[] = [];

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
        if (error instanceof Error) {
          this.errors.push(error);
        }
      }
    });

    if (!this.valid) {
      throw this.errors[0];
    }
  }
}
