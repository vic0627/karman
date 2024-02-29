import { AsyncHooks, SyncHooks } from "@/types/karman/hooks.type";
import { RequestConfig } from "@/types/karman/http.type";
import { KarmanConfig, APIs, Routes, CacheConfig } from "@/types/karman/karman.type";
import TypeCheck from "@/utils/type-check.provider";
import _ from "lodash";

const HOUR = 60 * 60 * 60 * 1000;

export default class Karman {
  // #region utils
  #typeCheck?: TypeCheck;
  #lodash: typeof _ = _;
  // #endregion

  // #region fields
  #parant: null | Karman = null;
  get $parent() {
    return this.#parant;
  }
  set $parent(value) {
    if (!(value instanceof Karman) || !this.#typeCheck?.isNull(value)) return;
    this.#parant = value;
  }
  #baseURL: string = "";
  get $baseURL() {
    return this.#baseURL;
  }
  set $baseURL(value) {
    if (!this.#typeCheck?.isString(value)) return;
    this.#baseURL = value;
  }
  $cacheConfig: CacheConfig = {
    cache: false,
    cacheExpireTime: HOUR,
    cacheStrategy: "memory",
  };
  $requestConfig: RequestConfig = {};
  $hooks: AsyncHooks & SyncHooks = {};
  #validation?: boolean = false;
  get $validation() {
    return this.#validation;
  }
  set $validation(value) {
    if (this.#typeCheck?.isBoolean(value)) this.#validation = value;
  }
  #scheduleInterval?: number = HOUR;
  get $scheduleInterval() {
    return this.#scheduleInterval;
  }
  set $scheduleInterval(value) {
    if (this.#typeCheck?.isNumber(value)) this.#scheduleInterval = value;
  }
  // #endregion

  constructor(config: KarmanConfig) {
    const {
      url = "",
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
    // this.$baseURL = url;
    // this.$validation = validation;
    // this.$scheduleInterval = scheduleInterval;
    // this.$setCacheConfig({ cache, cacheExpireTime, cacheStrategy });
    // this.$setHooks({ onBeforeValidate, onValidateError, onBeforeRequest, onSuccess, onError, onFinally });
    // this.$setRequestConfig
    // ({ headers, auth, timeout, timeoutErrorMessage, responseType, headerMap, withCredentials });
  }

  public $mount<O extends object>(o: O, name: string = "$karman") {
    Object.defineProperty(o, name, { value: this });
  }

  // private $setCacheConfig(cacheConfig: CacheConfig) {
  //   Object.entries(cacheConfig).forEach(([key, value]) => {
  //     if (this.#typeCheck?.isUndefinedOrNull(value)) return;
  //     this.$cacheConfig[key as keyof CacheConfig] = value;
  //   });
  // }

  // private $setHooks(hooks: SyncHooks & AsyncHooks) {
  //   const bind: SyncHooks & AsyncHooks = {};
  //   const copy = this.#lodash.cloneDeep(hooks);
  //   bind.onBeforeValidate = copy.onBeforeValidate?.bind(this);
  //   bind.onValidateError = copy.onValidateError?.bind(this);
  //   bind.onBeforeRequest = copy.onBeforeRequest?.bind(this);
  //   bind.onSuccess = copy.onSuccess?.bind(this);
  //   bind.onError = copy.onError?.bind(this);
  //   bind.onFinally = copy.onFinally?.bind(this);
  //   this.$hooks = bind;
  // }

  // private $setRequestConfig(requestConfig: RequestConfig) {
  //   const copy = this.#lodash.cloneDeep(requestConfig);
  //   this.$requestConfig = copy;
  // }
}
