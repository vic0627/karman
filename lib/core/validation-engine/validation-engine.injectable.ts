import Injectable from "@/decorator/Injectable.decorator";
import FunctionalValidator from "./validators/functional-validator.injectable";
import ParameterDescriptorValidator from "./validators/parameter-descriptor-validator.injectable";
import RegExpValidator from "./validators/regexp-validator.provider";
import TypeValidator from "./validators/type-validator.injectable";
import type { ValidateOption } from "@/abstract/parameter-validator.abstract";
import { ParamDef, PayloadDef, Schema } from "@/types/payload-def.type";
import { CustomValidator, ParamRules } from "@/types/rules.type";
import RuleSet from "./rule-set/rule-set";
import TypeCheck from "@/utils/type-check.provider";
import UnionRules from "./rule-set/union-rules";
import IntersectionRules from "./rule-set/intersection-rules";
import Template from "@/utils/template.provider";
import ValidationError from "./validation-error/validation-error";
import ArrayValidator from "./validators/array-validator.injectable";
import SchemaType from "./schema-type/schema-type";
import Karman from "../karman/karman";

type ValidateOptionInterface = Partial<Pick<ValidateOption, "rule">> &
  Omit<ValidateOption, "rule"> & { karman: Karman | undefined };

@Injectable()
export default class ValidationEngine {
  constructor(
    private readonly functionalValidator: FunctionalValidator,
    private readonly parameterDescriptorValidator: ParameterDescriptorValidator,
    private readonly regexpValidator: RegExpValidator,
    private readonly typeValidator: TypeValidator,
    private readonly arrayValidator: ArrayValidator,
    private readonly typeCheck: TypeCheck,
    private readonly template: Template,
  ) {}

  public isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }

  public defineCustomValidator(validateFn: (param: string, value: any) => void): CustomValidator {
    if (!this.typeCheck.isFunction(validateFn)) {
      throw new TypeError("Invalid validator type.");
    }

    Object.defineProperty(validateFn, "_karman", { value: true });

    return validateFn as CustomValidator;
  }

  public defineUnionRules(...rules: ParamRules[]) {
    return new UnionRules(...rules);
  }

  public defineIntersectionRules(...rules: ParamRules[]) {
    return new IntersectionRules(...rules);
  }

  public defineSchemaType(name: string, def: Schema): SchemaType {
    const existedType = this.typeCheck.TypeSet.includes(name);
    if (!this.typeCheck.isValidName(name) || existedType) this.template.throw(`invalid name '${name}' for schema type`);

    const schema = new SchemaType(name, def);
    schema.setValidFn(this.getSchemaValidator(schema));

    return schema;
  }

  private getSchemaValidator(schema: SchemaType) {
    return (value: any) => this.getMainValidator(schema.scope, value, schema.def)();
  }

  public getMainValidator(karman: Karman | undefined, payload: Record<string, any>, payloadDef: PayloadDef) {
    if (this.typeCheck.isArray(payloadDef)) return () => {};

    // ensure karman to be a root node
    if (karman instanceof Karman) karman = karman.$getRoot();

    const validatorQueue: (() => void)[] = [];
    Object.entries(payloadDef).forEach(([param, paramDef]) => {
      if (!paramDef) return;

      // Don't assign the default value to the payload here,
      // but use the default value to run the validation.
      const value = payload[param] ?? paramDef.defaultValue?.();
      const { rules, required } = this.getRules(param, paramDef);
      const validator = this.getValidatorByRules(karman, rules, required);
      validatorQueue.push(() => validator(param, value));
    });
    const mainValidator = () => validatorQueue.forEach((validator) => validator());

    return mainValidator;
  }

  private getRules(param: string, paramDef: ParamDef) {
    const { rules, required } = paramDef;

    if (!rules && this.typeCheck.isUndefined(required)) {
      this.template.warn(`Cannot find certain rules for parameter "${param}".`);

      return {};
    }

    return { rules, required };
  }

  private ruleSetAdapter(karman: Karman | undefined, rules: RuleSet, required: boolean) {
    const validator = (param: string, value: any) => {
      rules.execute((rule) => {
        this.validateInterface({ rule, param, value, required, karman });
      });
    };

    return validator;
  }

  private getValidatorByRules(
    karman: Karman | undefined,
    rules?: ParamRules | ParamRules[] | RuleSet,
    required: boolean = false,
  ) {
    if (rules instanceof RuleSet) {
      return this.ruleSetAdapter(karman, rules, required);
    } else if (this.typeCheck.isArray(rules)) {
      const ruleSet = new IntersectionRules(...rules);

      return this.ruleSetAdapter(karman, ruleSet as RuleSet, required);
    } else {
      const validator = (param: string, value: any) => {
        this.validateInterface({ rule: rules, param, value, required, karman });
      };

      return validator;
    }
  }

  private requiredValidator(param: string, value: any, required: boolean): boolean {
    const empty = this.typeCheck.isUndefinedOrNull(value);

    if (!empty) return true;

    if (required && empty) throw new ValidationError({ prop: param, value, required });

    return false;
  }

  private validateInterface(option: ValidateOptionInterface) {
    const { karman, param, value, required, rule } = option;

    const requiredValidation = this.requiredValidator(param, value, required);

    if (!requiredValidation || !rule) return;

    if (this.arrayValidator.maybeArraySyntax(rule)) this.arrayValidator.validate(option as ValidateOption, karman);
    else this.typeValidator.validate(option as ValidateOption, karman);
    this.regexpValidator.validate(option as ValidateOption);
    this.functionalValidator.validate(option as ValidateOption);
    this.parameterDescriptorValidator.validate(option as ValidateOption);
  }
}
