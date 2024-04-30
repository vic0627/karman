# Middleware

Middleware refers to functions executed at some point during the lifecycle of the final API execution. It mainly consists of two types:

- `Interceptors`: Configured on the karman node, interceptors mainly intercept requests (req) and response (res) objects for all final APIs below that node. They can access object properties and conditionally perform side effects. Interceptors can only be defined as synchronous tasks.
- `Hooks`: Configured when defining APIs or invoking final APIs, hooks defined apply only to that final API. Some hooks can be defined as asynchronous tasks or return values. The behavior or parameters can be changed through the return values.

```js
import { defineKarman, defineAPI } from "@vic0627/karman";

const hooksKarman = defineKarman({
  // ...
  validation: true,
  // 👇 Interceptors
  /**
   * Intercepts the request object, including the request url, method, headers, and other request configurations
   * @param req - Request object
   */
  onRequest(req) {
    console.log("onRequest");
    req.headers["Access-Token"] = localStorage["TOKEN"];
  },
  /**
   * Intercepts the response object, depending on the request strategy chosen for each final API, there may be different specifications. Caution should be exercised when accessing object properties.
   * @param res - Response object
   * @returns {boolean | undefined} You can judge the validity of the status code and return a boolean value. By default, it is in the range of >= 200 and < 300.
   */
  onResponse(res) {
    console.log("onResponse");
    const { status } = res;

    return status >= 200 && status < 300;
  },
  api: {
    hookTest: defineAPI({
      // ...
      // 👇 Hooks
      /**
       * Called before validation, but will be ignored if `validation === false`
       * Usually used to dynamically change validation rules, provide default parameter values, or manually validate more complex parameter types
       * @param payloadDef - Parameter definition object
       * @param payload - Actual parameters received by the final API
       */
      onBeforeValidate(payloadDef, payload) {
        console.log("onBeforeValidate");
      },
      /**
       * Executed before constructing the final request URL and request body. Can be used to provide default parameter values or perform other data processing actions on the payload object
       * @param payload - Actual parameters received by the final API
       * @returns {Record<string, any> | undefined} If the return value is an object, it will be used as the new payload to construct the URL and request body
       */
      onRebuildPayload(payload) {
        console.log("onRebuildPayload");
      },
      /**
       * Called before making the request. Can be used to construct the request body, such as creating FormData, etc.
       * @param url - Request URL
       * @param payload - Actual parameters received by the final API
       * @returns {Document | BodyInit | null | undefined} If there is a return value, it will be used as the request body when sending the final request
       */
      onBeforeRequest(url, payload) {
        console.log("onBeforeRequest");
      },
      /**
       * Called when the request is successful. Asynchronous tasks can be configured, usually used for preliminary data processing after receiving the response
       * @param res - Response object
       * @returns {Promise<any> | undefined} If there is a return value, it will be the return value of the final API
       */
      async onSuccess(res) {
        console.log("onSuccess");

        return "get response";
      },
      /**
       * Called when the request fails. Asynchronous tasks can be configured, usually used for error handling
       * @param err - Error object
       * @returns {Promise<any> | undefined} If there is a return value, the final API will not throw an error, and the return value of onError will be used as the return value when an error occurs in the final API
       */
      async onError(err) {
        console.log("onError");

        return "response from error";
      },
      /**
       * Hooks that will always be executed at the end of the final API. Asynchronous tasks can be configured, usually used for side effects
       */
      async onFinally() {
        console.log("onFinally");
      },
    }),
  },
});
```

> [!WARNING]
> When configuring Middleware, it's preferable to declare using regular functions instead of arrow functions to avoid losing the this context if accessing the karman node within the Middleware.

> [!WARNING]
> If a timeout set actively or the abort method is invoked, onResponse will not be executed.
