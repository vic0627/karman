import TypeCheck from "@/utils/type-check.provider";
import Karman from "./karman";
import { KarmanConfig } from "@/types/karman/karman.type";

export default class KarmanFactory {
  constructor(private readonly typeCheck: TypeCheck) {}

  public create(k: KarmanConfig) {
    return new Karman(k);
  }
}
