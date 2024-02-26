import Validator, { ValidateOption } from "src/abstract/Validator.abstract";
import { CustomValidator, ParamRules, Prototype } from "src/types/karman/rules.type";
import TypeCheck from "src/utils/TypeCheck.provider";

export default class FunctionalValidator implements Validator {
  constructor(private readonly typeCheck: TypeCheck) {}

  public validate(option: ValidateOption): void {
    const { rule, param, value } = option;

    if (this.isCustomValidator(rule)) {
      rule(param, value);
    } else if (this.isPrototype(rule)) {
      this.instanceValidator(option);
    }
  }

  private isPrototype(rule: ParamRules): rule is Prototype {
    return this.typeCheck.isFunction(rule) && !(rule as CustomValidator)?._karman;
  }

  private isCustomValidator(rule: ParamRules): rule is CustomValidator {
    return this.typeCheck.isFunction(rule) && (rule as CustomValidator)?._karman;
  }

  private instanceValidator(option: ValidateOption) {
    const { param, value } = option;
    const rule = option.rule as Prototype;

    if (!(value instanceof rule)) {
      throw new TypeError(`The parameter "${param}" must be an instance of "${rule}".`);
    }
  }
}
