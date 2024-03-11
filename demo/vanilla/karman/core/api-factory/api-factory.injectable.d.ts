import { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";
import Xhr from "../request-strategy/xhr.injectable";
import TypeCheck from "@/utils/type-check.provider";
import Template from "@/utils/template.provider";
import { RuntimeOptions } from "@/types/karman/final-api.type";
import Karman from "../karman/karman";
import { ApiConfig, ReqStrategyTypes, RequestConfig } from "@/types/karman/http.type";
import PathResolver from "@/utils/path-rosolver.provider";
import { CacheConfig, UtilConfig } from "@/types/karman/karman.type";
import { AsyncHooks, SyncHooks } from "@/types/karman/hooks.type";
import ValidationEngine from "../validation-engine/validation-engine.injectable";
import CachePipe from "./request-pipe/cache-pipe.injectable";
import { PayloadDef } from "@/types/karman/payload-def.type";
export type ApiReturns<D> = [resPromise: Promise<D>, abortControler: () => void];
export interface ParsedRuntimeOptions<T extends ReqStrategyTypes> {
    $$$requestConfig: RequestConfig<T>;
    $$$cacheConfig: CacheConfig;
    $$$utilConfig: UtilConfig;
    $$$hooks: AsyncHooks & SyncHooks;
}
export interface AllConfigCache<D, T extends ReqStrategyTypes> extends Pick<ApiConfig<D, T, PayloadDef>, "endpoint" | "method" | "payloadDef"> {
    baseURL?: string;
    requestConfig?: RequestConfig<T>;
    cacheConfig?: CacheConfig;
    utilConfig?: UtilConfig;
    hooks?: AsyncHooks & SyncHooks;
}
export interface PreqBuilderOptions<D, T extends ReqStrategyTypes> extends Required<Pick<AllConfigCache<D, T>, "baseURL" | "endpoint" | "payloadDef">> {
    payload: Record<string, any>;
}
export default class ApiFactory {
    private readonly template;
    private readonly typeCheck;
    private readonly pathResolver;
    private readonly validationEngine;
    private readonly xhr;
    private readonly cachePipe;
    constructor(template: Template, typeCheck: TypeCheck, pathResolver: PathResolver, validationEngine: ValidationEngine, xhr: Xhr, cachePipe: CachePipe);
    createAPI<D, T extends ReqStrategyTypes, P extends PayloadDef>(apiConfig: ApiConfig<D, T, P>): <T2 extends ReqStrategyTypes>(this: Karman, payload: { [K in keyof P]: any; }, runtimeOptions?: RuntimeOptions<T2>) => [requestPromise: Promise<SelectRequestStrategy<T, D>>, abortController: () => void];
    private preqBuilder;
    private requestStrategySelector;
    private runtimeOptionsParser;
    private apiConfigParser;
}
//# sourceMappingURL=api-factory.injectable.d.ts.map