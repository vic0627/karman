import { APIs, FinalKarman, KarmanConfig, Routes } from "@/types/karman/karman.type";
import TypeCheck from "@/utils/type-check.provider";
import KarmanFactory from "../karman/karman-factory.injectable";
import PathResolver from "@/utils/path-rosolver.provider";
import { ReqStrategyTypes } from "@/types/karman/http.type";
import ScheduledTask from "../scheduled-task/scheduled-task.injectable";
export default class LayerBuilder {
    private readonly typeCheck;
    private readonly scheduledTask;
    private readonly pathResolver;
    private readonly karmanFactory;
    constructor(typeCheck: TypeCheck, scheduledTask: ScheduledTask, pathResolver: PathResolver, karmanFactory: KarmanFactory);
    configure<A extends APIs, R extends Routes>(k: KarmanConfig<A, R, ReqStrategyTypes>): FinalKarman<A, R>;
}
//# sourceMappingURL=layer-builder.injectable.d.ts.map