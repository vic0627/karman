import Validator, { ValidateOption } from "src/abstract/Validator.abstract";
import Injectable from "src/decorator/Injectable.decorator";
import { Type } from "src/types/karman/rules.type";
import TypeCheck from "src/utils/TypeCheck.provider";

@Injectable()
export default class TypeValidator implements Validator {
  constructor(private readonly typeCheck: TypeCheck) {}

  public validate(option: ValidateOption): void {
    const { rule, param, value } = option;

    if (!this.typeCheck.isString(rule)) {
      return;
    }

    const type = rule.toLowerCase();
    const legal = this.legalType(type);

    if (!legal) {
      console.warn(`[karman warn] invalid type "${type}" was provided in rules for parameter "${param}"`);

      return;
    }

    const validator = this.getValidator(type);
    const valid = validator(value);

    if (!valid) {
      throw new TypeError(`parameter ${param} should be ${type} type`);
    }
  }

  private legalType(type: string): type is Type {
    if (this.typeCheck.TypeSet.includes(type as Type)) {
      return true;
    }

    return false;
  }

  private getValidator(type: string) {
    const methodName = this.typeCheck.CorrespondingMap[type as Type];
    const validator = this.typeCheck[methodName];

    return validator as (value: any) => boolean;
  }
}
