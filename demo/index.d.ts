declare namespace karman {
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
    onBeforeValidate?(payloadDef: P, payload: GetPayloadType<P>): void;
    onValidateError?(error: Error): void;
  }

  interface SyncHooks<P> extends ValidationHooks<P> {
    onBeforeRequest?(requestURL: string, payload: GetPayloadType<P>): HttpBody;
  }

  interface AsyncHooks<ST extends ReqStrategyTypes, D, R, E> {
    onSuccess?(res: SelectResponseForm<ST, D>): R;
    onError?(err: Error): E;
    onFinally?(): void;
  }

  interface Hooks<ST extends ReqStrategyTypes, P, D, R, E> extends AsyncHooks<ST, D, R, E>, SyncHooks<P> {}

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

  interface RequestConfig<ST extends ReqStrategyTypes> {
    headers?: HeadersConfig;
    auth?: Partial<HttpAuthentication>;
    timeout?: number;
    timeoutErrorMessage?: string;
    responseType?: ResponseType;
    headerMap?: boolean;
    withCredentials?: boolean;
    requestStrategy?: ST;
  }

  interface HttpConfig<ST extends ReqStrategyTypes> extends RequestConfig<ST> {
    url: string;
    method?: HttpMethod;
  }

  interface XhrResponse<D, ST extends ReqStrategyTypes> {
    data: D;
    status: number;
    statusText: string;
    headers: string | Record<string, string>;
    config: HttpConfig<ST> | undefined;
    request: XMLHttpRequest;
  }

  type SelectResponseForm<ST extends ReqStrategyTypes, D> = ST extends "xhr" ? XhrResponse<D, ST> : never;

  class Karman<ST extends ReqStrategyTypes> {
    protected _typeCheck: TypeCheck;
    protected _pathResolver: PathResolver;

    protected get $baseURL(): string;
    protected set $baseURL(value: string);
    protected get $parent(): Karman<ST> | null;
    protected set $parent(value: Karman<ST> | null);

    private $cacheConfig: CacheConfig;
    private $requestConfig: RequestConfig<ST>;
    private $hooks: Hooks<ST>;
    private get $validation(): boolean | undefined;
    private set $validation(value: boolean | undefined);
    private get $scheduleInterval(): number | undefined;
    private set $scheduleInterval(value: number | undefined);

    constructor(config: KarmanInstanceConfig);

    public $mount<O extends object>(o: O, name?: string): void;
    private $inherit(): void;
    private $setDependencies(...deps: (TypeCheck | PathResolver)[]): void;
    private $invokeChildrenInherit(): void;
  }
}
