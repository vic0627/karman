# Validation Engine

「驗證引擎」包辦了 FinalAPI 的參數驗證機制，在 FinalAPI 發送請求時，會驗證接收參數是否符合參數定義的驗證規則，若是有參數未通過驗證，該次請求將不會建立，並拋出 `ValidationError`，其中錯誤訊息能由驗證引擎自動產生或由使用者自行定義。

- [Validation Engine](#validation-engine)
  - [驗證規則](#驗證規則)
  - [字串規則 - 陣列語法](#字串規則---陣列語法)
  - [規則集合](#規則集合)

## 驗證規則

驗證規則有很多種，從驗證引擎本身所提供的到客製化驗證函式，會有以下這些種類：

- **字串規則**

  由字串所描述的型別，為 JavaScript 原始型別的擴展，在某些特殊型別會有其獨有的定義，此規則會由驗證引擎自動產生錯誤訊息。

  - `"char"`：字符，長度為 1 的字串
  - `"string"`：字串
  - `"int"`：整數
  - `"number"`：數字
  - `"nan"`：NaN
  - `"boolean"`：布林值
  - `"object"`：廣義物件，包含 `() => {}`、`{}`、或`[]`
  - `"null"`：null
  - `"function"`：函式
  - `"array"`：陣列
  - `"object-literal"`：以花括號所表示的物件
  - `"undefined"`：undefined
  - `"bigint"`：bigint
  - `"symbol"`：symbol

- **類別規則**

  任何建構函式（class），驗證引擎會以 `instanceof` 進行驗證。

- **自定義驗證函式**

  客製化驗證函式，但理論上 JavaScript 無法辨識普通函式與建構函式的差異，因此需要透過 `defineCustomValidator()` 來進行定義，否則會將該函式視為建構函式來處理。

- **正則表達式**

  正則表達式，可以包含或不包含錯誤訊息。

- **參數描述符**

  參數描述符，以物件形式構成，可以定義參數的最大、最小、相等值、以及測量屬性，使用上最好與字串規則搭配，形成一個[規則集合](#規則集合)，先進行型別的驗證後再進行單位的測量，確保驗證機制的完整性。

```js
import { defineKarman, defineAPI, defineCustomValidator, ValidationError } from "@vic0627/karman";

const customValidator = defineCustomValidator((prop, value) => {
  if (value !== "@vic0627/karman") throw new ValidationError(`參數 '${prop}' 必為 'karman' 但卻接收到 '${value}'`);
});

const emailRule = {
  regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  errorMessage: "錯誤的 email 格式",
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

karman.ruleTest(); // 沒有參數設置 required，因此不會拋出錯誤
karman.ruleTest({ param01: "A" }); // Valid
karman.ruleTest({ param01: "foo" }); // ValidationError
karman.ruleTest({ param02: new Date() }); // Valid
karman.ruleTest({ param02: "2024-01-01" }); // ValidationError
karman.ruleTest({ param03: "@vic0627/karman" }); // Valid
karman.ruleTest({ param03: "bar" }); // ValidationError: 參數 'param03' 必為 'karman' 但卻接收到 'bar'
karman.ruleTest({ param04: "karman@gmail.com" }); // Valid
karman.ruleTest({ param04: "karman is the best" }); // ValidationError: 錯誤的 email 格式
karman.ruleTest({ param05: "@vic0627/karman" }); // Valid
karman.ruleTest({ param05: "karman is the best" }); // ValidationError
karman.ruleTest({ param05: 1 }); // 會以警告提示找不到可測量的屬性
```

## 字串規則 - 陣列語法

為[字串規則](#驗證規則)的延伸語法，主要用來驗證陣列、陣列長度、陣列中元素的型別，基本語法如下：

```txt
<type>[]
<type>[<equal>]
<type>[<min>:]
<type>[:<max>]
<type>[<min>:<max>]
```

左邊必須是型別的字串，而右邊是一組方括號，方括號內可視情況帶入冒號來界定陣列長度的最大最小值。使用陣列語法的為驗證規則的參數，其型別**必為陣列**，若方括號中不帶值，即不限定陣列長度。

```js
const arrTest = defineAPI({
  // ...
  payloadDef: {
    param01: {
      rules: "int[]", // 需為整數陣列
    },
    param02: {
      rules: "string[5]", // 需為陣列長度 5 的字串陣列
    },
    param03: {
      rules: "char[5:]", // 需為陣列長度大於等於 5 的字符陣列
    },
    param04: {
      rules: "number[:5]", // 需為陣列長度小於等於 5 的數字陣列
    },
    param05: {
      rules: "boolean[3:5]", // 需為陣列長度大於等於 3 且小於等於 5 的布林陣列
    },
  },
});
```

## 規則集合

規則的集合，為其幾個章節所說明的規則所排列構成，會由集合索引首位的規則開始依序驗證，而種類有交集規則（Intersection Rules）與聯集規則（Union Rules），分別會觸發不同的驗證機制。

- **交集規則 Intersection Rules**

  可以透過 `defineIntersectionRules()` 或普通陣列來定義，驗證引擎在接收到普通陣列作為規則時，會將其隱式轉換成交集規則，當使用此集合作為驗證規則時，參數須符合所有規則才算通過驗證。

- **聯集規則 Union Rules**

  透過 `defineUnionRules()` 定義，使用此集合作為驗證規則時，參數只須符合集合中的其中一項規則即代表通過驗證。

```js
import { defineKarman, defineAPI, defineIntersectionRules, defineUnionRules } from "@vic0627/karman";

const karman = defineKarman({
  // ...
  api: {
    ruleSetTest: defineAPI({
      param01: {
        // 陣列將隱式轉換成交集規則
        rules: [
          "string",
          {
            min: 1,
            measurement: "length",
          },
        ],
      },
      param02: {
        // 與 param01 的規則等效
        rules: defineIntersection("string", {
          min: 1,
          measurement: "length",
        }),
      },
      param03: {
        // 聯集規則
        rules: defineUnionRules("string", "number", "boolean"),
      },
    }),
  },
});

karman.ruleSetTest({ param01: "" }); // ValidationError
karman.ruleSetTest({ param02: "foo" }); // Valid
karman.ruleSetTest({ param03: false }); // Valid
```
