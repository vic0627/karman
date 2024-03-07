import TypeCheck from "@/utils/type-check.provider";
import Karman from "./karman";
import { APIs, KarmanConfig, Routes } from "@/types/karman/karman.type";
import { ReqStrategyTypes } from "@/types/karman/http.type";
import Injectable from "@/decorator/Injectable.decorator";

@Injectable()
export default class KarmanFactory {
  constructor(private readonly typeCheck: TypeCheck) {}

  public create<A extends APIs, R extends Routes, T extends ReqStrategyTypes>(k: KarmanConfig<A, R, T>) {
    return new Karman(k);
  }
}
