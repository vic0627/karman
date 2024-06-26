# Validation Engine

The validation engine handles the parameter validation mechanism for final APIs. When sending a request with a final API, it verifies whether the received parameters comply with the validation rules defined for the parameters. If any parameter fails validation, the request will not be executed, and a `ValidationError` will be thrown. Error messages can be automatically generated by the validation engine or defined by the user.

- [Validation Engine](#validation-engine)
  - [Rules](#rules)
  - [Rule Set](#rule-set)
  - [String Rule - Array Syntax](#string-rule---array-syntax)

## Rules

There are various types of validation rules available, ranging from those provided by the validation engine itself to custom validation functions. Here are the different categories:

- **String Rule**: Describes types using strings, extending JavaScript's primitive types. Some special types have unique definitions. Error messages for this rule are automatically generated by the validation engine.
  - `"char"`: Character, a string with a length of 1
  - `"string"`: String
  - `"int"`: Integer
  - `"number"`: Number
  - `"nan"`: NaN
  - `"boolean"`: Boolean
  - `"object"`: Broad object, including `() => {}`, `{}`, or `[]`
  - `"null"`: Null
  - `"function"`: Function
  - `"array"`: Array
  - `"object-literal"`: Object represented by curly braces
  - `"undefined"`: Undefined
  - `"bigint"`: BigInt
  - `"symbol"`: Symbol
- **Constructor**: Any constructor (class), validated using `instanceof` by the validation engine.
- **Custom Validator**: Custom validation functions. Since JavaScript cannot distinguish between regular functions and constructors, you need to define them using `defineCustomValidator()`; otherwise, the function will be treated as a constructor.
- **Regular Expression**: Regular expressions, which can include error messages.
- **Parameter Descriptor**: A parameter descriptor represented as an object. It can define the maximum, minimum, equal values, and measurement properties for parameters. It is best used in conjunction with String Rule to form a [Rule Set](#rule-set). Perform type validation first and then proceed with unit measurement to ensure the integrity of the validation mechanism.

```js
import { defineKarman, defineAPI, defineCustomValidator, ValidationError } from "@vic0627/karman";

const customValidator = defineCustomValidator((prop, value) => {
  if (value !== "@vic0627/karman")
    throw new ValidationError(`Parameter '${prop}' must be 'karman' but received '${value}'`);
});

const emailRule = {
  regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  errorMessage: "Invalid email format",
};

const karman = defineKarman({
  // ...
  validation: true,
  api: {
    ruleTest: defineAPI({
      payloadDef: {
        param01: { rules: "char" }, // String Rule
        param02: { rules: Date }, // Constructor
        param03: { rules: customValidator }, // Custom Validator
        param04: { rules: emailRule }, // Regular Expression
        param05: {
          // Parameter Descriptor
          rules: {
            min: 0,
            max: 5,
            measurement: "length",
          },
        },
      },
    }),
  },
});

karman.ruleTest(); // No required parameter set, so no error thrown
karman.ruleTest({ param01: "A" }); // Valid
karman.ruleTest({ param01: "foo" }); // ValidationError
karman.ruleTest({ param02: new Date() }); // Valid
karman.ruleTest({ param02: "2024-01-01" }); // ValidationError
karman.ruleTest({ param03: "@vic0627/karman" }); // Valid
karman.ruleTest({ param03: "bar" }); // ValidationError: Parameter 'param03' must be 'karman' but received 'bar'
karman.ruleTest({ param04: "karman@gmail.com" }); // Valid
karman.ruleTest({ param04: "karman is the best" }); // ValidationError: Invalid email format
karman.ruleTest({ param05: "@vic0627/karman" }); // Valid
karman.ruleTest({ param05: "karman is the best" }); // ValidationError
karman.ruleTest({ param05: 1 }); // Warning: Unable to find measurable property
```

## Rule Set

A collection of rules, formed by the rules described in the previous section, will be sequentially validated starting from the first rule in the collection. There are two types of rule sets: Intersection Rules and Union Rules, each triggering different validation mechanisms.

- **Intersection Rules**: Intersection Rules can be defined using `defineIntersectionRules()` or a regular array. When the validation engine receives a regular array as rules, it implicitly converts it into a union rule set. When using this collection as validation rules, parameters must comply with all rules to pass validation.
- **Union Rules**: Defined using `defineUnionRules()`, when using this collection as validation rules, parameters only need to comply with one of the rules in the collection to pass validation.

```js
import { defineKarman, defineAPI, defineIntersectionRules, defineUnionRules } from "@vic0627/karman";

const karman = defineKarman({
  // ...
  api: {
    ruleSetTest: defineAPI({
      param01: {
        // The array will be implicitly converted into a intersection rule set
        rules: [
          "string",
          {
            min: 1,
            measurement: "length",
          },
        ],
      },
      param02: {
        // Equivalent to the rules of param01
        rules: defineIntersectionRules("string", {
          min: 1,
          measurement: "length",
        }),
      },
      param03: {
        // Union Rules
        rules: defineUnionRules("string", "number", "boolean"),
      },
    }),
  },
});

karman.ruleSetTest({ param01: "" }); // ValidationError
karman.ruleSetTest({ param02: "foo" }); // Valid
karman.ruleSetTest({ param03: false }); // Valid
```

## String Rule - Array Syntax

An extension syntax for [String Rule](#rules), primarily used to validate arrays, array lengths, and the types of elements within arrays. The basic syntax is as follows:

```txt
<type>[]
<type>[<equal>]
<type>[<min>:]
<type>[:<max>]
<type>[<min>:<max>]
```

On the left side, there must be a string representing the type, and on the right side, there is a set of square brackets. Inside the brackets, you can optionally use a colon to define minimum and maximum values. The parameters using array syntax as validation rules **must be of type array**. If no value is provided inside the brackets, it means there is no limit on the array length.

```js
const arrTest = defineAPI({
  // ...
  payloadDef: {
    param01: {
      rules: "int[]", // Must be an array of integers
    },
    param02: {
      rules: "string[5]", // Must be an array of strings with length 5
    },
    param03: {
      rules: "char[5:]", // Must be an array of characters with a length greater than or equal to 5
    },
    param04: {
      rules: "number[:5]", // Must be an array of numbers with a length less than or equal to 5
    },
    param05: {
      rules: "boolean[3:5]", // Must be an array of booleans with a length between 3 and 5 (inclusive)
    },
  },
});
```
