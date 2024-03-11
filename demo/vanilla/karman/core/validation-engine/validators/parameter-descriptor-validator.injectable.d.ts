import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import { ParameterDescriptor } from "@/types/karman/rules.type";
import TypeCheck from "@/utils/type-check.provider";
export type RangeValidateOption = Pick<ParameterDescriptor, "min" | "max" | "equality" | "measurement"> & Pick<ValidateOption, "param" | "value">;
export default class ParameterDescriptorValidator implements Validator {
    private readonly typeCheck;
    constructor(typeCheck: TypeCheck);
    validate(option: ValidateOption): void;
    private isParameterDescriptor;
    private requiredValidator;
    private getMeasureTarget;
    private rangeValidator;
    private getErrorMessage;
}
//# sourceMappingURL=parameter-descriptor-validator.injectable.d.ts.map