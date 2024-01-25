export default class RuleError extends Error {
  name = "RuleError";

  constructor(msg: string) {
    super(msg);
  }
}
