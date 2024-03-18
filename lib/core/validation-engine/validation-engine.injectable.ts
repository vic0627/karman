import Injectable from "@/decorator/Injectable.decorator";
import FunctionalValidator from "./validators/functional-validator.injectable";
import ParameterDescriptorValidator from "./validators/parameter-descriptor-validator.injectable";
import RegExpValidator from "./validators/regexp-validator.provider";
import TypeValidator from "./validators/type-validator.injectable";
import type { ValidateOption } from "@/abstract/parameter-validator.abstract";
import { ParamDef, PayloadDef } from "@/types/payload-def.type";
import { CustomValidator, ParamRules } from "@/types/rules.type";
import RuleSet from "./rule-set/rule-set";
import TypeCheck from "@/utils/type-check.provider";
import UnionRules from "./rule-set/union-rules";
import IntersectionRules from "./rule-set/intersection-rules";
import Template from "@/utils/template.provider";
import ValidationError from "./validation-error/validation-error";

@Injectable()
export default class ValidationEngine {
  constructor(
    private readonly functionalValidator: FunctionalValidator,
    private readonly parameterDescriptorValidator: ParameterDescriptorValidator,
    private readonly regexpValidator: RegExpValidator,
    private readonly typeValidator: TypeValidator,
    private readonly typeCheck: TypeCheck,
    private readonly template: Template,
  ) {}

  public defineCustomValidator(validatefn: (param: string, value: any) => void): CustomValidator {
    if (!this.typeCheck.isFunction(validatefn)) {
      throw new TypeError("Invalid validator type.");
    }

    Object.defineProperty(validatefn, "_karman", { value: true });

    return validatefn as CustomValidator;
  }

  public defineUnionRules(...rules: ParamRules[]) {
    return new UnionRules(...rules);
  }

  public defineIntersectionRules(...rules: ParamRules[]) {
    return new IntersectionRules(...rules);
  }

  public getMainValidator(payload: Record<string, any>, payloadDef: PayloadDef) {
    const validatorQueue: (() => void)[] = [];
    Object.entries(payloadDef).forEach(([param, paramDef]) => {
      const value = payload[param];
      const { rules, required } = this.getRules(param, paramDef);

      if (!rules) return;

      const validator = this.getValidatorByRules(rules, required);
      validatorQueue.push(() => validator(param, value));
    });
    const mainValidator = () => validatorQueue.forEach((validator) => validator());

    return mainValidator;
  }

  private getRules(param: string, paramDef: ParamDef) {
    const { rules, required } = paramDef;

    if (!rules) {
      this.template.warn(`Cannot find certain rules for parameter "${param}".`);

      return {};
    }

    return { rules, required };
  }

  private ruleSetAdapter(rules: RuleSet, required: boolean) {
    const validator = (param: string, value: any) => {
      rules.execute((rule) => {
        this.validateInterface({ rule, param, value, required });
      });
    };

    return validator.bind(this);
  }

  private getValidatorByRules(rules: ParamRules | ParamRules[] | RuleSet, required: boolean = false) {
    if (rules instanceof RuleSet) {
      return this.ruleSetAdapter(rules, required);
    } else if (this.typeCheck.isArray(rules)) {
      const ruleSet = new IntersectionRules(...rules);

      return this.ruleSetAdapter(ruleSet as RuleSet, required);
    } else {
      const validator = (param: string, value: any) => {
        this.validateInterface({ rule: rules, param, value, required });
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

  private validateInterface(option: ValidateOption) {
    const { param, value, required } = option;
    const requiredValidation = this.requiredValidator(param, value, required);

    if (!requiredValidation) return;

    this.typeValidator.validate(option);
    this.regexpValidator.validate(option);
    this.functionalValidator.validate(option);
    this.parameterDescriptorValidator.validate(option);
  }
}
