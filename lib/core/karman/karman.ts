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
  // #region deps
  _typeCheck!: TypeCheck;
  _pathResolver!: PathResolver;
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
  get $inherited() {
    return this.#inherited;
  }
  readonly $schema: Map<string, SchemaType> = new Map();
  $rx?: boolean;
  // #endregion

  constructor(config: KarmanInstanceConfig) {
    const {
      root,
      url,
      validation,
      scheduleInterval,
      rx,
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
    // this.$root = root;
    this.$validation = validation;
    this.$scheduleInterval = scheduleInterval;
    this.$rx = rx;
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
    // this._pathResolver = new PathResolver();
    // this._typeCheck = new TypeCheck();
  }

  public $mount<O extends object>(o: O, name: string = "$karman") {
    Object.defineProperty(o, name, { value: this });
  }

  public $use<T extends { install(k: typeof Karman): void }>(plugin: T) {
    if (!isFunction(plugin?.install)) throw new TypeError("[karman error] plugin must has an install function!");

    plugin.install(Karman);
  }

  public $inherit(k: Karman = this.$getRoot()): void {
    if (k.#inherited) return;

    if (k.$parent) {
      const { $baseURL, $requestConfig, $cacheConfig, $interceptors, $validation, $scheduleInterval } = k.$parent;
      k.$baseURL = k._pathResolver.resolve($baseURL, k.$baseURL);
      k.$requestConfig = configInherit($requestConfig, k.$requestConfig);
      k.$cacheConfig = configInherit($cacheConfig, k.$cacheConfig);
      k.$interceptors = configInherit($interceptors, k.$interceptors);
      if (k._typeCheck.isUndefined(k.$validation)) k.$validation = $validation;
      if (k._typeCheck.isUndefined(k.$scheduleInterval)) k.$scheduleInterval = $scheduleInterval;
    }

    k.$traverseInstanceTree({
      onTraverse: (prop) => {
        if (prop instanceof Karman) prop.$inherit(prop);
      },
      onTraverseEnd: () => {
        k.#inherited = true;
      },
    });
  }

  public $getRoot() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: Karman = this;

    while (node.$parent) node = node.$parent;

    if (!node.$root) node.$root = true;

    return node;
  }

  private $setSchema(name: string, schema: SchemaType) {
    const root = this.$getRoot();

    if (root.$schema.has(name)) return console.warn(`[karman warn] duplicate SchemaType '${name}'`);

    root.$schema.set(name, schema);
    schema.$setScope(root);
    schema.circularRefCheck();
  }

  public $collectSchema(node: Karman = this.$getRoot()) {
    node.$traverseInstanceTree({
      onTraverse: (prop) => {
        if (!(prop instanceof Karman) || !prop.$schema.size) return;

        prop.$schema.forEach((schema, name) => node.$setSchema(name, schema));
        prop.$schema.clear();
        prop.$collectSchema(node);
      },
    });
  }

  private $traverseInstanceTree(
    {
      onTraverse,
      onTraverseEnd,
    }: {
      onTraverse: (value: unknown, index: number, array: unknown[]) => void;
      onTraverseEnd?: () => void;
    },
    instance = this,
  ) {
    Object.values(instance).forEach(onTraverse);
    onTraverseEnd?.();
  }
}
