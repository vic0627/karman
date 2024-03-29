import { defineCustomValidator, ValidationError } from "@vic0627/karman";
import dtoUser from "../dto/dto-user";

const body = true;
export const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {R} required
 * @template {boolean} R
 */
export default (required) => ({
  /**
   * user id
   * @type {R extends true ? number : (number | void)}
   */
  id: {
    required,
    body,
    rules: ["int", { min: 1 }],
  },
  /**
   * email
   * @type {R extends true ? string : (string | void)}
   */
  email: {
    required,
    body,
    rules: ["string", { regexp: emailRegexp, errorMessage: "wrong email format" }],
  },
  /**
   * user nick name
   * @type {R extends true ? string : (string | void)}
   */
  username: {
    required,
    body,
    rules: ["string", { min: 1, measurement: "length" }],
  },
  /**
   * password
   * @type {R extends true ? string : (string | void)}
   */
  password: {
    required,
    body,
    rules: ["string", { min: 1, measurement: "length" }],
  },
  /**
   * user full name
   * @type {R extends true ? typeof dtoUser.name : (typeof dtoUser.name | void)}
   */
  name: {
    required,
    body,
    rules: [
      "object-literal",
      defineCustomValidator((prop, name) => {
        let validKeys = "firstname;lastname;";

        for (const key in name) {
          if (!validKeys.includes(key)) throw new ValidationError(`Unidentified key '${key}' in '${prop}'.`);
          else validKeys = validKeys.replace(key + ";", "");

          const value = name[key];

          if (typeof value !== "string") throw new ValidationError(`property '${key}' in '${prop}' must be a string.`);
        }

        if (validKeys.length) {
          const missingKeys = validKeys.split(";").filter((k) => k);

          throw new ValidationError(`missing keys '${missingKeys}' in '${prop}'`);
        }
      }),
    ],
  },
  /**
   * user address
   * @type {R extends true ? typeof dtoUser.address : (typeof dtoUser.address | void)}
   */
  address: {
    required,
    body,
    rules: [
      "object-literal",
      defineCustomValidator((prop, address) => {
        let validKeys = "city;street;number;zipcode;geolocation;";

        for (const key in address) {
          if (!validKeys.includes(key)) throw new ValidationError(`Unidentified key '${key}' in '${prop}'.`);
          else validKeys = validKeys.replace(key + ";", "");

          const value = address[key];

          if (key === "number") {
            if (typeof value !== "number") throw new ValidationError("'number' must be a number");
            else continue;
          }

          if (key === "geolocation") {
            const { lat, long } = value;

            if (typeof lat !== "string" || typeof long !== "string")
              throw new ValidationError("'lat' and 'long' must be in string type.");
            else continue;
          }

          if (typeof value !== "string") throw new ValidationError(`property '${key}' in '${prop}' must be a string.`);
        }
      }),
    ],
  },
  /**
   * phone number
   * @type {R extends true ? string : (string | void)}
   */
  phone: {
    body,
    required,
    rules: ["string", { min: 1, measurement: "length" }],
  },
});
