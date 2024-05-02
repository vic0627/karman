import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import Template from "@/utils/template.provider";
import TypeCheck from "@/utils/type-check.provider";
import ValidationError, { ValidationErrorOptions } from "../validation-error/validation-error";
import { ParamRules } from "@/types/rules.type";
import Injectable from "@/decorator/Injectable.decorator";
import Karman from "@/core/karman/karman";
import SchemaType from "../schema-type/schema-type";

interface ArrayInfo {
  min?: number;
  max?: number;
  equal?: number;
  type?: string;
}

interface TypeValidatorInArray {
  (param: string, index: number, value: any): void;
}

@Injectable()
export default class ArrayValidator implements Validator {
  private readonly LEFT_BRACKET = "[";
  private readonly RIGHT_BRACKET = "]";
  private readonly COLON = ":";

  constructor(
    private readonly typeCheck: TypeCheck,
    private readonly template: Template,
  ) {}

  public maybeArraySyntax(rule: ParamRules) {
    if (!this.typeCheck.isString(rule)) return false;

    return rule.includes(this.LEFT_BRACKET) || rule.includes(this.RIGHT_BRACKET) || rule.includes(this.COLON);
  }

  public validate(option: ValidateOption, karman?: Karman): void {
    const { rule, param, value } = option;

    if (!this.typeCheck.isString(rule)) return;

    const { min, max, equal, type } = this.resolveArraySyntax(rule);

    if (!this.typeCheck.isArray(value))
      throw new ValidationError({
        prop: param,
        value,
        type: "array",
      });

    this.validateRange(param, value, { min, max, equal });

    const typeValidator = this.getTypeValidator(type, karman);

    value.forEach((val, idx) => typeValidator(param, idx, val));
  }

  private resolveArraySyntax(rule: string): ArrayInfo {
    const maxIdx = rule.length - 1;
    const leftIdx = rule.indexOf(this.LEFT_BRACKET);
    const _leftIdx = rule.lastIndexOf(this.LEFT_BRACKET);
    const rightIdx = rule.indexOf(this.RIGHT_BRACKET);
    const _rightIdx = rule.lastIndexOf(this.RIGHT_BRACKET);
    const colonIdx = rule.indexOf(this.COLON);
    const _colonIdx = rule.lastIndexOf(this.COLON);

    const info: ArrayInfo = {};

    const badArraySyntax =
      leftIdx === -1 ||
      rightIdx === -1 ||
      leftIdx !== _leftIdx ||
      rightIdx !== _rightIdx ||
      !(leftIdx < rightIdx && rightIdx === maxIdx);

    if (badArraySyntax) this.template.throw(`bad array syntax '${rule}' for rules`);

    if (colonIdx !== -1) {
      if (colonIdx !== _colonIdx || colonIdx < leftIdx || colonIdx > rightIdx)
        this.template.throw(`bad range syntax '${rule}' for rules`);

      info.min = this.getRangeValue(rule, leftIdx, colonIdx);
      info.max = this.getRangeValue(rule, colonIdx, rightIdx);
    } else info.equal = this.getRangeValue(rule, leftIdx, rightIdx);

    this.checkRange({ min: info.min, max: info.max, equal: info.equal });

    info.type = this.getType(rule, leftIdx);

    return info;
  }

  private checkRange(range: Omit<ArrayInfo, "type">) {
    const { min, max, equal } = range;

    if (this.typeCheck.isNaN(min)) this.template.throw(`invalid minimum value '${min}'`);
    if (this.typeCheck.isNaN(max)) this.template.throw(`invalid maximum value '${max}'`);
    if (this.typeCheck.isNaN(min)) this.template.throw(`invalid equality value '${equal}'`);
  }

  private getRangeValue(rule: string, start: number, end: number): number | undefined {
    let value: string = "";
    for (let i = start + 1; i < end; i++) value += rule[i];
    return value === "" ? undefined : +value;
  }

  private validateRange(param: string, value: any[], range: Omit<ArrayInfo, "type">) {
    const { min, max, equal } = range;
    const l = value.length;
    const errorOption: ValidationErrorOptions = {
      prop: param,
      measurement: "length",
      value: l,
    };

    const isEqual = this.typeCheck.isNumber(equal);
    const isMin = this.typeCheck.isNumber(min);
    const isMax = this.typeCheck.isNumber(max);

    if (isEqual) {
      if (l === equal) return;

      errorOption.equality = equal;
    } else if (isMin && isMax) {
      if (l >= min && l <= max) return;

      errorOption.min = min;
      errorOption.max = max;
    } else if (isMin && !isMax) {
      if (l >= min) return;

      errorOption.min = min;
    } else if (!isMin && isMax) {
      if (l <= max) return;

      errorOption.max = max;
    } else return;

    throw new ValidationError(errorOption);
  }

  private getType(rule: string, end: number): string {
    let value: string = "";
    for (let i = 0; i < end; i++) value += rule[i];
    return value;
  }

  private getTypeValidator(type?: string, karman?: Karman): TypeValidatorInArray {
    const key: keyof TypeCheck = this.typeCheck.CorrespondingMap[type ?? ""];
    const schema: SchemaType | undefined = karman?.$getRoot()?.$schema.get(type ?? "");

    if (!key && !schema) this.template.throw(`invalid type '${type}'`);

    let validator: TypeValidatorInArray = (param: string, index: number, value: any) => {
      if (!(this.typeCheck[key] as (value: any) => boolean)(value))
        throw new ValidationError({
          prop: `${param}[${index}]`,
          value,
          type,
        });
    };

    if (schema) {
      validator = (param: string, index: number, value: any) => {
        schema.validate.call(schema, { param: `${param}[${index}]`, value } as ValidateOption);
      };
    }

    return validator;
  }
}
