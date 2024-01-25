export default class RequestError extends Error {
  name = "RequestError";

  constructor(message?: string, options?: ErrorOptions) {
    const msg = message ?? "Bad Request";

    super(msg, options);
  }
}
