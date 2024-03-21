import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import Injectable from "@/decorator/Injectable.decorator";
import { ParamRules, ParameterDescriptor } from "@/types/rules.type";
import TypeCheck from "@/utils/type-check.provider";
import ValidationError from "../validation-error/validation-error";

export type RangeValidateOption = Pick<ParameterDescriptor, "min" | "max" | "equality" | "measurement"> &
  Pick<ValidateOption, "param" | "value">;

@Injectable()
export default class ParameterDescriptorValidator implements Validator {
  constructor(private readonly typeCheck: TypeCheck) {}

  public validate(option: ValidateOption): void {
    const { rule, param, value } = option;

    if (!this.isParameterDescriptor(rule)) {
      return;
    }

    const { measurement = "self", min, max, equality } = rule;

    const target = this.getMeasureTarget(value, measurement);

    this.rangeValidator({ min, max, equality, param, value: target, measurement });
  }

  private isParameterDescriptor(rule: ParamRules): rule is ParameterDescriptor {
    const isObject = this.typeCheck.isObjectLiteral(rule);
    const _rule = rule as ParameterDescriptor;
    const hasDescriptorKeys = [_rule?.min, _rule?.max, _rule?.equality, _rule?.measurement].some(
      (des) => !this.typeCheck.isUndefinedOrNull(des),
    );

    return isObject && hasDescriptorKeys;
  }

  private getMeasureTarget(value: any, measurement: string) {
    if (measurement === "self") {
      return value;
    }

    const target = value[measurement];

    if (this.typeCheck.isUndefinedOrNull(target)) {
      console.warn(`Cannot find property "${measurement}" on "${value}".`);
    }

    return target;
  }

  private rangeValidator(option: RangeValidateOption) {
    const { equality, min, max, value, param, measurement } = option;

    let valid: boolean | null = null;

    if (!this.typeCheck.isUndefinedOrNull(equality)) {
      valid = equality === value;
    } else if (!this.typeCheck.isUndefinedOrNull(min)) {
      valid = min <= value;
    } else if (!this.typeCheck.isUndefinedOrNull(max)) {
      valid = max >= value;
    }

    const prop = measurement && measurement !== "self" ? `${param}.${measurement}` : param;

    if (!this.typeCheck.isNull(valid) && !valid) throw new ValidationError({ prop, value, equality, min, max });
  }
}
