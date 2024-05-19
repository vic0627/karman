/**
 * Copyright (c) 2024 Victor Hsu and Microsoft Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
 * WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing permissions
 * and limitations under the License.
 */

// #region Utility Types
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

type PartialProp<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

type RequiredProp<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

type NoKeys<T extends any[]> = T["length"] extends 0 ? true : false;

type HasUndefined<T> = undefined extends T ? true : false;

type UndefinedKeys<T> = keyof {
  [K in keyof T as HasUndefined<T[K]> extends true ? K : never]: K;
};

type PartialByUndefined<T> = UndefinedKeys<T> extends never ? T : PartialProp<T, UndefinedKeys<T>>;

type ExtractFromUndefined<T> = T extends undefined ? never : T;

type ExtractString<T> = T extends `${infer K}` ? K : never;

export function getType<T>(
  ...types: T[]
): T extends Schema ? ConvertPayloadFromSchema<T> : T extends Schema[] ? ConvertPayloadFromSchema<T[number]>[] : T;
// #endregion

// #region Validation Types
type StringTypes =
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

type ArraySyntax = `${StringTypes}[]`;

type StringRuleType = StringTypes | ArraySyntax | string;

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

type ParamRules = StringRuleType | ConstructorFn | RegularExpression | CustomValidator | ParameterDescriptor;

class RuleSet {
  protected readonly rules: ParamRules[];
  protected errors: Error[];
  public get valid(): boolean;

  constructor(...rules: ParamRules[]);

  public execute(callbackfn: (value: ParamRules, index: number, array: ParamRules[]) => void): void;
}

class UnionRules extends RuleSet {}

class IntersectionRules extends RuleSet {}

/**
 * customize a validate function for the rules of a parameter
 * @param validateFn validate function
 */
export function defineCustomValidator(
  validateFn: (
    /** param name */
    param: string,
    /** received value */
    value: unknown,
  ) => void,
): CustomValidator;

/**
 * define a rule set that the parameter must pass every rules to be considered valid
 * @param rules
 */
export function defineIntersectionRules(...rules: ParamRules[]): IntersectionRules;

/**
 * define a rule set that the parameter must pass any one of the rules to be considered valid
 * @param rules
 */
export function defineUnionRules(...rules: ParamRules[]): UnionRules;
// #endregion

// #region Validation Error Types
interface ValidationErrorOptions extends ParameterDescriptor {
  /**
   * parameter name
   */
  prop: string;
  /**
   * received value of tha parameter
   */
  value: any;
  /**
   * error message
   */
  message?: string;
  /**
   * correct type of ths parameter
   */
  type?: string;
  /**
   * constructor of the parameter
   */
  instance?: ConstructorFn;
  required?: boolean;
}

export class ValidationError extends Error {
  public readonly name: "ValidationError";

  constructor(options: ValidationErrorOptions | string);
}

export function isValidationError(error: unknown): error is ValidationError;
// #endregion

// #region Payload Definition Types
export type ParamPosition = "path" | "query" | "body";

export interface ParamDef {
  /**
   * validation rule of the param
   * @description if received an array, it will be implicitly converted into an `IntersectionRules`
   */
  rules?: ParamRules | ParamRules[] | RuleSet;
  /**
   * specify as a required parameter
   * @default false
   */
  required?: boolean;
  /**
   * determine where the parameter should be used
   * @description
   * This attribute can be an array,
   * indicating that the same parameter can be used in different parts of the request.
   * @default "body"
   */
  position?: ParamPosition | ParamPosition[];
  /**
   * @returns default value for the parameter
   */
  defaultValue?: () => any;
  type?: unknown;
}

export type Schema = Record<string, ParamDef | null>;

export type PayloadDef<T> = Schema | T[];
// #endregion

// #region Middleware
interface KarmanInterceptors {
  onRequest?(this: KarmanInstance, req: HttpConfig<ReqStrategyTypes>): void;
  onResponse?(this: KarmanInstance, res: XhrResponse<any, ReqStrategyTypes> | FetchResponse<any>): boolean | void;
}

interface ValidationHooks<P> {
  onBeforeValidate?(this: KarmanInstance, payloadDef: P, payload: P): void;
}

interface SyncHooks<P> extends ValidationHooks<P> {
  onRebuildPayload?(this: KarmanInstance, payload: P): Record<string, any> | void;
  onBeforeRequest?(this: KarmanInstance, url: string, payload: P): HttpBody;
}

interface AsyncHooks<ST, D, S, E> {
  onSuccess?(this: KarmanInstance, res: SelectResponseForm<ST, D>): S;
  onError?(this: KarmanInstance, err: Error): E;
  onFinally?(this: KarmanInstance): void;
}

interface Hooks<ST, P, D, S, E> extends AsyncHooks<ST, D, S, E>, SyncHooks<P> {}
// #endregion

// #region Some Configs
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

interface UtilConfig {
  /**
   * activating the validation engine
   * @default false
   */
  validation?: boolean;
  /**
   * The time interval for calling scheduled tasks
   * @default 216000000 an hour
   */
  scheduleInterval?: number;
}
// #endregion

// #region Request Types
type ReqStrategyTypes = "xhr" | "fetch";

type HttpBody = Document | BodyInit | null;

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
// #endregion

// #region Response Types
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
// #endregion

// #region Final API Types
interface RuntimeOptions<ST, ST2, P, D, S, E>
  extends Hooks<SelectPrimitive2<ST, ST2>, P, D, S, E>,
    RequestConfig<SelectPrimitive2<ST, ST2>>,
    CacheConfig,
    Omit<UtilConfig, "scheduleInterval"> {}

type ConvertPayloadFromSchema<S> = {
  [K in keyof S]: ExtractFromUndefined<S[K]> extends ParamDef ? ExtractFromUndefined<S[K]>["type"] : any;
};

type ConvertPayload<P> = P extends string[]
  ? {
      [K in P[number] as ExtractString<K>]: any;
    }
  : P extends Schema
    ? ConvertPayloadFromSchema<P>
    : never;

type FinalAPIRes<D, S, S2, E, E2> = SelectPrimitive2<E, E2, undefined> | SelectPrimitive3<D, S, S2, undefined>;

type FinalAPI<ST, P, D, S, E> = <ST2 extends unknown, S2 extends unknown, E2 extends unknown>(
  this: KarmanInstance,
  payload: ConvertPayload<P>,
  runtimeOptions?: RuntimeOptions<ST, ST2, P, D, S2, E2>,
) => [
  requestPromise: Promise<FinalAPIRes<SelectResponseForm<SelectPrimitive2<ST, ST2>, D>, S, S2, E, E2>>,
  abortController: () => void,
];

interface ApiOptions<ST, P, D, S, E> extends Hooks<ST, P, D, S, E>, UtilConfig, CacheConfig, RequestConfig<ST> {
  /**
   * url fragment or complete url
   * @description
   * 1. if received value, the value would be place after the
   * base url of current layer, and before all url parameters
   * 2. the only property that allows to define path parameters
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

export function defineAPI<
  ST extends ReqStrategyTypes = "xhr",
  P extends PayloadDef<PARAMS>,
  D extends unknown,
  S extends unknown,
  E extends unknown,
  PARAMS extends string,
>(options: ApiOptions<ST, P, D, S, E>): FinalAPI<ST, P, D, S, E>;
// #endregion

// #region Karman Types
class TypeCheck {
  get CorrespondingMap(): Record<StringRuleType, keyof this>;
  get TypeSet(): StringRuleType[];
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

class PathResolver {
  /**
   * get rid of all slashes `/` that start from the input string
   * @example
   * const str = pathResolver.trimStart("//hello/world/");
   * console.log(str); // => "hello/world/"
   */
  trimStart(path: string): string;
  /**
   * get rid of all slashes `/` that end in the input string
   * @example
   * const str = pathResolver.trimEnd("/hello/world//")
   * console.log(str); // => "/hello/world";
   */
  trimEnd(path: string): string;
  /**
   * get rid of all slashes `/` that start from or end in the input string
   * @example
   * const str = pathResolver.trim("/hello/world//");
   * console.log(str); // => "hello/world"
   */
  trim(path: string): string;
  /**
   * get rid of all slashes `/` from the input string and returns all paths' name
   * @example
   * const arr = pathResolver.antiSlash("/hello/world//");
   * console.log(arr); // => ["hello", "world"]
   */
  antiSlash(path: string): string[];
  /**
   * split all paths from all given strings
   * @example
   * const arr = pathResolver.split("https://wtf.com//projects/", "/karman/issues//");
   * console.log(arr); // => ["https://wtf.com", "projects", "karman", "issues"]
   */
  split(...paths: string[]): string[];
  /**
   * combine all path fragments, but be aware of this method doesn't handle relative paths
   * @example
   * const str = pathResolver.split("https://wtf.com//projects/", "/karman/issues//");
   * console.log(str); // => "https://wtf.com/projects/karman/issues"
   */
  join(...paths: string[]): string;
  /**
   * handle and combine all absolute paths and relative paths
   * @example
   * const str = DI.resolve(
   *   "https://wtf.com/projects/",
   *   "../../karman//issues",
   *   "./hello/world/",
   *   "/how//../are/you///"
   * );
   * console.log(str); // => "https://wtf.com/karman/issues/hello/world/are/you"
   */
  resolve(...paths: string[]): string;
  /**
   * build a complete URL string
   * @example
   * const url = DI.resolveURL({
   *   paths: ["https://wtf.com/", "/hello", "../world/"],
   *   query: {
   *     foo: "bar",
   *     some: "how"
   *   }
   * });
   * console.log(url); // => "https://wtf.com/world?foo=bar&some=how"
   */
  resolveURL(options: { query?: Record<string, string>; paths: string[] }): string;
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
   * @description can be a url fragment or complete url
   */
  url?: string;
  /**
   * schemas that you want to use as a string rule on this Karman Tree
   */
  schema?: SchemaType[];
  /**
   * actual APIs on current layer
   */
  api?: A;
  /**
   * children route, must be instance of Karman
   */
  route?: R;
}

interface KarmanDependencies {
  _typeCheck: TypeCheck;
  _pathResolver: PathResolver;
}

class Karman {
  public $mount<O extends object>(o: O, name?: string): void;
  public $use<T extends { install(k: KarmanInstance): void }>(dependency: T): void;
}

type KarmanInstance = Karman & KarmanDependencies;

export function defineKarman<A extends unknown, R extends unknown>(
  options: KarmanOptions<A, R>,
): SelectPrimitive<A, void> & SelectPrimitive<R, void> & KarmanInstance;
// #endregion

// #region Schema API Types
type RequiredChainScope<D, N extends (keyof D)[]> = NoKeys<N> extends true ? Required<D> : RequiredProp<D, N[number]>;

type PartialChainScope<D, N extends (keyof D)[]> = NoKeys<N> extends true ? Partial<D> : PartialProp<D, N[number]>;

interface ChainScope<D, K extends keyof ChainScope<D>> {
  /**
   * mutated schema
   */
  def: D;
  /**
   * set required parameters according to the given names
   * @description if no value is received, all parameters are set to required by default
   */
  setRequired<N extends (keyof D)[]>(
    ...names: N
  ): Omit<ChainScope<RequiredChainScope<D, N>, "setRequired" | K>, "setRequired" | K>;
  /**
   * set optional parameters according to the given names
   * @description if no value is received, all parameters are set to optional by default
   */
  setOptional<N extends (keyof D)[]>(
    ...names: N
  ): Omit<ChainScope<PartialChainScope<D, N>, "setOptional" | K>, "setOptional" | K>;
  /**
   * determine where to use the certain parameters
   */
  setPosition(position: ParamPosition, ...names: (keyof D)[]): Omit<ChainScope<D, K>, K>;
  /**
   * set default value of the parameter
   */
  setDefault(name: keyof D, defaultValue: () => any): Omit<ChainScope<D, K>, K>;
  /**
   * analog of TypeScript utility type `Pick`
   */
  pick<N extends (keyof D)[]>(
    ...names: N
  ): Omit<ChainScope<Pick<D, N[number]>, "pick" | "omit" | K>, "pick" | "omit" | K>;
  /**
   * analog of TypeScript utility type `Omit`
   */
  omit<N extends (keyof D)[]>(
    ...names: N
  ): Omit<ChainScope<Omit<D, N[number]>, "pick" | "omit" | K>, "pick" | "omit" | K>;
}

class SchemaType<N extends string, D> {
  /**
   * name of the schema
   * @description It is necessary to adhere to the naming conventions for JavaScript variables
   */
  name: N;
  /**
   * original schema
   */
  def: D;
  scope?: KarmanInstance;
  keys: (keyof D)[];
  values: D[keyof D][];

  /**
   * start mutating schema
   * @description this method will create a new schema according to the original schema instead, while ending mutation, please access `.def` property to get the mutated schema.
   */
  mutate(): ChainScope<D, never>;
}

/**
 * defining reusable `payloadDef` object
 * @param name Name of the schema, and it is necessary to adhere to the naming conventions for JavaScript variables
 * @param def `payloadDef` in object type. @see Schema
 */
export function defineSchemaType<N extends string, D extends Schema>(name: N, def: D): SchemaType<N, D>;
// #endregion

type MissingConst = "id" | "title" | string;
