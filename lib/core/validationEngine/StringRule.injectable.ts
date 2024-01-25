import Injectable from "src/decorator/Injectable.decorator";
import TypeLib from "./TypeLib.provider";
import { ByteConvertor } from "src/utils/Byte.provider";
import type { Limitation, Rule, RuleLiteral, RuleValidator, TypeMetadata } from "src/types/ruleLiteral.type";
import { RuleErrorOption } from "src/types/ruleError.type";
import { ValidRule } from "src/types/ruleObject.type";

/**
 * # 驗證規則解析模組
 *
 * 此模組會接收驗證規則，經解析、評估後返回符合該規則的驗證函式，
 * 當前可用的驗證規則有三種格式：
 *
 * 1. user-servcie 內建的規則語法
 * 2. 函式
 * 3. 正則表達式
 *
 * ## 內建的規則語法
 *
 * 內建的規則語法，可定義包括參數的型別、單位長度、陣列等規則，
 * 整個字串的字母都將以小寫構成，首先最基本的語法是：
 *
 *    ```bash
 *    <TYPE>              # 指定參數型別為 <TYPE>
 *    ```
 *
 * 此語法可以定義參數需要符合某個型別，像是 `string`、`int`、`number`...等等。
 *
 * 再來，如果該型別是可數的，例如 `number`，或字串與陣列的 `length`，那就可以使用數量限制語法，
 * 此語法將在型別後面加入 `@` 符號，而符號後定義欲限制的數量：
 *
 *    ```bash
 *    <TYPE>@<EQUAL>      # 指定參數型別為 <TYPE>，且單位長度需等於 <EQUAL>
 *    ```
 *
 * 例如 `string@5` 就代表參數必須為字串，且字串長度必須等於 5。
 *
 * 型別在定義了數量後，還可以更進一步地去定義範圍，而範圍限制語法需要使用 `:` 符號，
 * 可限制該參數的最大、最小值：
 *
 *    ```bash
 *    <TYPE>@<MIN>:       # 指定參數型別為 <TYPE>，且最小值為 <MIN>
 *    <TYPE>@:<MAX>       # 指定參數型別為 <TYPE>，且最大值為 <MAX>
 *    <TYPE>@<MIN>:<MAX>  # 指定參數型別為 <TYPE>，且最小值為 <MIN> 最大值為 <MAX>
 *    ```
 *
 * ### 位元組語法
 *
 * 在像是 `Blob`、`File` 等物件，是可以以位元組作為計量單位時，可將最大、最小、等值加入位元組單位：
 *
 *    ```bash
 *    file@:5mb           # 指定參數須為小於等於 5mb 的檔案
 *    ```
 *
 * 可使用的單位有 `b`、`kb`、`mb`、`gb`、`tb`、`pb`、`eb`、`zb`、`yb`。
 *
 * ### 陣列語法
 *
 * 此語法可以指定參數須為陣列，陣列語法須以上述語法為前綴，指定陣列中的每一項皆須符合特定規則，
 * 假設上述所有語法可以表示為 `<T>`，基本的陣列語法會是：
 *
 *    ```bash
 *    <T>[]               # 指定參數是一個以 <T> 構成的陣列
 *    ```
 *
 * 而陣列本身的長度就是可數的，因此可以指定其長度限制：
 *
 *    ```bash
 *    <T>[<EQUAL>]        # 指定參數是一個以 <T> 構成的陣列，且陣列長度等於 <EQUAL>
 *    <T>[<MIN>:]         # 指定參數是一個以 <T> 構成的陣列，且陣列長度大於等於 <MIN>
 *    <T>[:<MAX>]         # 指定參數是一個以 <T> 構成的陣列，且陣列長度小於等於 <MAX>
 *    <T>[<MIN>:<MAX>]    # 指定參數是一個以 <T> 構成的陣列，且陣列長度大於等於 <MIN> 小於等於 <MAX>
 *    ```
 *
 * ### 綜合範例
 *
 *    ```bash
 *    string              # 指定參數型別為字串
 *    string@10           # 指定參數為長度等於 10 的字串
 *    int@1:              # 指定參數須為正整數
 *    number@:100         # 指定參數須為小於等於 100 的任意數字
 *    int@0:1             # 指定參數須為數字 0 或 1
 *    int@0:1[32]         # 指定參數是一個 0 或 1，且長度等於 32 的陣列
 *    any[1:]             # 指定參數是以任何型別構成，且長度大於等於 1 的陣列
 *    file@:1mb[:5]       # 指定參數是以小於 1mb 的檔案構成，且長度小於等於 5 的陣列
 *    ```
 *
 * ## 函式驗證器
 *
 * 傳傳入的規則是一個函式，此模組會先檢驗其回傳值是否符合以下格式：
 *
 *    ```ts
 *    type RuleValidator = (param: string, value: unknown) => {
 *      valid: boolean;
 *      msg: string | null;
 *    }
 *    ```
 *
 * - `param`：參數名稱
 * - `value`：參數值
 * - `valid`：是否通過驗證
 * - `msg`：錯誤訊息
 */
@Injectable()
export default class StringRule {
  #limitSymbol = "@";
  #rangeSymbol = ":";
  #leftSquareBracket = "[";
  #rightSquareBracket = "]";

  constructor(
    private readonly typeLib: TypeLib,
    private readonly byteConvertor: ByteConvertor,
  ) {}

  /**
   * 是否為純粹的型別，不包含數量限制、陣列語法
   */
  isPureType(rot: string) {
    return this.typeLib.has(rot);
  }

  /**
   * 是否含數量限制語法符號 `@`
   * @description 此函式不會確認型別本身可不可數，儘會確認其是否函數量限制，且數量限制符號的語法是否正確
   */
  hasLimitation(rot: string) {
    /** 從左開始找 */
    const firstLimit = rot.indexOf(this.#limitSymbol);
    /** 從右開始找 */
    const lastLimit = rot.lastIndexOf(this.#limitSymbol);
    /** 符號存在，且不重複 */
    const validLimit = firstLimit !== -1 && firstLimit === lastLimit;
    /** 符號不存在 */
    const noLimit = firstLimit === -1;

    if (validLimit) {
      return true;
    }

    if (noLimit) {
      return false;
    }

    throw new SyntaxError(`Bad limitation syntax '${rot}'.`);
  }

  /**
   * 是否含陣列語法
   */
  hasArray(rot: string) {
    /** 從左開始找左括號 */
    const LBracketIdx = rot.indexOf(this.#leftSquareBracket);
    /** 從右開始找左括號 */
    const LBracketLastIdx = rot.lastIndexOf(this.#leftSquareBracket);
    /** 左括號存在，且不重複 */
    const hasValidLBracket = LBracketIdx !== -1 && LBracketIdx === LBracketLastIdx;

    /** 從左開始找右括號 */
    const RBracketIdx = rot.indexOf(this.#rightSquareBracket);
    /** 從右開始找右括號 */
    const RBracketLastIdx = rot.lastIndexOf(this.#rightSquareBracket);
    /** 右括號存在，且不重複、為字串中最後一個字元 */
    const hasValidRBracket = RBracketIdx !== -1 && RBracketIdx === RBracketLastIdx && RBracketIdx == rot.length - 1;

    /** 括號是否以正確順序排列(先左後右) */
    const rightOrder = LBracketIdx < RBracketIdx;

    /** 陣列語法存在，且語法正確 */
    const validArray = hasValidLBracket && hasValidRBracket && rightOrder;
    /** 陣列語法不存在，且語法正確 */
    const noArray = LBracketIdx === -1 && RBracketIdx === -1;

    if (validArray) {
      return true;
    }

    if (noArray) {
      return false;
    }

    throw new SyntaxError(`Bad array syntax '${rot}'.`);
  }

  /**
   * 是否含範圍語法
   * @description 此方法無法判斷該範圍語法屬於型別還是陣列，因此只能用在第一次規則語法拆解之後
   */
  hasRange(rot: string) {
    /** 從左開始找冒號 */
    const rangeIdx = rot.indexOf(this.#rangeSymbol);
    /** 從右開始找冒號 */
    const rangeLastIdx = rot.lastIndexOf(this.#rangeSymbol);
    /** 存在冒號且不重複 */
    const validRange = rangeIdx !== -1 && rangeIdx === rangeLastIdx;
    /** 冒號不存在 */
    const noRange = rangeIdx === -1;

    if (validRange) {
      return true;
    }

    if (noRange) {
      return false;
    }

    throw new SyntaxError(`Bad range syntax '${rot}'.`);
  }

  /**
   * 評估參數規則，返回驗證器
   */
  evaluate(rule: ValidRule) {
    // 1. 字串時，分析語法並轉譯成驗證函式
    if (typeof rule === "string") {
      return this.#evaluateRuleLiteral(rule);
    }

    // 2. 函式時，驗證其參數及回傳值
    if (typeof rule === "function") {
      const { valid, msg } = rule("test", null) ?? {};

      const invalidRule = typeof valid !== "boolean" || (typeof msg !== "string" && msg !== null);

      if (invalidRule) {
        throw new Error("Invalid validator function.");
      }

      return rule;
    }

    // 3. 正規表達式時，直接轉換成驗證函式
    if (rule instanceof RegExp) {
      return (param: string, value: unknown) => {
        const valid = rule.test(value as string);
        const msg = `Parameter '${param}' does not conform to the regular expression '${rule}'.`;

        return { valid, msg };
      };
    }

    // 4. 不接受的格式
    throw new Error(`Invalid rule '${String(rule)}'.`);
  }

  /**
   * 分析並評估規則字串語法的主要函式
   */
  #evaluateRuleLiteral(rot: RuleLiteral) {
    // 1. 整理字串，排除所有空格並轉換為小寫
    rot = rot.replaceAll(" ", "");
    rot = rot.toLowerCase();

    // 2. 純型別時，直接生成驗證器並返回
    if (this.isPureType(rot)) {
      return this.#validatorGenerator({ type: rot });
    }

    // 3. 函其他語法時，先驗證是否有陣列語法
    return this.#arrayPipe(rot);
  }

  /**
   * 陣列語法分析管道
   */
  #arrayPipe(rot: RuleLiteral) {
    // 1. 不含陣列語法，直接返回數量限制語法管道
    if (!this.hasArray(rot)) {
      return this.#limitationPipe(rot);
    }

    // 2. 解構陣列語法
    const [_rot, _arrLimit] = rot.split(this.#leftSquareBracket);

    const arrLimit = _arrLimit.replace(this.#rightSquareBracket, "");

    const arrayOptions: Limitation = {};

    // 2-1. 陣列含有範圍語法時，解構它
    if (this.hasRange(arrLimit)) {
      let min: string | number, max: string | number;
      [min, max] = arrLimit.split(this.#rangeSymbol) as string[];

      const noMin = min === "";
      const noMax = max === "";
      const lackOfValue = noMin && noMax;

      min = +min as number;
      max = +max as number;

      const badSyntax = isNaN(min) || isNaN(max) || lackOfValue;

      if (badSyntax) {
        throw new SyntaxError(`Unexpected limitation of array '${arrLimit}'.`);
      }

      if (!noMin || min || min === 0) {
        arrayOptions.min = min;
      }

      if (!noMax || max || max === 0) {
        arrayOptions.max = max;
      }
    } else if (!isNaN(+arrLimit) && arrLimit !== "") {
      arrayOptions.equal = +arrLimit;
    } else if (arrLimit !== "") {
      throw new SyntaxError("Bad array limitation.");
    }

    // 3. 將剝除陣列語法後的規則語法、陣列配置，傳入數量限制語法管道
    return this.#limitationPipe(_rot, arrayOptions);
  }

  /**
   * 數量限制語法管道
   */
  #limitationPipe(rot: RuleLiteral, arrayOptions?: Limitation) {
    // 1. 解構數量限制語法
    const [type, limitation] = rot.split(this.#limitSymbol);

    // 1-1. 判斷型別是否存在
    if (!this.isPureType(type)) {
      throw new SyntaxError(`Unexpected type '${type}'.`);
    }

    const typeInfo = this.typeLib.get(type) as TypeMetadata;

    const result: Rule = { type, typeInfo };

    const configLimitation = (target: Limitation, targetKey: keyof Limitation, limitValue: number | undefined) => {
      const invalidLimit = !(limitValue || limitValue === 0);

      if (invalidLimit) {
        return;
      }

      target[targetKey] = limitValue;
    };

    // 2. 若有陣列配置時，將配置寫入結果
    if (arrayOptions) {
      const { min, max, equal } = arrayOptions;

      result.hasArray = true;

      const arrayLimitation: Limitation = {};

      configLimitation(arrayLimitation, "min", min);
      configLimitation(arrayLimitation, "max", max);
      configLimitation(arrayLimitation, "equal", equal);

      if (Object.keys(arrayLimitation).length) {
        result.arrayLimitation = arrayLimitation;
      }
    }

    // 3. 若沒有數量限制，直接返回生成驗證器，否則更新結果參數
    if (!limitation) {
      return this.#validatorGenerator(result);
    } else {
      result.limitation = true;
    }

    const { countable, allowBytes } = typeInfo;

    // 3-1. 型別不可數時，拋出例外
    if (!countable) {
      throw new SyntaxError(`Type '${type}' is uncountable.`);
    }

    const hasRange = this.hasRange(limitation);

    const typeLimitation: Limitation = {};

    // 4. 解構範圍語法
    if (hasRange) {
      let min: string | number | undefined, max: string | number | undefined;
      [min, max] = limitation.split(this.#rangeSymbol);

      const validLimit = (limit: string | number) =>
        limit === "" || (isNaN(+limit) && !this.byteConvertor.hasByteUnit(limit as string));

      const noMin = validLimit(min);
      const noMax = validLimit(max);
      const lackOfValue = noMin && noMax;

      if (lackOfValue) {
        throw new SyntaxError(`Unexpected limitation of type '${rot}'.`);
      }

      const illegalByte = !allowBytes && (this.byteConvertor.hasByteUnit(min) || this.byteConvertor.hasByteUnit(max));

      if (illegalByte) {
        throw new SyntaxError(`Type '${type}' cannot be measured in byte unit.`);
      }

      min = noMin ? undefined : this.byteConvertor.toNumber(min);
      max = noMax ? undefined : this.byteConvertor.toNumber(max);

      configLimitation(typeLimitation, "min", min);
      configLimitation(typeLimitation, "max", max);
    } else {
      const illegalByte = !allowBytes && this.byteConvertor.hasByteUnit(limitation);

      if (illegalByte) {
        throw new SyntaxError(`Type '${type}' cannot be measured in byte unit.`);
      }

      const equal = this.byteConvertor.toNumber(limitation);

      // console.log({ illegalByte, equal });

      configLimitation(typeLimitation, "equal", equal);
    }

    if (Object.keys(typeLimitation).length) {
      result.typeLimitation = typeLimitation;
    }

    // console.log({ type: result.type, result });

    // 5. 返回驗證器生成
    return this.#validatorGenerator(result);
  }

  /**
   * 生成驗證器
   */
  #validatorGenerator(options: Rule = { type: "any" }) {
    const {
      type,
      typeInfo = this.typeLib.get(type) as TypeMetadata,
      limitation = false,
      typeLimitation,
      hasArray = false,
      arrayLimitation,
    } = options;

    const { _type, measureUnit, test } = typeInfo;

    const subValidator: RuleValidator = (param, value) => {
      const typeExam = test(value);

      if (!typeExam) {
        return {
          valid: false,
          msg: `Parameter '${param}' must be in type '${_type}'.`,
        };
      } else if (!limitation) {
        return { valid: true, msg: null };
      }

      const msg = measureUnit
        ? `The ${measureUnit} of parameter '${param}' must be `
        : `The parameter '${param}' must be `;

      // console.log({ typeLimitation });

      return this.#rangeValidator(value, measureUnit, typeLimitation as Limitation, msg);
    };

    const validator: RuleValidator = (param, value) => {
      if (!hasArray) {
        return subValidator(param, value);
      }

      const _value = value as unknown[];

      if (arrayLimitation) {
        const arrayExam = this.#rangeValidator(
          value,
          "length",
          arrayLimitation,
          `The length of '${param}' array must be `,
        );

        if (!arrayExam.valid) {
          return arrayExam;
        }
      }

      for (const key in _value) {
        if (!Object.prototype.hasOwnProperty.call(_value, key)) {
          continue;
        }

        const value = _value[key];

        const _param = param + this.#leftSquareBracket + key + this.#rightSquareBracket;

        const typeExam = subValidator(_param, value);

        if (!typeExam.valid) {
          return typeExam;
        }
      }

      return { valid: true, msg: null } as RuleErrorOption;
    };

    return validator;
  }

  /**
   * 範圍驗證器
   */
  #rangeValidator(value: unknown, measureUnit: string | null, limitation: Limitation, msg: string): RuleErrorOption {
    const { min, max, equal } = limitation;

    const validEqual = equal !== undefined;
    const validMin = min !== undefined;
    const validMax = max !== undefined;

    let valid: boolean = true;
    const _value = (measureUnit ? (value as Record<string, unknown>)[measureUnit] : value) as number;

    if (validEqual) {
      valid = _value === equal;
      msg += `equal to ${equal}.`;
    } else if (validMin && validMax) {
      valid = _value >= min && _value <= max;
      msg += `not only greater than or equal to ${min}, but also less than or equal to ${max}.`;
    } else if (validMin) {
      valid = _value >= min;
      msg += `greater than or equal to ${min}.`;
    } else if (validMax) {
      valid = _value <= max;
      msg += `less than or equal to ${max}.`;
    }

    return { valid, msg };
  }
}
