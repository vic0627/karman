import { defineSchemaType, defineCustomValidator, ValidationError, getType } from "../../../../dist/karman.js";

const required = true;

/** @type {("asc" | "desc")[]} */
const sorting = ["asc", "desc"];

export default defineSchemaType("LimitAndSort", {
  /**
   * number of return transactions
   */
  limit: { required, rules: ["int", { min: 1 }], type: 1 },
  /**
   * sorting strategy
   */
  sort: {
    required,
    rules: [
      "string",
      defineCustomValidator((prop, value) => {
        if (!sorting.includes(value)) throw new ValidationError(`parameter "${prop}" must be "asc" or "desc"`);
      }),
    ],
    type: getType(...sorting),
  },
});
