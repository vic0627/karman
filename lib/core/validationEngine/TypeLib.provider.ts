import type { BasicType, TypeDef, TypeMetadata, TypeValidator } from "src/types/ruleLiteral.type";
import TYPES from "src/assets/TYPES";
import { pureLowerCase } from "src/utils/common";
import { TypeLibrary, TypeLibWithName } from "src/types/typeLib.type";

export default class TypeLib {
  /** 型別字典 */
  #lib = new Map<string, TypeMetadata>();

  #typeLib: TypeLibrary = {};

  get #global() {
    return "$global";
  }

  constructor() {
    this.initLib();
  }

  // #region new feature
  // initLib(namespace: keyof TypeLibrary = this.#global) {
  //   let lib = this.chooseLib(namespace);

  //   if (!lib) {
  //     this.#typeLib[namespace] = new Map<string, TypeMetadata>();
  //     lib = this.chooseLib(namespace);
  //   }

  //   TYPES.forEach((def) => {
  //     lib?.add(...def);
  //   });
  // }
  initLib() {
    this.#lib.clear();

    TYPES.forEach((def) => {
      this.#add(...def);
    });
  }

  chooseLib(namespace: keyof TypeLibrary = this.#global) {
    const lib = this.#typeLib[namespace];

    if (!lib) {
      return;
    }

    return {
      lib,
      add: this.#addByLib(lib),
      hasType: this.#hasByLib(lib),
      getType: this.#getByLib(lib),
    };
  }

  #hasByLib(lib: TypeLibWithName) {
    return (type: string) => {
      return lib.has(type);
    };
  }

  #getByLib(lib: TypeLibWithName) {
    return (type: string) => {
      return lib.get(type);
    };
  }

  #addByLib(lib: TypeLibWithName) {
    return (...typeDef: TypeDef) => {
      const [type, countable, measureUnit, allowBytes, proto, test] = typeDef;

      const typeInfo: TypeMetadata = {
        _type: type,
        countable,
        measureUnit,
        allowBytes,
        proto,
        test,
      };

      lib.set(type, typeInfo);
    };
  }
  // #endregion

  has(type: string) {
    return this.#lib.has(type);
  }

  get(type: string): TypeMetadata | undefined {
    return this.#lib.get(type);
  }

  #add(...typeDef: TypeDef) {
    const [type, countable, measureUnit, allowBytes, proto, test] = typeDef;

    const typeInfo: TypeMetadata = {
      _type: type,
      countable,
      measureUnit,
      allowBytes,
      proto,
      test,
    };

    this.#lib.set(type, typeInfo);
  }

  /**
   * 定義自定義型別
   * @description 為保持穩定性，目前僅允許定義不可數型別
   * @param type 型別名稱，全英文字母小寫，不接受空格及特殊字元
   * @param validator 型別驗證函式
   */
  defineType(type: string, validator: TypeValidator) {
    // 1. 檢查型別名稱

    // 1-1. 檢查型別
    if (typeof type !== "string") {
      throw new TypeError(`Invalid type '${typeof type}' for 'type'`);
    }

    const duplicateTypes = this.has(type);

    // 1-2. 檢查有無重複定義
    // 目前以 "新定義" 複寫 "舊定義" 為主，不強制使用者修改名稱
    if (duplicateTypes) {
      console.warn(
        "The system will overwrite the existing type with the newly defined type if a duplicate type is detected",
      );
    }

    // 1-3. 檢查名稱規則
    if (!pureLowerCase(type)) {
      throw new SyntaxError(`Bad type syntax '${type}'`);
    }

    const res = validator(null);

    // 2. 檢查驗證函式回傳值
    if (typeof res !== "boolean") {
      throw new TypeError("Type validator must return boolean value in any case");
    }

    this.#add(type as BasicType, false, null, false, null, validator);

    return type;
  }
}
