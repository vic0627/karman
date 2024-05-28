import { KarmanDependency } from "../../../../dist/karman.js";

export default class Time extends KarmanDependency {
  constructor() {
    super("_time");
  }

  get now() {
    return Date.now();
  }
}
