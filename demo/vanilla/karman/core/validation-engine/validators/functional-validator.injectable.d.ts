import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import TypeCheck from "@/utils/type-check.provider";
export default class FunctionalValidator implements Validator {
    private readonly typeCheck;
    constructor(typeCheck: TypeCheck);
    validate(option: ValidateOption): void;
    private isPrototype;
    private isCustomValidator;
    private instanceValidator;
}
//# sourceMappingURL=functional-validator.injectable.d.ts.map