import TypeCheck from "../utils/TypeCheck";

export const nameModel = (required) => {
  const def = {
    name: {
      body: true,
      rules: [
        "object",
        (value) => {
          const { firstname, lastname } = value;

          if (!TypeCheck.isString(firstname)) {
            throw new TypeError("'firstname' should be string");
          }

          if (!TypeCheck.isString(lastname)) {
            throw new TypeError("'lastname' should be string");
          }
        },
      ],
    },
  };

  if (required) {
    def.name.rules.unshift("required");
  }

  return def;
};

export const accountModel = (required) => {
  const body = true;
  const rules = ["string"];

  if (required) {
    rules.push("required");
  }

  return {
    username: {
      body,
      rules,
    },
    password: {
      body,
      rules,
    },
  };
};

export default (required) => {
  const body = true;
  const def = {
    email: {
      body,
      rules: [
        "string",
        (val) => {
          if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(val)) {
            throw new Error("invalid format for 'email'");
          }
        },
      ],
    },
    ...accountModel(required),
    phone: {
      body,
      rules: ["string"],
    },
    address: {
      body,
      rules: [
        "object",
        (value) => {
          const { city, street, number, zipcode, geolocation = {} } = value;

          if (!TypeCheck.isString(city)) {
            throw new TypeError("'city' should be string");
          }

          if (!TypeCheck.isString(street)) {
            throw new TypeError("'street' should be string");
          }

          if (!TypeCheck.isString(zipcode)) {
            throw new TypeError("'zipcode' should be string");
          }

          if (!TypeCheck.isNumber(number)) {
            throw new TypeError("'number' should be type number");
          }

          const { lat, long } = geolocation;

          if (!TypeCheck.isString(lat)) {
            throw new TypeError("property 'lat' should be string");
          }

          if (!TypeCheck.isString(long)) {
            throw new TypeError("property 'long' should be string");
          }
        },
      ],
    },
    ...nameModel(required),
  };

  if (required) {
    for (const item of def) {
      item.rules.unshift("required");
    }
  }

  return def;
};
