import { defineSchemaType, defineCustomValidator, ValidationError } from "@vic0627/karman";

const required = true;

export default defineSchemaType("LimitAndSort", {
  /**
   * number of return transactions
   * @type {number}
   */
  limit: { required, rules: ["int", { min: 1 }] },
  /**
   * sorting strategy
   * @type {"asc" | "desc"}
   */
  sort: {
    required,
    rules: [
      "string",
      defineCustomValidator((prop, value) => {
        if (!["asc", "desc"].includes(value)) throw new ValidationError(`parameter "${prop}" must be "asc" or "desc"`);
      }),
    ],
  },
});
