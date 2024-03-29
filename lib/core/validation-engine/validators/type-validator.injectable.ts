import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import Injectable from "@/decorator/Injectable.decorator";
import { Type } from "@/types/rules.type";
import TypeCheck from "@/utils/type-check.provider";
import ValidationError from "../validation-error/validation-error";
import Template from "@/utils/template.provider";

@Injectable()
export default class TypeValidator implements Validator {
  constructor(
    private readonly typeCheck: TypeCheck,
    private readonly template: Template,
  ) {}

  public validate(option: ValidateOption): void {
    const { rule, param, value } = option;

    if (!this.typeCheck.isString(rule)) {
      return;
    }

    const type = rule.toLowerCase();
    const legal = this.legalType(type);

    if (!legal) {
      this.template.warn(`invalid type "${type}" was provided in rules for parameter "${param}"`);

      return;
    }

    const validator = this.getValidator(type);
    const valid = validator(value);

    if (!valid) {
      throw new ValidationError({ prop: param, value, type });
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
