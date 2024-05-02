import { KarmanInterceptors } from "@/types/hooks.type";
import { ReqStrategyTypes, RequestConfig } from "@/types/http.type";
import { CacheConfig, KarmanInstanceConfig } from "@/types/karman.type";
import { configInherit } from "@/core/out-of-paradigm/config-inherit";
import PathResolver from "@/utils/path-resolver.provider";
import TypeCheck from "@/utils/type-check.provider";
import { isString, isBoolean, isNumber, isFunction } from "lodash-es";
import SchemaType from "../validation-engine/schema-type/schema-type";

const HOUR = 60 * 60 * 60 * 1000;

export default class Karman {
  // #region utils
  protected _typeCheck!: TypeCheck;
  protected _pathResolver!: PathResolver;
  // #endregion

  // #region fields
  #root: boolean = false;
  get $root(): boolean {
    return this.#root;
  }
  set $root(value: boolean | undefined) {
    if (isBoolean(value)) this.#root = value;
  }
  #parent: null | Karman = null;
  get $parent() {
    return this.#parent;
  }
  set $parent(value) {
    if (value instanceof Karman) this.#parent = value;
  }
  #baseURL: string = "";
  get $baseURL() {
    return this.#baseURL;
  }
  set $baseURL(value) {
    if (!isString(value)) return;
    this.#baseURL = value;
  }
  $cacheConfig: CacheConfig = {
    cache: false,
    cacheExpireTime: HOUR,
    cacheStrategy: "memory",
  };
  $requestConfig: RequestConfig<ReqStrategyTypes> = {};
  $interceptors: KarmanInterceptors = {};
  #validation?: boolean;
  get $validation() {
    return this.#validation;
  }
  set $validation(value) {
    if (isBoolean(value)) this.#validation = value;
  }
  #scheduleInterval?: number;
  get $scheduleInterval() {
    return this.#scheduleInterval;
  }
  set $scheduleInterval(value) {
    if (isNumber(value)) this.#scheduleInterval = value;
  }
  #inherited = false;
  readonly $schema: Map<string, SchemaType> = new Map();
  // #endregion

  constructor(config: KarmanInstanceConfig) {
    const {
      root,
      url,
      validation,
      scheduleInterval,
      cache,
      cacheExpireTime,
      cacheStrategy,
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
      onRequest,
      onResponse,
    } = config ?? {};
    this.$baseURL = url ?? "";
    this.$root = root;
    this.$validation = validation;
    this.$scheduleInterval = scheduleInterval;
    this.$cacheConfig = { cache, cacheExpireTime, cacheStrategy };
    this.$requestConfig = {
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
    };
    this.$interceptors = { onRequest, onResponse };
  }

  public $mount<O extends object>(o: O, name: string = "$karman") {
    Object.defineProperty(o, name, { value: this });
  }

  public $use<T extends { install(k: Karman): void }>(plugin: T) {
    if (!this.$root) throw new Error("[karman error] plugins can only be installed from the root Karman!");

    if (!isFunction(plugin?.install)) throw new TypeError("[karman error] plugin must has an install function!");

    plugin.install(this);

    const onTraverse = (k: any) => {
      if (!(k instanceof Karman)) return;

      plugin.install(k);
      k.$traverseInstanceTree({ onTraverse });
    };

    this.$traverseInstanceTree({
      onTraverse,
    });
  }

  /**
   * Inheriting all configurations down to the whole Karman tree from root node.
   * Only allows to be invoked once on root layer.
   */
  public $inherit(): void {
    if (this.#inherited) return;

    if (this.$parent) {
      const { $baseURL, $requestConfig, $cacheConfig, $interceptors, $validation, $scheduleInterval } = this.$parent;
      this.$baseURL = this._pathResolver.resolve($baseURL, this.$baseURL);
      this.$requestConfig = configInherit($requestConfig, this.$requestConfig);
      this.$cacheConfig = configInherit($cacheConfig, this.$cacheConfig);
      this.$interceptors = configInherit($interceptors, this.$interceptors);
      if (this._typeCheck.isUndefined(this.$validation)) this.$validation = $validation;
      if (this._typeCheck.isUndefined(this.$scheduleInterval)) this.$scheduleInterval = $scheduleInterval;
    }

    this.$invokeChildrenInherit();
  }

  public $setDependencies(...deps: (TypeCheck | PathResolver)[]) {
    deps.forEach((dep) => {
      if (dep instanceof TypeCheck) this._typeCheck = dep;
      else if (dep instanceof PathResolver) this._pathResolver = dep;
    });
  }

  public $requestGuard(request: Function) {
    return (...args: any[]) => {
      if (!this.#inherited)
        console.warn(
          // eslint-disable-next-line @stylistic/max-len
          "[karman warn] Inherit event on Karman tree hasn't been triggered, please make sure you have specified the root Karman layer.",
        );

      return request(...args);
    };
  }

  public $getRoot() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: Karman = this;

    while (!node.$root && node.$parent) node = node.$parent;

    return node;
  }

  public $setSchema(name: string, schema: SchemaType) {
    if (this.$schema.has(name)) return console.warn(`[karman warn] duplicate SchemaType '${name}'`);

    this.$schema.set(name, schema);
  }

  private $invokeChildrenInherit(): void {
    this.$traverseInstanceTree({
      onTraverse: (prop) => {
        if (prop instanceof Karman) prop.$inherit();
      },
      onTraverseEnd: () => {
        this.#inherited = true;
      },
    });
  }

  private $traverseInstanceTree(
    {
      onTraverse,
      onTraverseEnd,
    }: {
      onTraverse: (value: any, index: number, array: any[]) => void;
      onTraverseEnd?: () => void;
    },
    instance = this,
  ) {
    Object.values(instance).forEach(onTraverse);
    onTraverseEnd?.();
  }
}
