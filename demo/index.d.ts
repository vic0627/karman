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

export type Prototype = { new (...args: any[]): any };

export type RegExpWithMessage = { regexp: RegExp; errorMessage?: string };

export type RegularExpression = RegExp | RegExpWithMessage;

export type CustomValidator = ((param: string, value: any) => void) & { _karman: true };

export interface ParameterDescriptor {
  min?: number;
  max?: number;
  equality?: number;
  /**
   * - `"self"`: test the value itself
   * @default "length"
   */
  measurement?: "self" | "length" | "size" | string;
  /**
   * @default false
   */
  required?: boolean;
}

export type ParamRules = Type | Prototype | RegularExpression | CustomValidator | ParameterDescriptor;

class RuleSet {
  protected readonly rules: ParamRules[];
  protected errors: Error[];
  public get valid(): boolean;

  constructor(...rules: ParamRules[]);

  public execute(callbackfn: (value: ParamRules, index: number, array: ParamRules[]) => void): void;
}

class UnionRules extends RuleSet {}

class UnionRules extends RuleSet {}

class IntersectionRules extends RuleSet {}

type ParamPosition = {
  path?: number;
  query?: boolean;
  body?: boolean;
};

interface ParamDef extends ParamPosition {
  rules?: ParamRules | ParamRules[] | RuleSet;
}

type PayloadDef = Record<string, ParamDef>;

class TypeCheck {
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

class PathResolver {
  trimStart(path: string): string;
  trimEnd(path: string): string;
  trim(path: string): string;
  antiSlash(path: string): string[];
  split(...paths: string[]): string[];
  join(...paths: string[]): string;
  resolve(...paths: string[]): string;
  resolveURL(options: { query?: Record<string, string>; paths: string[] }): string;
}

class Template {
  withPrefix(options: { type?: "warn" | "error"; messages: (string | number)[] }): string;
  warn(...messages: (string | number)[]): void;
  throw(...messages: (string | number)[]): void;
}

type CacheStrategyTypes = "sessionStorage" | "localStorage" | "memory";

interface CacheConfig {
  cache?: boolean;
  cacheExpireTime?: number;
  cacheStrategy?: CacheStrategyTypes;
}

type ReqStrategyTypes = "xhr" | "fetch";

type HttpBody = Document | XMLHttpRequestBodyInit | null;

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
  validation?: boolean;
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

type RequestExecutor<D> = (onRequest?: () => void) => [requestPromise: Promise<D>, abortController: () => void];

interface RuntimeOptions<ST, P, D, S, E>
  extends Hooks<ST, P, D, S, E>,
    RequestConfig<ST>,
    CacheConfig,
    Omit<UtilConfig, "scheduleInterval"> {}

type FinalAPI<ST, P, D, S, E> = <ST2 extends ReqStrategyTypes, S2 extends unknown, E2 extends unknown>(
  this: Karman,
  payload: { [K in keyof P]: P[K] },
  runtimeOptions?: RuntimeOptions<ST2, P, D, S2, E2>,
) => ReturnType<RequestExecutor<FinalAPIRes<SelectResponseForm<ST, D>, S, S2, E, E2>>>;

type FinalAPIRes<D, S, S2, E, E2> = SelectPrimitive2<E, E2, void> | SelectPrimitive3<D, S, S2, void>;

class Karman {
  public _typeCheck: TypeCheck;
  public _pathResolver: PathResolver;

  public get $baseURL(): string;
  public set $baseURL(value: string);
  public get $parent(): Karman | null;
  public set $parent(value: Karman | null);

  private $cacheConfig: CacheConfig;
  private $requestConfig: RequestConfig<ReqStrategyTypes>;
  // private $hooks: Hooks<ReqStrategyTypes>;
  private get $validation(): boolean | undefined;
  private set $validation(value: boolean | undefined);
  private get $scheduleInterval(): number | undefined;
  private set $scheduleInterval(value: number | undefined);

  public $mount<O extends object>(o: O, name?: string): void;
  private $inherit(): void;
  private $setDependencies(...deps: (TypeCheck | PathResolver)[]): void;
  private $invokeChildrenInherit(): void;
}

interface ApiOptions<ST extends ReqStrategyTypes, P extends unknown, D extends unknown, S, E>
  extends Hooks<ST, P, D, S, E>,
    UtilConfig,
    CacheConfig,
    RequestConfig<ST> {
  endpoint?: string;
  method?: HttpMethod;
  payloadDef?: P;
  dto?: D;
}

export function defineAPI<
  ST extends ReqStrategyTypes,
  P extends unknown,
  D extends unknown,
  S extends unknown,
  E extends unknown,
>(options: ApiOptions<ST, P, D, S, E>): FinalAPI<ST, P, D, S, E>;

interface KarmanOptions<A, R, ST> extends Hooks<ST, any, any, any, void>, CacheConfig, RequestConfig<ST>, UtilConfig {
  baseURL?: string;
  url?: string;
  api?: A;
  route?: R;
}

export function defineKarman<A extends unknown, R extends unknown, ST extends unknown>(
  options: KarmanOptions<A, R, ST>,
): Karman & SelectPrimitive<A, void> & SelectPrimitive<R, void>;

export function defineCustomValidator(validatefn: (param: string, value: any) => void): CustomValidator;

export function defineIntersectionRules(...rules: ParamRules[]): IntersectionRules;

export function defineUnionRules(...rules: ParamRules[]): UnionRules;
