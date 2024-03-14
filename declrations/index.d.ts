/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Primitive = string | number | boolean | bigint | symbol | undefined | object;

type SelectPrimitive<T, D = any> = T extends Primitive ? T : D;

type SelectPrimitive2<S, P, D = any> = P extends Primitive ? P : S extends Primitive ? S : D;

type SelectPrimitive3<T, S, F, D = any> = F extends Primitive
  ? F
  : S extends Primitive
    ? S
    : T extends Primitive
      ? T
      : D;

type Type =
  | "char"
  | "string"
  | "number"
  | "int"
  | "float"
  | "nan"
  | "boolean"
  | "object"
  | "null"
  | "function"
  | "array"
  | "object-literal"
  | "undefined"
  | "bigint"
  | "symbol";

type ObjectLiteral = { [x: string | number | symbol]: any };

export type ConstructorFn = { new (...args: any[]): any };

export type RegExpWithMessage = { regexp: RegExp; errorMessage?: string };

export type RegularExpression = RegExp | RegExpWithMessage;

export type CustomValidator = ((param: string, value: any) => void) & { _karman: true };

export interface ParameterDescriptor {
  /**
   * min value of the measurement unit for param
   */
  min?: number;
  /**
   * max value of the measurement unit for param
   */
  max?: number;
  /**
   * equality value of the measurement unit for param
   */
  equality?: number;
  /**
   * the measurement unit of the param
   * - `"self"`: test the value itself
   * @default "length"
   */
  measurement?: "self" | "length" | "size" | string;
  /**
   * @default false
   */
  required?: boolean;
}

export type ParamRules = Type | ConstructorFn | RegularExpression | CustomValidator | ParameterDescriptor;

declare class RuleSet {
  protected readonly rules: ParamRules[];
  protected errors: Error[];
  public get valid(): boolean;

  constructor(...rules: ParamRules[]);

  public execute(callbackfn: (value: ParamRules, index: number, array: ParamRules[]) => void): void;
}

declare class UnionRules extends RuleSet {}

declare class IntersectionRules extends RuleSet {}

type ParamPosition = {
  /**
   * describe the param should use for path parameter
   * @description Accept integers that greater than or equal to 0.
   * The url builder will consider this value as an index of all path parameters.
   * @example
   * // assuming the base url is 'https://karman.com/' and the instance of Karman is '$k'
   * // ...
   * getSomthing: defineAPI({
   *   endpoint: "some-thing",
   *   payloadDef: {
   *     param01: { path: 1 },
   *     param02: { path: 0 },
   *   }
   * })
   * // ... call the final API
   * $k.getSomething({ param01: 'hello', param02: 12 })
   * // request url => 'https://karman.com/some-thing/12/hello'
   */
  path?: number;
  /**
   * describe the param should use for query string parameter
   * @description if true, url builder will use the same key of payloadDef
   * and the received value to build the request url
   * @example
   * // assuming the base url is 'https://karman.com/' and the instance of Karman is '$k'
   * // ...
   * getSomthing: defineAPI({
   *   endpoint: "some-thing",
   *   payloadDef: {
   *     param01: { query: true },
   *     param02: { query: true },
   *   }
   * })
   * // ... call the final API
   * $k.getSomething({ param01: 'hello', param02: 12 })
   * // request url => 'https://karman.com/some-thing?param01=hello&param02=12'
   */
  query?: boolean;
  /**
   * describe the param should use for the request body
   * @example
   * // assuming the base url is 'https://karman.com/' and the instance of Karman is '$k'
   * // ...
   * getSomthing: defineAPI({
   *   endpoint: "some-thing",
   *   payloadDef: {
   *     param01: { body: true },
   *     param02: { body: false },
   *     onBeforeRequest(requestURL, payload) {
   *       console.log(payload)
   *       return JSON.stringfy(payload)
   *     }
   *   }
   * })
   * // ... call the final API
   * $k.getSomething({ param01: 'hello', param02: 12 })
   * // console output => { param01: 'hello' }
   */
  body?: boolean;
};

interface ParamDef extends ParamPosition {
  /**
   * validation rule of the param
   * @description if received an array, it will be implicitly converted into an `IntersectionRules`
   */
  rules?: ParamRules | ParamRules[] | RuleSet;
}

export type PayloadDef = Record<string, ParamDef>;

declare class TypeCheck {
  get CorrespondingMap(): Record<Type, keyof this>;
  get TypeSet(): Type[];
  isChar(value: any): boolean;
  isString(value: any): value is string;
  isNumber(value: any): value is number;
  isInteger(value: any): boolean;
  isFloat(value: any): boolean;
  isNaN(value: any): boolean;
  isBoolean(value: any): value is boolean;
  isObject(value: any): value is object;
  isNull(value: any): value is null;
  isFunction(value: any): value is Function;
  isArray(value: any): value is any[];
  isObjectLiteral(value: any): value is ObjectLiteral;
  isUndefined(value: any): value is undefined;
  isUndefinedOrNull(value: any): value is null | undefined;
  isBigInt(value: any): value is bigint;
  isSymbol(value: any): value is symbol;
}

declare class PathResolver {
  trimStart(path: string): string;
  trimEnd(path: string): string;
  trim(path: string): string;
  antiSlash(path: string): string[];
  split(...paths: string[]): string[];
  join(...paths: string[]): string;
  resolve(...paths: string[]): string;
  resolveURL(options: { query?: Record<string, string>; paths: string[] }): string;
}

declare class Template {
  withPrefix(options: { type?: "warn" | "error"; messages: (string | number)[] }): string;
  warn(...messages: (string | number)[]): void;
  throw(...messages: (string | number)[]): void;
}

type CacheStrategyTypes = "sessionStorage" | "localStorage" | "memory";

interface CacheConfig {
  /**
   * activate the caching funcitonality
   */
  cache?: boolean;
  /**
   * how long will the cache data be existed
   * @default 216000000 an hour
   */
  cacheExpireTime?: number;
  /**
   * which storage strategy should be used
   * @default "memory"
   */
  cacheStrategy?: CacheStrategyTypes;
}

type ReqStrategyTypes = "xhr" | "fetch";

type HttpBody = Document | BodyInit | null;

type RemoveOptional<T extends string> = T extends `${infer K}?` ? K : T;

type GetPayloadType<P> = {
  [K in keyof P as RemoveOptional<Extract<K, string>>]: P[K];
};

interface ValidationHooks<P> {
  onBeforeValidate?(this: Karman, payloadDef: P, payload: GetPayloadType<P>): void;
  onValidateError?(this: Karman, error: Error): void;
}

interface SyncHooks<P> extends ValidationHooks<P> {
  onBeforeRequest?(this: Karman, requestURL: string, payload: GetPayloadType<P>): HttpBody;
}

interface AsyncHooks<ST, D, S, E> {
  onSuccess?(this: Karman, res: SelectResponseForm<ST, D>): S;
  onError?(this: Karman, err: Error): E;
  onFinally?(this: Karman): void;
}

interface Hooks<ST, P, D, S, E> extends AsyncHooks<ST, D, S, E>, SyncHooks<P> {}

type MimeType =
  | "text/plain"
  | "application/javascript"
  | "application/json"
  | "text/html"
  | "application/xml"
  | "application/pdf"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "audio/mpeg"
  | "audio/wav"
  | "video/mp4"
  | "video/quicktime";

type HttpMethod =
  | "get"
  | "GET"
  | "delete"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH";

interface HttpAuthentication {
  username: string;
  password: string;
}

interface HeadersConfig {
  ["Content-Type"]?: MimeType | string;
  ["Authorization"]?: `Basic ${string}:${string}`;
}

interface RequestConfig<ST> {
  headers?: HeadersConfig;
  auth?: Partial<HttpAuthentication>;
  timeout?: number;
  timeoutErrorMessage?: string;
  responseType?: ResponseType;
  headerMap?: boolean;
  withCredentials?: boolean;
  requestStrategy?: ST;
}

interface HttpConfig<ST> extends RequestConfig<ST> {
  url: string;
  method?: HttpMethod;
}

interface UtilConfig {
  /**
   * activating the validation enigine
   * @default true
   */
  validation?: boolean;
  /**
   * The time interval for calling scheduled tasks
   * @default 216000000 an hour
   */
  scheduleInterval?: number;
}

interface XhrResponse<D, ST> {
  data: D;
  status: number;
  statusText: string;
  headers: string | Record<string, string>;
  config: HttpConfig<ST> | undefined;
  request: XMLHttpRequest;
}

interface FetchResponse<D> extends Response {
  json(): Promise<D>;
}

type SelectResponseForm<ST, D> = ST extends "xhr" ? XhrResponse<D, ST> : ST extends "fetch" ? FetchResponse<D> : never;

type RequestExecutor<D> = () => [requestPromise: Promise<D>, abortController: () => void];

interface RuntimeOptions<ST, ST2, P, D, S, E>
  extends Hooks<SelectPrimitive2<ST, ST2>, P, D, S, E>,
    RequestConfig<SelectPrimitive2<ST, ST2>>,
    CacheConfig,
    Omit<UtilConfig, "scheduleInterval"> {}

type FinalAPI<ST, P, D, S, E> = <ST2 extends unknown, S2 extends unknown, E2 extends unknown>(
  this: Karman,
  payload: { [K in keyof P]: P[K] },
  runtimeOptions?: RuntimeOptions<ST, ST2, P, D, S2, E2>,
) => ReturnType<RequestExecutor<FinalAPIRes<SelectResponseForm<SelectPrimitive2<ST, ST2>, D>, S, S2, E, E2>>>;

type FinalAPIRes<D, S, S2, E, E2> = SelectPrimitive2<E, E2, undefined> | SelectPrimitive3<D, S, S2, undefined>;

interface IKarman {
  _typeCheck: TypeCheck;
  _pathResolver: PathResolver;
}

declare class Karman extends IKarman {
  public _typeCheck: TypeCheck;
  public _pathResolver: PathResolver;

  private get $root(): boolean;
  private set $root(value: boolean);
  private get $baseURL(): string;
  private set $baseURL(value: string);
  private get $parent(): Karman | null;
  private set $parent(value: Karman | null);
  private $cacheConfig: CacheConfig;
  private $requestConfig: RequestConfig<ReqStrategyTypes>;
  private $hooks: Hooks<ReqStrategyTypes>;
  private get $validation(): boolean | undefined;
  private set $validation(value: boolean | undefined);
  private get $scheduleInterval(): number | undefined;
  private set $scheduleInterval(value: number | undefined);

  public $mount<O extends object>(o: O, name?: string): void;
  public $use<T extends { install(k: Karman): void }>(dependency: T): void;
  private $inherit(): void;
  private $setDependencies(...deps: (TypeCheck | PathResolver)[]): void;
  private $invokeChildrenInherit(): void;
}

interface ApiOptions<ST, P, D, S, E> extends Hooks<ST, P, D, S, E>, UtilConfig, CacheConfig, RequestConfig<ST> {
  /**
   * endpoint of an API
   * @description if received value, the value would be place after the
   * base url of current layer, and before all url parameters
   */
  endpoint?: string;
  /**
   * HTTP method
   * @default "GET"
   */
  method?: HttpMethod;
  /**
   * payload definition of the final API
   */
  payloadDef?: P;
  /**
   * data transfer object of the response
   */
  dto?: D;
}

export function defineAPI<ST = "xhr", P extends unknown, D extends unknown, S extends unknown, E extends unknown>(
  options: ApiOptions<ST, P, D, S, E>,
): FinalAPI<ST, P, D, S, E>;

interface KarmanInterceptors {
  onRequest?(this: Karman, req: HttpConfig<ReqStrategyTypes>): void;
  onResponse?(this: Karman, res: XhrResponse<any, ReqStrategyTypes> | FetchResponse<any>): void;
}

interface KarmanOptions<A, R>
  extends KarmanInterceptors,
    CacheConfig,
    Omit<RequestConfig<ReqStrategyTypes>, "requestStrategy">,
    UtilConfig {
  /**
   * root layer of the whole Karman tree
   * @description this will notify the instance of Karman to invoke the inheritance funciton
   */
  root?: boolean;
  /**
   * the base url or route of current layer
   */
  url?: string;
  /**
   * actual API on current layer
   */
  api?: A;
  /**
   * children route, must be instance of Karman
   */
  route?: R;
}

export function defineKarman<A extends unknown, R extends unknown>(
  options: KarmanOptions<A, R>,
): SelectPrimitive<A, void> & SelectPrimitive<R, void> & Karman;

export function defineCustomValidator(validatefn: (param: string, value: any) => void): CustomValidator;

export function defineIntersectionRules(...rules: ParamRules[]): IntersectionRules;

export function defineUnionRules(...rules: ParamRules[]): UnionRules;
