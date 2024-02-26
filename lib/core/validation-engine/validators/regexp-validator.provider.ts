import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import { ParamRules, RegExpWithMessage, RegularExpression } from "@/types/karman/rules.type";

export interface RegExpValidateOption extends Omit<ValidateOption, "rule"> {
  rule: RegularExpression;
}

export type RegExpValidateStrategy = (option: RegExpValidateOption) => void;

export default class RegExpValidator implements Validator {
  public validate(option: ValidateOption): void {
    const { rule, param, value } = option;

    const legal = this.isLegalRegExp(rule);

    if (!legal) {
      return;
    }

    const validateStrategy = this.getStrategy(rule);

    validateStrategy({ rule, param, value });
  }

  private isPureRegExp(rule: ParamRules): rule is RegExp {
    return rule instanceof RegExp;
  }

  private isRegExpWithMessage(rule: ParamRules): rule is RegExpWithMessage {
    return (rule as RegExpWithMessage)?.regexp instanceof RegExp;
  }

  private isLegalRegExp(rule: ParamRules): rule is RegularExpression {
    return this.isPureRegExp(rule) || this.isRegExpWithMessage(rule);
  }

  private getStrategy(rule: RegularExpression): RegExpValidateStrategy {
    if (this.isPureRegExp(rule)) {
      return this.pureRegExp.bind(this);
    } else if (this.isRegExpWithMessage(rule)) {
      return this.regExpWithMessage.bind(this);
    } else {
      throw new Error("no matched validate strategy has been found");
    }
  }

  private getErrorMessage(param: string, value: any) {
    return `Invalid input "${value}" for parameter "${param}".`;
  }

  private pureRegExp(option: RegExpValidateOption) {
    const { param, value } = option;
    const valid = (option.rule as RegExp).test(value);

    if (!valid) {
      throw new TypeError(this.getErrorMessage(param, value));
    }
  }

  private regExpWithMessage(option: RegExpValidateOption) {
    const { param, value } = option;
    const { errorMessage, regexp } = option.rule as RegExpWithMessage;
    const valid = regexp.test(value);

    if (!valid) {
      throw new TypeError(errorMessage ?? this.getErrorMessage(param, value));
    }
  }
}
