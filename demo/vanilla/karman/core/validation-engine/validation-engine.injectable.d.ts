import FunctionalValidator from "./validators/functional-validator.injectable";
import ParameterDescriptorValidator from "./validators/parameter-descriptor-validator.injectable";
import RegExpValidator from "./validators/regexp-validator.provider";
import TypeValidator from "./validators/type-validator.injectable";
import { PayloadDef } from "@/types/karman/payload-def.type";
import { CustomValidator, ParamRules } from "@/types/karman/rules.type";
import TypeCheck from "@/utils/type-check.provider";
import UnionRules from "./rule-set/union-rules";
import IntersectionRules from "./rule-set/intersection-rules";
import Template from "@/utils/template.provider";
export default class ValidationEngine {
    private readonly functionalValidator;
    private readonly parameterDescriptorValidator;
    private readonly regexpValidator;
    private readonly typeValidator;
    private readonly typeCheck;
    private readonly template;
    constructor(functionalValidator: FunctionalValidator, parameterDescriptorValidator: ParameterDescriptorValidator, regexpValidator: RegExpValidator, typeValidator: TypeValidator, typeCheck: TypeCheck, template: Template);
    defineCustomValidator(validatefn: (param: string, value: any) => void): CustomValidator;
    defineUnionRules(...rules: ParamRules[]): UnionRules;
    defineIntersectionRules(...rules: ParamRules[]): IntersectionRules;
    getMainValidator(payload: Record<string, any>, payloadDef: PayloadDef): () => void;
    private getRules;
    private ruleSetAdapter;
    private getValidatorByRules;
    private validateInterface;
}
//# sourceMappingURL=validation-engine.injectable.d.ts.map