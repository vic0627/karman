# API Documentation

- [API Documentation](#api-documentation)
  - [Additional Types](#additional-types)
  - [defineKarman](#definekarman)
  - [defineAPI](#defineapi)
  - [defineCustomValidator](#definecustomvalidator)
  - [RuleSet](#ruleset)
  - [ValidationError](#validationerror)
  - [isValidationError](#isvalidationerror)
  - [defineSchemaType](#defineschematype)
  - [SchemaType](#schematype)

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

type Schema = Record<string, ParamDef | null>

type PayloadDef = Schema | string[];
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
      schema?: SchemaType[];

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

## defineSchemaType

Defines a specialized structure for object data, enhancing the flexibility and reusability of `payloadDef`. For usage, please refer to [Schema API](./schema-api.md).

- Syntax
  
  ```js
  function defineSchemaType<N extends string, D extends Schema>(name: N, def: D): SchemaType<N, D>;
  ```

- Parameters

  - `name: string`

    The name of the schema, used as the name when the schema is used as a string rule validation, must adhere to JavaScript variable naming conventions.

  - `payloadDef: Schema`

    A payload definition similar to an object type, this parameter serves as the initial state of the current schema.

- Returns

  - `SchemaType`

## SchemaType

The return value of `defineSchemaType`, allowing the use of a series of APIs to simplify the configuration of `payloadDef`.

- Properties

  - `name: string`
  
    The name of the current schema, also the keyword used when the schema is used as a string rule type.

  - `scope?: Karman`

    The scope to which it belongs. All rules properties under this scope can use `SchemaType.name` as a parameter validation rule.

  - `keys: string[]`

    The list of field names in the current schema.

  - `values: (ParamDef | null)[]`

    The list of all parameter definitions in the current schema.

  - `def: Schema`

    Same as `payloadDef`.
  
- Methods

  - `mutate(): this`

    Allows a series of methods to be called to change the initial configuration of the schema. These methods will not change the original schema but will generate a new schema.

    > [!NOTE]
    > These methods follow the design pattern of [Fluent Interface](https://en.wikipedia.org/wiki/Fluent_interface), gradually changing the schema configuration through chained calls.

  - `pick(...names: string[]): this`
  
    Similar to TypeScript's `Pick<>`, it selects specific fields. It does not take effect when no values are passed. Only one of `pick` or `omit` can be used in the same method chain.

  - `omit(...names: string[]): this`
  
    Similar to TypeScript's `Omit<>`, it excludes specific fields. It does not take effect when no values are passed. Only one of `pick` or `omit` can be used in the same method chain.

  - `setRequired(...names: string[]): this`
  
    Specifies which fields are to be set as required parameters. When no values are passed, all fields are specified as required parameters.

  - `setOptional(...names: string[]): this`
  
    Specifies which fields are to be set as optional parameters. When no values are passed, all fields are specified as optional parameters.

  - `setPosition(position: ParamPosition, ...names: string[]): this`
  
    Specifies which fields FinalAPI should use for which parameter positions. The same field can be set to different positions repeatedly.

  - `setDefault(name: string, defaultValue: () => any): this`
  
    Specifies the parameter default value for a field.


