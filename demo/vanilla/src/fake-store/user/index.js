import { defineAPI, defineKarman } from "@vic0627/karman";
import limitAndSort from "../payload-def/limit-and-sort";
import dtoUser from "./dto/dto-user";
import id from "../payload-def/id";
import user from "./payload-def/user";

export default defineKarman({
  url: "users",
  api: {
    /**
     * ### get all user info
     */
    getAll: defineAPI({
      payloadDef: limitAndSort(false),
      dto: [dtoUser],
    }),
    /**
     * ### get a user info by id
     */
    getById: defineAPI({
      payloadDef: id(true, { path: 0 }),
      dto: dtoUser,
    }),
    /**
     * ### create a new user
     */
    add: defineAPI({
      method: "POST",
      payloadDef: user(true),
      dto: dtoUser,
    }),
    /**
     * ### update a user
     */
    update: defineAPI({
      method: "PUT",
      payloadDef: user(true),
      dto: dtoUser,
    }),
    /**
     * ### modify a user
     */
    modify: defineAPI({
      method: "PUT",
      payloadDef: { ...user(false), ...id(true, { path: 0 }) },
      dto: dtoUser,
      requestStrategy: "fetch",
      onSuccess(res) {
        return res.body;
      },
      onError() {
        return {};
      },
    }),
    /**
     * ### delete a user
     */
    delete: defineAPI({
      method: "DELETE",
      payloadDef: id(true, { path: 0 }),
      dto: dtoUser,
    }),
  },
});
