import fakeStore from "./fake-store/index.js";
import { send, set } from "./dom/index.js";
import { defineAPI, defineIntersectionRules, defineUnionRules, getType } from "../../dist/karman.js";

fakeStore.user.add(
  {
    email: "god@karman.com",
    username: "karman",
    password: "hello",
    name: {
      firstname: "karman",
      lastname: "hello",
    },
    address: {
      city: "karman",
      street: "string",
      number: 1324,
      zipcode: "111",
      geolocation: {
        lat: "123",
        long: "123",
      },
    },
    phone: "123",
  },
  {
    onSuccess(res) {
      console.log(res.data.id);
      return res.data;
    },
    onError(err) {
      console.error(err);
      return 1;
    },
  },
);

// let delegate = request1;

send.addEventListener("click", () => {
  // delegate();
});

set.addEventListener("click", () => {
  // if (delegate === request1) delegate = request2;
  // else delegate = request1;
});
