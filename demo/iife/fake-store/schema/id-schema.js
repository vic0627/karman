import { defineSchemaType } from "../../../../dist/karman.js";

export default defineSchemaType("Id", {
  /**
   * identifier number
   * @min 1
   */
  id: {
    required: true,
    rules: ["int", { min: 1 }],
    type: 1,
  },
});
