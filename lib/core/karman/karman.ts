import { AsyncHooks, SyncHooks } from "@/types/karman/hooks.type";
import { ReqStrategyTypes, RequestConfig } from "@/types/karman/http.type";
import { KarmanConfig, APIs, Routes, CacheConfig, KarmanInstanceConfig } from "@/types/karman/karman.type";
import { configInherit } from "@/core/out-of-paradigm/config-inherit";
import PathResolver from "@/utils/path-rosolver.provider";
import TypeCheck from "@/utils/type-check.provider";
// import * as _ from "lodash";

declare const _: typeof import("lodash");

const HOUR = 60 * 60 * 60 * 1000;

export default class Karman {
  // #region utils
  private _typeCheck!: TypeCheck;
  private _pathResolver!: PathResolver;
  private _: typeof _ = _;
  // #endregion

  // #region fields
  #parant: null | Karman = null;
  get $parent() {
    return this.#parant;
  }
  set $parent(value) {
    if (value instanceof Karman) this.#parant = value;
  }
  #baseURL: string = "";
  get $baseURL() {
    return this.#baseURL;
  }
  set $baseURL(value) {
    if (!this._.isString(value)) return;
    this.#baseURL = value;
  }
  $cacheConfig: CacheConfig = {
    cache: false,
    cacheExpireTime: HOUR,
    cacheStrategy: "memory",
  };
  $requestConfig: RequestConfig<ReqStrategyTypes> = {};
  $hooks: AsyncHooks & SyncHooks = {};
  #validation?: boolean;
  get $validation() {
    return this.#validation;
  }
  set $validation(value) {
    if (this._.isBoolean(value)) this.#validation = value;
  }
  #scheduleInterval?: number;
  get $scheduleInterval() {
    return this.#scheduleInterval;
  }
  set $scheduleInterval(value) {
    if (this._.isNumber(value)) this.#scheduleInterval = value;
  }
  // #endregion

  #inherited = false;

  constructor(config: KarmanInstanceConfig) {
    const {
      baseURL,
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
      requestStrategy,
      onBeforeValidate,
      onValidateError,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    } = config ?? {};
    this.$baseURL = baseURL ?? url ?? "";
    this.$validation = validation;
    this.$scheduleInterval = scheduleInterval;
    this.$cacheConfig = { cache, cacheExpireTime, cacheStrategy };
    this.$hooks = { onBeforeValidate, onValidateError, onBeforeRequest, onSuccess, onError, onFinally };
    this.$requestConfig = {
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
    };
  }

  public $mount<O extends object>(o: O, name: string = "$karman") {
    Object.defineProperty(o, name, { value: this });
  }

  /**
   * Inheriting all configurations down to the whole Karman tree from root node.
   * Only allows to be invoked once on root layer.
   */
  public $inherit(): void {
    if (this.#inherited) return;

    if (this.$parent) {
      const { $baseURL, $requestConfig, $cacheConfig, $hooks, $validation, $scheduleInterval } = this.$parent;
      this.$baseURL = this._pathResolver.resolve($baseURL, this.$baseURL);
      this.$requestConfig = configInherit($requestConfig, this.$requestConfig);
      this.$cacheConfig = configInherit($cacheConfig, this.$cacheConfig);
      this.$hooks = configInherit($hooks, this.$hooks);
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

  private $invokeChildrenInherit(): void {
    Object.values(this).forEach((prop) => {
      if (prop instanceof Karman) prop.$inherit();
    });
    this.#inherited = true;
  }
}
