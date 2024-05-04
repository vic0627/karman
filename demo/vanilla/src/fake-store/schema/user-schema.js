import { defineCustomValidator, defineSchemaType, ValidationError } from "@vic0627/karman";

export const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const required = true;

const numberLikeString = defineCustomValidator((param, value) => {
  if (isNaN(+value)) throw new ValidationError(`'${param}' can't convert into number with value '${value}'`);
});

export const geoSchema = defineSchemaType("Geo", {
  /**
   * @type {string}
   */
  lat: {
    required,
    rules: ["string", numberLikeString],
  },
  /**
   * @type {string}
   */
  long: {
    required,
    rules: ["string", numberLikeString],
  },
});

export const addressSchema = defineSchemaType("Address", {
  /**
   * @type {string}
   */
  city: {
    required,
    rules: "string",
  },
  /**
   * @type {string}
   */
  street: {
    required,
    rules: "string",
  },
  /**
   * @type {number}
   */
  number: {
    required,
    rules: "int",
  },
  /**
   * @type {string}
   */
  zipcode: {
    required,
    rules: "string",
  },
  /**
   * @type {typeof geoSchema.def}
   */
  geolocation: {
    required,
    rules: "Geo",
  },
});

export const nameSchema = defineSchemaType("Name", {
  /**
   * @type {string}
   */
  firstname: {
    required,
    rules: "string",
  },
  /**
   * @type {string}
   */
  lastname: {
    required,
    rules: "string",
  },
});

export default defineSchemaType("User", {
  /**
   * email
   * @type {string}
   */
  email: {
    required,
    rules: ["string", { regexp: emailRegexp, errorMessage: "wrong email format" }],
  },
  /**
   * user nick name
   * @type {string}
   */
  username: {
    required,
    rules: ["string", { min: 1, measurement: "length" }],
  },
  /**
   * password
   * @type {string}
   */
  password: {
    required,
    rules: ["string", { min: 1, measurement: "length" }],
  },
  /**
   * user full name
   * @type {typeof nameSchema.def}
   */
  name: {
    required,
    rules: "Name",
  },
  /**
   * user address
   * @type {typeof addressSchema.def}
   */
  address: {
    required,
    rules: "Address",
  },
  /**
   * phone number
   * @type {string}
   */
  phone: {
    required,
    rules: ["string", { min: 1, measurement: "length" }],
  },
});
