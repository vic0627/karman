import { defineKarman, defineAPI, defineUnionRules, ValidationError, isValidationError } from "../../dist/karman.js";

const $karman = defineKarman({
  url: "https://cat-fact.herokuapp.com",
  root: true,
  validation: true,
  route: {
    facts: defineKarman({
      url: "facts",
      api: {
        getAll: defineAPI(),
        random: defineAPI({
          url: "random",
          payloadDef: {
            animal_type: {
              query: true,
              rules: defineUnionRules("array", "string"),
            },
            amount: {
              query: true,
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
    users: defineKarman({
      url: "users",
    }),
  },
});

$karman.$mount(window);

export default $karman;
