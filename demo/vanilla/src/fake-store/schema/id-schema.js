import { defineSchemaType } from "@vic0627/karman";

export default defineSchemaType("Id", {
  /**
   * identifier number
   * @min 1
   * @type {number}
   */
  id: {
    required: true,
    rules: ["int", { min: 1 }],
  },
});
