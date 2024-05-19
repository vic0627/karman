import { defineCustomValidator, defineSchemaType, getType, ValidationError } from "../../../../dist/karman.js";

export const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const required = true;

const numberLikeString = defineCustomValidator((param, value) => {
  if (isNaN(+value)) throw new ValidationError(`'${param}' can't convert into number with value '${value}'`);
});

export const geoSchema = defineSchemaType("Geo", {
  /**
   */
  lat: {
    required,
    rules: ["string", numberLikeString],
    type: "",
  },
  /**
   */
  long: {
    required,
    rules: ["string", numberLikeString],
    type: "",
  },
});

export const addressSchema = defineSchemaType("Address", {
  /**
   */
  city: {
    required,
    rules: "string",
    type: "",
  },
  /**
   */
  street: {
    required,
    rules: "string",
    type: "",
  },
  /**
   */
  number: {
    required,
    rules: "int",
    type: 1,
  },
  /**
   */
  zipcode: {
    required,
    rules: "string",
    type: "",
  },
  /**
   */
  geolocation: {
    required,
    rules: "Geo",
    type: getType(geoSchema.def),
  },
});

export const nameSchema = defineSchemaType("Name", {
  /**
   */
  firstname: {
    required,
    rules: "string",
    type: "",
  },
  /**
   */
  lastname: {
    required,
    rules: "string",
    type: "",
  },
});

export default defineSchemaType("User", {
  /**
   * email
   */
  email: {
    required,
    rules: ["string", { regexp: emailRegexp, errorMessage: "wrong email format" }],
    type: "",
  },
  /**
   * user nick name
   */
  username: {
    required,
    rules: ["string", { min: 1, measurement: "length" }],
    type: "",
  },
  /**
   * password
   */
  password: {
    required,
    rules: ["string", { min: 1, measurement: "length" }],
    type: "",
  },
  /**
   * user full name
   */
  name: {
    required,
    rules: "Name",
    type: getType(nameSchema.def),
  },
  /**
   * user address
   */
  address: {
    required,
    rules: "Address",
    type: getType(addressSchema.def),
  },
  /**
   * phone number
   */
  phone: {
    required,
    rules: ["string", { min: 1, measurement: "length" }],
    type: "",
  },
});
