import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import Injectable from "@/decorator/Injectable.decorator";
import { ParamRules, ParameterDescriptor } from "@/types/karman/rules.type";
import TypeCheck from "@/utils/type-check.provider";

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

    const { required = false, measurement = "self", min, max, equality } = rule;

    if (required) {
      this.requiredValidator(param, value);
    }

    const target = this.getMeasureTarget(value, measurement);

    this.rangeValidator({ min, max, equality, param, value: target, measurement });
  }

  private isParameterDescriptor(rule: ParamRules): rule is ParameterDescriptor {
    const isObject = this.typeCheck.isObjectLiteral(rule);
    const _rule = rule as ParameterDescriptor;
    const hasDescriptorKeys = [_rule?.min, _rule?.max, _rule?.equality, _rule?.measurement, _rule?.required].some(
      (des) => !this.typeCheck.isUndefinedOrNull(des),
    );

    return isObject && hasDescriptorKeys;
  }

  private requiredValidator(param: string, value: any) {
    const empty = this.typeCheck.isUndefinedOrNull(value);

    if (empty) {
      throw new TypeError(`Parameter "${param}" is required.`);
    }
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
    const { equality, min, max, value } = option;

    let valid: boolean | null = null;

    if (!this.typeCheck.isUndefinedOrNull(equality)) {
      valid = equality === value;
    } else if (!this.typeCheck.isUndefinedOrNull(min)) {
      valid = min <= value;
    } else if (!this.typeCheck.isUndefinedOrNull(max)) {
      valid = max >= value;
    }

    if (!this.typeCheck.isNull(valid) && !valid) {
      const message = this.getErrorMessage(option);

      throw new RangeError(message);
    }
  }

  private getErrorMessage(option: Partial<RangeValidateOption>) {
    const { min, max, equality, measurement, param } = option;
    const sentence = [
      measurement === "self" ? `Parameter "${param}"` : `Property "${measurement}" of the parameter "${param}"`,
      "must be",
    ];
    const l = sentence.length;

    if (!this.typeCheck.isUndefinedOrNull(equality)) {
      sentence.push(`equal to "${equality}".`);
    } else if (!this.typeCheck.isUndefinedOrNull(min)) {
      sentence.push(`greater than or equal to "${min}".`);
    } else if (!this.typeCheck.isUndefinedOrNull(max)) {
      sentence.push(`less than or equal to "${max}".`);
    }

    if (sentence.length !== l + 1) {
      throw new Error("missing compare value");
    }

    return sentence.join(" ");
  }
}
