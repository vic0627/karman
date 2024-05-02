# API Documentation

- [API Documentation](#api-documentation)
  - [Additional Types](#additional-types)
  - [defineKarman](#definekarman)
  - [defineAPI](#defineapi)
  - [defineCustomValidator](#definecustomvalidator)
  - [RuleSet](#ruleset)
  - [ValidationError](#validationerror)
  - [isValidationError](#isvalidationerror)

## Additional Types

Types, which are commonly used in this documentation.

```ts
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

type ArrayType =
  | `${Type}[]`
  | `${Type}[${number}]`
  | `${Type}[${number}:]`
  | `${Type}[:${number}]`
  | `${Type}[${number}:${number}]`;

type ObjectLiteral = { [x: string | number | symbol]: any };

type ConstructorFn = { new (...args: any[]): any };

type RegExpWithMessage = { regexp: RegExp; errorMessage?: string };

type RegularExpression = RegExp | RegExpWithMessage;

type CustomValidator = ((param: string, value: unknown) => void) & { _karman: true };

interface ParameterDescriptor {
  min?: number;
  max?: number;
  equality?: number;
  measurement?: "self" | "length" | "size" | string;
}

type ParamRules = Type | ArrayType | ConstructorFn | RegularExpression | CustomValidator | ParameterDescriptor;

type ParamPosition = "path" | "query" | "body";

interface ParamDef {
  rules?: ParamRules | ParamRules[] | RuleSet;
  required?: boolean;
  position?: ParamPosition | ParamPosition[];
  defaultValue?: () => any;
}

type PayloadDef = Record<string, ParamDef | null> | string[];
```

## defineKarman

Construct an abstract layer node called "Karman Node" to manage multiple FinalAPIs and child nodes, allowing these FinalAPIs and descendant nodes to have common configurations.

- Syntax

  ```ts
  function defineKarman(option: KarmanOption): Karman;
  ```

- Parameters

  - `option: KarmanOption`

    ```ts
    interface KarmanOption {
      // 👇 Structural Config
      root?: boolean;
      url?: string;
      api?: {
        [apiName: string]: FinalAPI;
      };
      route?: {
        [routeName: string]: Karman;
      };

      // 👇 Middleware
      nRequest?(this: Karman, req: object): void;
      onResponse?(this: Karman, res: object): boolean | void;

      // 👇 Functional Config
      scheduleInterval?: number;
      cache?: boolean;
      cacheExpireTime?: number;
      cacheStrategy?: "sessionStorage" | "localStorage" | "memory";
      validation?: boolean;

      // 👇 Request Config
      headers?: {
        ["Content-Type"]?: string;
        ["Authorization"]?: `Basic ${string}:${string}`;
      };
      auth?: {
        username: string;
        password: string;
      };
      timeout?: number;
      timeoutErrorMessage?: string;
      responseType?: string;
      headerMap?: boolean;
      withCredentials?: boolean;
      // Configs below only work when using `fetch` request strategy
      requestCache?: "default" | "force-cache" | "no-cache" | "no-store" | "only-if-cached" | "reload";
      credentials?: "include" | "omit" | "same-origin";
      integrity?: string;
      keepalive?: boolean;
      mode?: "cors" | "navigate" | "no-cors" | "same-origin";
      redirect?: "error" | "follow" | "manual";
      referrer?: string;
      referrerPolicy?:
        | ""
        | "no-referrer"
        | "no-referrer-when-downgrade"
        | "origin"
        | "origin-when-cross-origin"
        | "same-origin"
        | "strict-origin"
        | "strict-origin-when-cross-origin"
        | "unsafe-url";
      window?: null;
    }
    ```

- Returns

  - `Karman`

    A Karman instance that contains pointers to all FinalAPIs within `api` and all child nodes within `route`.

## defineAPI

Encapsulates a single request, inheriting the settings of the node when used with `defineKarman`, but requiring separate configuration when used independently.

- Syntax

  ```ts
  function defineAPI(option: ApiOption): FinalAPI;
  ```

- Parameters

  - `option: ApiOption`

    ```ts
    interface ApiOption {
      // 👇 Basic Config
      url?: string;
      method?:
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
      payloadDef?: PayloadDef;
      dto?: any;

      // 👇 Hooks
      onBeforeValidate?(this: Karman, payloadDef: PayloadDef, payload: Record<string, any>): void;
      onRebuildPayload?(this: Karman, payload: Record<string, any>): Record<string, any> | void;
      onBeforeRequest?(this: Karman, url: string, payload: Record<string, any>): Document | BodyInit | null | void;
      onSuccess?(this: Karman, res: object): any;
      onError?(this: Karman, err: Error): any;
      onFinally?(this: Karman): Promise<void> | void;

      // 👇 Functionality
      scheduleInterval?: number;
      cache?: boolean;
      cacheExpireTime?: number;
      cacheStrategy?: "sessionStorage" | "localStorage" | "memory";
      validation?: boolean;

      // 👇 Request Config
      headers?: {
        ["Content-Type"]?: string;
        ["Authorization"]?: `Basic ${string}:${string}`;
      };
      auth?: {
        username: string;
        password: string;
      };
      timeout?: number;
      timeoutErrorMessage?: string;
      responseType?: string;
      headerMap?: boolean;
      withCredentials?: boolean;
      // Configs below only work when using `fetch` request strategy
      requestCache?: "default" | "force-cache" | "no-cache" | "no-store" | "only-if-cached" | "reload";
      credentials?: "include" | "omit" | "same-origin";
      integrity?: string;
      keepalive?: boolean;
      mode?: "cors" | "navigate" | "no-cors" | "same-origin";
      redirect?: "error" | "follow" | "manual";
      referrer?: string;
      referrerPolicy?:
        | ""
        | "no-referrer"
        | "no-referrer-when-downgrade"
        | "origin"
        | "origin-when-cross-origin"
        | "same-origin"
        | "strict-origin"
        | "strict-origin-when-cross-origin"
        | "unsafe-url";
      window?: null;
    }
    ```

- Returns

  - `FinalAPI`

    For more detailed information, please refer to [FinalAPI](./final-api.md).

    ```ts
    type FinalAPI = (
      this: Karman | undefined,
      payload?: Record<string, any>,
      config?: Omit<ApiOption, "url" | "method" | "payloadDef" | "dto">,
    ) => [resPromise: Promise<any>, abort: () => void];
    ```

## defineCustomValidator

Custom parameter validation function.

- Syntax

  ```ts
  function defineCustomValidator(validator: (param: string, value: any) => void): CustomValidator;
  ```

- Parameters

  - `validator: (param: string, value: any) => void`

    Validation function, where `param` is the parameter name and `value` is the parameter value. When validation fails, please throw an error directly without returning any value.

- Returns

  - `CustomValidator`

    The function that takes the same input as `defineCustomValidator`.

## RuleSet

The collection of rules is divided into intersection and union, each triggering different validation processes.

- Syntax

  ```ts
  function defineUnionRules(...rules: ParamRules[]): UnionRules;
  function defineIntersectionRules(...rules: ParamRules[]): IntersectionRules;
  ```

- Parameters

  - `rules: ParamRules[]`

    All validation rules that comply with the type specifications.

- Returns

  - `UnionRules | IntersectionRules`

    For more detailed information, please refer to [RuleSet](./validation-engine.md).

## ValidationError

When parameter validation fails, you can either pass in a complete error message according to your own needs, or use the built-in message template.

- Syntax

  ```ts
  class ValidationError {
    constructor(options: ValidationErrorOptions | string);
  }
  ```

- Parameters

  - `options:  ValidationErrorOptions | string`

    ```ts
    interface ValidationErrorOptions extends ParameterDescriptor {
      prop: string;
      value: any;
      message?: string;
      type?: string;
      instance?: { new (...args: any[]): {} };
      required?: boolean;
    }
    ```

- Returns

  - `ValidationError`

## isValidationError

Validate whether the passed-in parameter is a `ValidationError`.

- Syntax

  ```ts
  function isValidationError(value: any): value is ValidationError;
  ```

- Parameters

  - `value: any`

- Returns

  - `value is ValidationError`
