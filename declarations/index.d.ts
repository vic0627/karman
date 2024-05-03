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

export type Optional<T> = T | void;

type Type =
  | "char"
  | "string"
  | "int"
  | "number"
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

type ConstructorFn = { new (...args: any[]): any };

type RegExpWithMessage = { regexp: RegExp; errorMessage?: string };

type RegularExpression = RegExp | RegExpWithMessage;

type CustomValidator = ((param: string, value: unknown) => void) & { _karman: true };

interface ParameterDescriptor {
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
}

type ParamRules = Type | ConstructorFn | RegularExpression | CustomValidator | ParameterDescriptor;

declare class RuleSet {
  protected readonly rules: ParamRules[];
  protected errors: Error[];
  public get valid(): boolean;

  constructor(...rules: ParamRules[]);

  public execute(callbackfn: (value: ParamRules, index: number, array: ParamRules[]) => void): void;
}

declare class UnionRules extends RuleSet {}

declare class IntersectionRules extends RuleSet {}

export type ParamPosition = "path" | "query" | "body";

interface ParamDef {
  /**
   * validation rule of the param
   * @description if received an array, it will be implicitly converted into an `IntersectionRules`
   */
  rules?: ParamRules | ParamRules[] | RuleSet;
  required?: boolean;
  /**
   * @default "body"
   */
  position?: ParamPosition | ParamPosition[];
  defaultValue?: () => any;
}

export type Schema = Record<string, ParamDef | null>;

export type PayloadDef = Schema | string[];

declare class TypeCheck {
  get CorrespondingMap(): Record<Type, keyof this>;
  get TypeSet(): Type[];
  isChar(value: unknown): boolean;
  isString(value: unknown): value is string;
  isNumber(value: unknown): value is number;
  isInteger(value: unknown): boolean;
  isFloat(value: unknown): boolean;
  isNaN(value: unknown): boolean;
  isBoolean(value: unknown): value is boolean;
  isObject(value: unknown): value is object;
  isNull(value: unknown): value is null;
  isFunction(value: unknown): value is Function;
  isArray(value: unknown): value is unknown[];
  isObjectLiteral(value: unknown): value is ObjectLiteral;
  isUndefined(value: unknown): value is undefined;
  isUndefinedOrNull(value: unknown): value is null | undefined;
  isBigInt(value: unknown): value is bigint;
  isSymbol(value: unknown): value is symbol;
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
   * activate the caching functionality
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
  onBeforeValidate?(this: KarmanInstance, payloadDef: P, payload: GetPayloadType<P>): void;
}

interface SyncHooks<P> extends ValidationHooks<P> {
  onRebuildPayload?(this: KarmanInstance, payload: GetPayloadType<P>): Record<string, any> | void;
  onBeforeRequest?(this: KarmanInstance, url: string, payload: GetPayloadType<P>): HttpBody;
}

interface AsyncHooks<ST, D, S, E> {
  onSuccess?(this: KarmanInstance, res: SelectResponseForm<ST, D>): S;
  onError?(this: KarmanInstance, err: Error): E;
  onFinally?(this: KarmanInstance): void;
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

interface RequestConfig<ST> extends Omit<RequestInit, "cache" | "method" | "signal" | "body"> {
  headers?: HeadersConfig;
  auth?: Partial<HttpAuthentication>;
  timeout?: number;
  timeoutErrorMessage?: string;
  responseType?: ResponseType;
  headerMap?: boolean;
  withCredentials?: boolean;
  requestStrategy?: ST;

  requestCache?: RequestCache;
}

interface HttpConfig<ST> extends RequestConfig<ST> {
  url: string;
  method?: HttpMethod;
}

interface UtilConfig {
  /**
   * activating the validation engine
   * @default true
   */
  validation?: boolean;
  /**
   * The time interval for calling scheduled tasks
   * @default 216000000 an hour
   */
  scheduleInterval?: number;
}

interface ValidationErrorOptions extends ParameterDescriptor {
  prop: string;
  value: any;
  message?: string;
  type?: string;
  instance?: ConstructorFn;
  required?: boolean;
}

export declare class ValidationError {
  public readonly name: "ValidationError";

  constructor(options: ValidationErrorOptions | string);
}

export declare function isValidationError(error: unknown): error is ValidationError;

interface XhrResponse<D, ST> {
  data: D;
  status: number;
  statusText: string;
  headers: string | Record<string, string>;
  config: HttpConfig<ST> | undefined;
  request: XMLHttpRequest;
}

interface FetchResponse<D> {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly body: D extends Primitive ? D : ReadableStream<Uint8Array> | ArrayBuffer | Blob | null;
  readonly bodyUsed: boolean;
  clone?(): FetchResponse<D>;
  arrayBuffer?(): Promise<ArrayBuffer>;
  blob?(): Promise<Blob>;
  formData?(): Promise<FormData>;
  text?(): Promise<string>;
  json?(): Promise<D>;
}

type SelectResponseForm<ST, D> = ST extends "xhr" ? XhrResponse<D, ST> : ST extends "fetch" ? FetchResponse<D> : never;

type RequestExecutor<D> = () => [requestPromise: Promise<D>, abortController: () => void];

interface RuntimeOptions<ST, ST2, P, D, S, E>
  extends Hooks<SelectPrimitive2<ST, ST2>, P, D, S, E>,
    RequestConfig<SelectPrimitive2<ST, ST2>>,
    CacheConfig,
    Omit<UtilConfig, "scheduleInterval"> {}

type FinalAPI<ST, P, D, S, E> = <ST2 extends unknown, S2 extends unknown, E2 extends unknown>(
  this: KarmanInstance,
  payload: P extends string[]
    ? {
        [K in P[number]]: any;
      }
    : P extends object
      ? { [K in keyof P]: P[K] }
      : never,
  runtimeOptions?: RuntimeOptions<ST, ST2, P, D, S2, E2>,
) => ReturnType<RequestExecutor<FinalAPIRes<SelectResponseForm<SelectPrimitive2<ST, ST2>, D>, S, S2, E, E2>>>;

type FinalAPIRes<D, S, S2, E, E2> = SelectPrimitive2<E, E2, undefined> | SelectPrimitive3<D, S, S2, undefined>;

interface KarmanDependencies {
  _typeCheck: TypeCheck;
  _pathResolver: PathResolver;
}

export declare class Karman {
  public $mount<O extends object>(o: O, name?: string): void;
  public $use<T extends { install(k: KarmanInstance): void }>(dependency: T): void;
}

export type KarmanInstance = Karman & KarmanDependencies;

interface ApiOptions<ST, P, D, S, E> extends Hooks<ST, P, D, S, E>, UtilConfig, CacheConfig, RequestConfig<ST> {
  /**
   * endpoint of an API
   * @description if received value, the value would be place after the
   * base url of current layer, and before all url parameters
   */
  url?: string;
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

interface KarmanInterceptors {
  onRequest?(this: KarmanInstance, req: HttpConfig<ReqStrategyTypes>): void;
  onResponse?(this: KarmanInstance, res: XhrResponse<any, ReqStrategyTypes> | FetchResponse<any>): boolean | void;
}

interface KarmanOptions<A, R>
  extends KarmanInterceptors,
    CacheConfig,
    Omit<RequestConfig<ReqStrategyTypes>, "requestStrategy">,
    UtilConfig {
  /**
   * root layer of the whole Karman tree
   * @description this will notify the instance of Karman to invoke the inheritance function
   */
  root?: boolean;
  /**
   * the base url or route of current layer
   */
  url?: string;
  schema?: SchemaType[];
  /**
   * actual API on current layer
   */
  api?: A;
  /**
   * children route, must be instance of Karman
   */
  route?: R;
}

export function defineAPI<
  ST extends ReqStrategyTypes = "xhr",
  P extends unknown,
  D extends unknown,
  S extends unknown,
  E extends unknown,
>(options: ApiOptions<ST, P, D, S, E>): FinalAPI<ST, P, D, S, E>;

export function defineKarman<A extends unknown, R extends unknown>(
  options: KarmanOptions<A, R>,
): SelectPrimitive<A, void> & SelectPrimitive<R, void> & KarmanInstance;

export function defineCustomValidator(validatefn: (param: string, value: unknown) => void): CustomValidator;

export function defineIntersectionRules(...rules: ParamRules[]): IntersectionRules;

export function defineUnionRules(...rules: ParamRules[]): UnionRules;

interface ChainScope<D> {
  def: D;

  setRequired(...names: (keyof D)[]): ChainScope<D>;
  setOptional(...names: (keyof D)[]): ChainScope<D>;
  setPosition(position: ParamPosition, ...names: (keyof D)[]): ChainScope<D>;
  setDefault(name: keyof D, defaultValue: () => any): ChainScope<D>;
}

class SchemaType<N extends string, D> implements ChainScope<D> {
  name: N;
  scope?: KarmanInstance;
  def: D;
  keys: (keyof D)[];
  values: D[keyof D][];

  attach(): ChainScope<D>;
}

export function defineSchemaType<N extends string, D>(name: N, def: D): SchemaType<N, D>;
