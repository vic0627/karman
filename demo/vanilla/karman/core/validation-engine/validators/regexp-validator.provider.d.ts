import Validator, { ValidateOption } from "@/abstract/parameter-validator.abstract";
import { RegularExpression } from "@/types/karman/rules.type";
export interface RegExpValidateOption extends Omit<ValidateOption, "rule"> {
    rule: RegularExpression;
}
export type RegExpValidateStrategy = (option: RegExpValidateOption) => void;
export default class RegExpValidator implements Validator {
    validate(option: ValidateOption): void;
    private isPureRegExp;
    private isRegExpWithMessage;
    private isLegalRegExp;
    private getStrategy;
    private getErrorMessage;
    private pureRegExp;
    private regExpWithMessage;
}
//# sourceMappingURL=regexp-validator.provider.d.ts.map