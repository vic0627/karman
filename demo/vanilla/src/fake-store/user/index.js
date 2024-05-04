import { defineAPI, defineKarman } from "@vic0627/karman";
import limitAndSortSchema from "../schema/limit-and-sort-schema";
import idSchema from "../schema/id-schema";
import userSchema from "../schema/user-schema";

/**
 * @typedef {typeof userSchema.def & typeof idSchema.def} User
 */

export default defineKarman({
  url: "users",
  api: {
    /**
     * ### get all user info
     */
    getAll: defineAPI({
      payloadDef: limitAndSortSchema
        .mutate()
        .setOptional()
        .setPosition("query")
        .setDefault("limit", () => 10).def,
      /** @type {User[]} */
      dto: null,
    }),
    /**
     * ### get a user info by id
     */
    getById: defineAPI({
      url: ":id",
      payloadDef: idSchema.mutate().setPosition("path").def,
      /** @type {User} */
      dto: null,
    }),
    /**
     * ### create a new user
     */
    add: defineAPI({
      method: "POST",
      payloadDef: userSchema.def,
      /** @type {User} */
      dto: null,
    }),
    /**
     * ### update a user
     */
    update: defineAPI({
      url: ":id",
      method: "PUT",
      payloadDef: {
        ...idSchema.mutate().setPosition("path").def,
        ...userSchema.def,
      },
      /** @type {User} */
      dto: null,
    }),
    /**
     * ### modify a user
     */
    modify: defineAPI({
      url: ":id",
      method: "PATCH",
      payloadDef: {
        ...idSchema.mutate().setPosition("path").def,
        ...userSchema.mutate().setOptional().def,
      },
      /** @type {User} */
      dto: null,
    }),
    /**
     * ### delete a user
     */
    delete: defineAPI({
      url: ":id",
      method: "DELETE",
      payloadDef: idSchema.mutate().setPosition("path").def,
      /** @type {User} */
      dto: null,
    }),
  },
});
