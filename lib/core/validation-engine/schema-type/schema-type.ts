import { ValidateOption } from "@/abstract/parameter-validator.abstract";
import Karman from "@/core/karman/karman";
import { ParamDef, ParamPosition, Schema } from "@/types/payload-def.type";
import ValidationError from "../validation-error/validation-error";
import RuleSet from "../rule-set/rule-set";
import { cloneDeep } from "lodash-es";

/**
 * @issue
 * 1. default value of schema
 * 2. schema to payloadDef
 */

type ValidateFn = (value: any) => void;

export default class SchemaType {
  readonly #name: string;
  readonly #def: Schema;
  readonly #attachDef: Schema = {};
  #scope?: Karman;
  #validFn?: ValidateFn;

  get name() {
    return this.#name;
  }

  get scope() {
    return this.#scope;
  }

  get def() {
    const copyDef = cloneDeep(this.#def);

    for (const key in copyDef) {
      if (!copyDef[key]) copyDef[key] = {};

      Object.assign(copyDef[key] as ParamDef, this.#attachDef[key]);
    }

    return copyDef;
  }

  get keys() {
    return Object.keys(this.def);
  }

  get values() {
    return Object.values(this.def);
  }

  constructor(name: string, def: Schema) {
    this.#name = name;
    this.#def = def;
  }

  private chainScope() {
    const scope = {
      def: this.def,
      setRequired: this.setRequired.bind(this),
      setOptional: this.setOptional.bind(this),
      setPosition: this.setPosition.bind(this),
      setDefault: this.setDefault.bind(this),
    } as this;

    return scope;
  }

  public attach() {
    for (const prop in this.#def) this.#attachDef[prop] = {};

    return this.chainScope();
  }

  public setRequired(...names: (keyof Schema)[]) {
    return this.traverseDef(names, (_, prop) => (prop.required = true));
  }

  public setOptional(...names: (keyof Schema)[]) {
    return this.traverseDef(names, (_, prop) => (prop.required = false));
  }

  public setPosition(position: ParamPosition, ...names: (keyof Schema)[]) {
    if (!names.length) names = this.keys;

    return this.traverseDef(names, (_, prop) => {
      prop.position ??= [];
      if (Array.isArray(prop.position)) prop.position.push(position);
    });
  }

  public setDefault(name: string, defaultValue: () => any) {
    (this.#attachDef[name] as ParamDef).defaultValue = defaultValue;

    return this.chainScope();
  }

  private traverseDef(names: (keyof Schema)[], cb: (name: keyof Schema, prop: ParamDef) => void) {
    if (!names.length) names = this.keys;

    names.forEach((name) => {
      if (!(name in this.#def)) return;

      cb(name, this.#attachDef[name] as ParamDef);
    });

    return this.chainScope();
  }

  public $setScope(karman: Karman) {
    karman = karman.$getRoot();
    this.#scope = karman;
  }

  public circularRefCheck() {
    this.traverseStringRules((rule: string) => this.checkRefByString(rule));
  }

  private checkRefByString(rules: string) {
    if (rules.includes("[")) rules = rules.split("[")[0];

    const circular = rules === this.name;

    // break recursion
    if (circular) throw new ReferenceError(`Circular reference in SchemaType '${rules}'`);

    const schema = this.scope?.$schema.get(rules);

    if (!schema) return;

    schema.traverseStringRules((rule: string) => this.checkRefByString(rule));
  }

  public traverseStringRules(cb: (rule: string) => void) {
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

  public setValidFn(validFn: ValidateFn) {
    if (typeof validFn !== "function") return;

    this.#validFn = validFn;
  }

  public validate(option: ValidateOption): void {
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
