import TypeCheck from "@/utils/type-check.provider";
import Karman from "./karman";
import { APIs, KarmanConfig, Routes } from "@/types/karman/karman.type";
import { ReqStrategyTypes } from "@/types/karman/http.type";
export default class KarmanFactory {
    private readonly typeCheck;
    constructor(typeCheck: TypeCheck);
    create<A extends APIs, R extends Routes, T extends ReqStrategyTypes>(k: KarmanConfig<A, R, T>): Karman;
}
//# sourceMappingURL=karman-factory.injectable.d.ts.map