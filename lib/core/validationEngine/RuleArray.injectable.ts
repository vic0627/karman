import Injectable from "src/decorator/Injectable.decorator";
import StringRule from "./StringRule.injectable";
import { symbolToken } from "src/utils/common";
import { RuleArrayExecutorArgs, RuleArrayQueueObject, RuleArrayType, ValidRule } from "src/types/ruleObject.type";
import type { RuleValidator } from "src/types/ruleLiteral.type";
import type { RuleErrorOption } from "src/types/ruleError.type";

@Injectable()
export default class RuleArray {
  /**
   * 規則陣列暫存區
   * @description 所有規則陣列在存放前，內部每條規則都必須先經過評估，取得相應的驗證器後才能存放至這裡。
   */
  #storage: Map<symbol, RuleArrayQueueObject> = new Map();

  /** 暫存區存放的規則陣列數量 */
  get size() {
    return this.#storage.size;
  }

  constructor(private readonly stringRule: StringRule) {}

  /** 定義聯集規則 */
  defineUnion(...rules: ValidRule[]) {
    return this.#define(RuleArrayType.union, rules);
  }

  /** 定義交集規則 */
  defineIntersection(...rules: ValidRule[]) {
    return this.#define(RuleArrayType.intersection, rules);
  }

  /**
   * 尋找規則陣列
   * @param token 規則物件的憑證
   * @returns 1. `type` - 聯、交集 2. `rules` - 參數驗證器們 3. `executor` - 規則陣列的執行函式
   */
  find(token: symbol) {
    const ruleArray = this.#storage.get(token);

    if (!ruleArray) {
      throw new Error("No such rule array has been found.");
    }

    const { type, rules } = ruleArray;

    return {
      type,
      rules,
      executor: (param: string, value: unknown) => this.#execute({ type, rules, param, value }),
    };
  }

  #define(type: RuleArrayType, rules: ValidRule[]) {
    const token = symbolToken(rules.toString());

    if (this.#storage.has(token)) {
      throw new Error(`Duplicate ${type} array detected.`);
    }

    const _rules = this.#evaluate(rules) as RuleValidator[];

    this.#storage.set(token, { type, rules: _rules });

    return token;
  }

  #evaluate(rules: ValidRule[]) {
    return rules.map((rule) => this.stringRule.evaluate(rule));
  }

  #execute({ type, rules, param, value }: RuleArrayExecutorArgs): RuleErrorOption {
    let exam: RuleErrorOption = { valid: false, msg: null };

    /** @todo union rules 的錯誤訊息不準確 */
    let record = false;

    for (const i in rules) {
      const validator = rules[i];
      const { valid, msg } = validator(param, value);

      const union = type === RuleArrayType.union;
      const intersection = type === RuleArrayType.intersection;

      if (union) {
        if (!record || valid) {
          exam = { valid, msg };
          record = true;
        }

        if (valid) {
          break;
        }
      }

      if (intersection) {
        exam = { valid, msg };

        if (!valid) {
          break;
        }
      }
    }

    if (exam) {
      return exam;
    }

    throw new Error("Validation progress failed in unexpected circumstance.");
  }
}
