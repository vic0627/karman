import {
  defineKarman,
  defineAPI,
  defineUnionRules,
  ValidationError,
  isValidationError,
  defineCustomValidator,
  defineIntersectionRules,
} from "../../dist/karman.js";

const $karman = defineKarman({
  root: true,
  validation: true,
  route: {
    facts: defineKarman({
      url: "https://cat-fact.herokuapp.com/facts",
      api: {
        getAll: defineAPI(),
        random: defineAPI({
          url: "random",
          payloadDef: {
            animal_type: {
              position: "query",
              rules: defineUnionRules("array", "string"),
            },
            amount: {
              position: "query",
              rules: ["int", { max: 500 }],
            },
          },
          onRebuildPayload(payload) {
            let _animal_type;
            if (this._typeCheck.isArray(payload.animal_type))
              payload.animal_type.forEach((el, i) => {
                if (!this._typeCheck.isString(el)) throw new ValidationError("'animal_type' must be a string array");
                if (!i) _animal_type = el;
                else _animal_type += `,${el}`;
              });
            if (_animal_type) payload.animal_type = _animal_type;
          },
          onSuccess(res) {
            return res.data;
          },
          onError(err) {
            // if (isValidationError(err)) throw err;
            // return {};
          },
        }),
      },
    }),
    posts: defineKarman({
      url: "https://jsonplaceholder.typicode.com/posts",
      api: {
        getCommentById: defineAPI({
          url: ":postId/comments",
          payloadDef: {
            postId: {
              position: "path",
              rules: "int",
            },
          },
        }),
      },
    }),
  },
});

$karman.$mount(window);

export default $karman;

export const getCommentById = defineAPI({
  url: "https://jsonplaceholder.typicode.com/posts/:postId/comments",
  payloadDef: {
    /** @type {number} 哪則貼文 */
    postId: {
      position: "path",
      rules: "int",
    },
  },
  onSuccess(res) {
    return res.data;
  },
  validation: true,
});

export const addProduct = defineAPI({
  url: "https://fakestoreapi.com/products",
  method: "POST",
  payloadDef: {
    title: {
      required: true,
    },
    price: {
      required: true,
    },
    description: {
      required: true,
    },
    image: {
      required: true,
    },
    // category: null,
    category: {
      required: true,
      defaultValue: () => new String("asd"),
      rules: String,
    },
  },
  // payloadDef: ["title", "price", "description", "image", "category"],
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  validation: true,
  // requestStrategy: "fetch"
});

/**
 * @typedef {object} ModifyProductRes
 * @prop {"success" | "error"} ModifyProductRes.status 狀態
 * @prop {string} ModifyProductRes.message 訊息
 */
/**
 * 更新部分商品資訊
 */
export const modifyProduct = defineAPI({
  method: "PATCH",
  url: "https://karman.com/products/:id",
  payloadDef: {
    /**
     * 商品 id
     * @description 大於等於 1 的整數
     * @type {number}
     */
    id: {
      position: "path",
      required: true, // 指定為必填參數
      rules: [
        // 定義驗證規則，使用陣列觸發預設的交集規則
        "int", // 指定型別為整數類型
        { min: 1 }, // 最小值 1
      ],
    },

    /**
     * 商品名稱
     * @description 字串長度小於 10
     * @type {string | void}
     */
    name: {
      position: "query",
      rules: [
        "string", // 指定型別為字串類型
        { max: 10, measurement: "length" }, // 最大值 10，測量 length 屬性
      ],
    },
    /**
     * 商品價格
     * @default 100
     * @type {number}
     */
    price: {
      rules: "number",
      required: true,
      defaultValue: () => 100, // 預設值 100
    },
  },
  headers: {
    // 帶入 headers 設定
    "Content-Type": "application/json; charset=utf-8",
  },
  validation: true, // 啟用驗證引擎
  /** @type {ModifyProductRes} */
  dto: null,
});

export const pathTest = defineAPI({
  url: "https://fakestoreapi.com/products/:id/:name",
  headers: {
    Something: localStorage["something"],
  },
  payloadDef: {
    id: {
      position: "path",
      rules: "int",
      required: true,
    },
    name: {
      position: "path",
      rules: "string",
    },
  },
  validation: true,
});

const unionRules = defineIntersectionRules(
  // "int[6]",
  // File,
  // "char[2:]",
  // defineCustomValidator((param, value) => {
  //   throw new ValidationError(`custom validation failed in param '${param}'`);
  // }),
  "string",
  "number",
  "boolean",
  "symbol",
  "null"
);

export const arrTest = defineAPI({
  url: "https://fakestoreapi.com/products",
  payloadDef: {
    arr: {
      position: [],
      rules: unionRules,
      required: true,
    },
  },
  validation: true,
});
