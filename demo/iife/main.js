import { defineKarman, defineAPI, defineUnionRules, ValidationError, isValidationError, defineCustomValidator } from "../../dist/karman.js";

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
      rules: String
    },
  },
  // payloadDef: ["title", "price", "description", "image", "category"],
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  validation: true,
  // requestStrategy: "fetch"
});
