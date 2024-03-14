import Injectable from "@/decorator/Injectable.decorator";
import FunctionalValidator from "./validators/functional-validator.injectable";
import ParameterDescriptorValidator from "./validators/parameter-descriptor-validator.injectable";
import RegExpValidator from "./validators/regexp-validator.provider";
import TypeValidator from "./validators/type-validator.injectable";
import type { ValidateOption } from "@/abstract/parameter-validator.abstract";
import { PayloadDef } from "@/types/payload-def.type";
import { CustomValidator, ParamRules } from "@/types/rules.type";
import RuleSet from "./rule-set/rule-set";
import TypeCheck from "@/utils/type-check.provider";
import UnionRules from "./rule-set/union-rules";
import IntersectionRules from "./rule-set/intersection-rules";
import Template from "@/utils/template.provider";

@Injectable()
export default class ValidationEngine {
  constructor(
    private readonly functionalValidator: FunctionalValidator,
    private readonly parameterDescriptorValidator: ParameterDescriptorValidator,
    private readonly regexpValidator: RegExpValidator,
    private readonly typeValidator: TypeValidator,
    private readonly typeCheck: TypeCheck,
    private readonly template: Template
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
    Object.entries(payload).forEach(([param, value]) => {
      const rules = this.getRules(param, payloadDef);

      if (!rules) return;

      const validator = this.getValidatorByRules(rules);
      validatorQueue.push(() => validator(param, value));
    });
    const mainValidator = () => validatorQueue.forEach((validator) => validator());

    return mainValidator;
  }

  private getRules(param: string, payloadDef: PayloadDef) {
    const { rules } = payloadDef[param] ?? {};

    if (!rules) {
      this.template.warn(`Cannot find certain rules for parameter "${param}".`);

      return;
    }

    return rules;
  }

  private ruleSetAdapter(rules: RuleSet) {
    const validator = (param: string, value: any) => {
      rules.execute((rule) => {
        this.validateInterface({ rule, param, value });
      });
    };

    return validator.bind(this);
  }

  private getValidatorByRules(rules: ParamRules | ParamRules[] | RuleSet) {
    if (rules instanceof RuleSet) {
      return this.ruleSetAdapter(rules);
    } else if (this.typeCheck.isArray(rules)) {
      const ruleSet = new IntersectionRules(...rules);

      return this.ruleSetAdapter(ruleSet as RuleSet);
    } else {
      const validator = (param: string, value: any) => {
        this.validateInterface({ rule: rules, param, value });
      };

      return validator;
    }
  }

  private validateInterface(option: ValidateOption) {
    this.typeValidator.validate(option);
    this.regexpValidator.validate(option);
    this.functionalValidator.validate(option);
    this.parameterDescriptorValidator.validate(option);
  }
}
