import { defineCustomValidator } from "@/node_modules_/karman";
import dtoUser from "../dto/dto-user";

const body = true;
export const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default (required) => ({
  /**
   * user id
   * @type {number}
   */
  id: {
    body,
    rules: ["int", { required, min: 1 }],
  },
  /**
   * email
   * @type {string}
   */
  email: {
    body,
    rules: ["string", emailRegexp, { required }],
  },
  /**
   * user nick name
   * @type {string}
   */
  username: {
    body,
    rules: ["string", { required, min: 1, measurement: "length" }],
  },
  /**
   * password
   * @type {string}
   */
  password: {
    body,
    rules: ["string", { required, min: 1, measurement: "length" }],
  },
  /**
   * user full name
   * @type {typeof dtoUser.name}
   */
  name: {
    body,
    rules: [
      "object-literal",
      defineCustomValidator((prop, name) => {
        const validKeys = "firstname;lastname;";

        for (const key in name) {
          if (!validKeys.includes(key)) throw new Error(`Unidentified key '${key}' in '${prop}'.`);
          else validKeys.replace(key + ";", "");

          const value = name[key];

          if (typeof value !== "string") throw new TypeError(`property '${key}' in '${prop}' must be a string.`);
        }

        if (validKeys.length) {
          const missingKeys = validKeys.split(";").filter((k) => k);

          throw new Error(`missing keys '${missingKeys}' in '${prop}'`);
        }
      }),
      { required },
    ],
  },
  /**
   * user address
   * @type {typeof dtoUser.address}
   */
  address: {
    body,
    rules: [
      "object-literal",
      defineCustomValidator((prop, address) => {
        const validKeys = "city;street;number;zipcode;geolocation;";

        for (const key in address) {
          if (!validKeys.includes(key)) throw new Error(`Unidentified key '${key}' in '${prop}'.`);
          else validKeys.replace(key + ";", "");

          const value = address[key];

          if (key === "number") {
            if (typeof value !== "number") throw new TypeError("'number' must be a number");
            else continue;
          }

          if (key === "geolocation") {
            const { lat, long } = value;

            if (typeof lat !== "stirng" || typeof long !== "string")
              throw new TypeError("'lat' and 'long' must be in type string.");
            else continue;
          }

          if (typeof value !== "string") throw new TypeError(`property '${key}' in '${prop}' must be a string.`);
        }
      }),
    ],
  },
  /**
   * phone number
   * @type {string}
   */
  phone: {
    body,
    rules: ["string", { min: 1, required }],
  },
});
