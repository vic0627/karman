import Validator from "src/abstract/Validator.abstract";
import Injectable from "src/decorator/Injectable.decorator";
import { ParamRules, Type } from "src/types/karman/rules.type";
import TypeCheck from "src/utils/TypeCheck.provider";

@Injectable()
export default class TypeValidator implements Validator {
  constructor(private readonly typeCheck: TypeCheck) {}

  public validate(rule: ParamRules, value: any): void {
    if (!this.typeCheck.isString(rule)) {
      return;
    }

    const type = rule.toLowerCase();
  }

  private legalType(type: string) {
    if (!this.typeCheck.typeSet.includes(type as Type)) {
      throw new TypeError("undefined type:", type);
    }
  }
}
