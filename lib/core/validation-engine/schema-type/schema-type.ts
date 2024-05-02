import { ValidateOption } from "@/abstract/parameter-validator.abstract";
import Karman from "@/core/karman/karman";
import { Schema } from "@/types/payload-def.type";
import ValidationError from "../validation-error/validation-error";
import RuleSet from "../rule-set/rule-set";

/**
 * @issue
 * 1. default value of schema
 * 2. schema to payloadDef
 */

type ValidateFn = (value: any) => void;

export default class SchemaType {
  readonly #name: string;
  readonly #scope: Karman;
  readonly #def: Schema;
  #validFn?: ValidateFn;

  get name() {
    return this.#name;
  }

  get scope() {
    return this.#scope;
  }

  get def() {
    return this.#def;
  }

  get keys() {
    return Object.keys(this.def);
  }

  get values() {
    return Object.values(this.def);
  }

  constructor(scope: Karman, name: string, def: Schema) {
    this.#scope = scope;
    this.#name = name;
    this.#def = def;

    this.circularRefCheck();
  }

  private circularRefCheck() {
    this.traverseStringRules((rule: string) => this.checkRefByString(rule));
  }

  private checkRefByString(rules: string) {
    if (rules.includes("[")) rules = rules.split("[")[0];

    const circular = rules === this.name;

    // break recursion
    if (circular) throw new ReferenceError(`Circular reference in SchemaType '${rules}'`);

    const schema = this.scope.$schema.get(rules);

    if (!schema) return;

    schema.traverseStringRules((rule: string) => this.checkRefByString(rule));
  }

  traverseStringRules(cb: (rule: string) => void) {
    this.values.forEach((def) => {
      const { rules } = def ?? {};

      if (!rules) return;

      if (typeof rules === "string") cb(rules);

      const stringRules: string[] = [];
      if (Array.isArray(rules)) stringRules.push(...(rules.filter((value) => typeof value === "string") as string[]));
      if (rules instanceof RuleSet) stringRules.push(...rules.getStringRules());
      stringRules.forEach((str) => cb(str));
    });
  }

  setValidFn(validFn: ValidateFn) {
    if (typeof validFn !== "function") return;

    this.#validFn = validFn;
  }

  validate(option: ValidateOption): void {
    const { param, value } = option;

    try {
      if (typeof value !== "object" || value === null || Array.isArray(value))
        throw new ValidationError({
          prop: param,
          value,
          type: this.name,
        });

      this.#validFn?.(value);
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;

      const errorMsg = `'${param}' does not match to the SchemaType '${this.name}'.\nReason: ${error.message}`;

      throw new ValidationError(errorMsg);
    }
  }
}
