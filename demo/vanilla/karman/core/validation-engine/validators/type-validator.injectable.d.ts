import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import TypeCheck from "@/utils/type-check.provider";
export default class TypeValidator implements Validator {
    private readonly typeCheck;
    constructor(typeCheck: TypeCheck);
    validate(option: ValidateOption): void;
    private legalType;
    private getValidator;
}
//# sourceMappingURL=type-validator.injectable.d.ts.map