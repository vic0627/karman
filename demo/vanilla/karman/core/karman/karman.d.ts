import { AsyncHooks, SyncHooks } from "@/types/karman/hooks.type";
import { ReqStrategyTypes, RequestConfig } from "@/types/karman/http.type";
import { CacheConfig, KarmanInstanceConfig } from "@/types/karman/karman.type";
import PathResolver from "@/utils/path-rosolver.provider";
import TypeCheck from "@/utils/type-check.provider";
export default class Karman {
    #private;
    private _typeCheck;
    private _pathResolver;
    get $parent(): Karman | null;
    set $parent(value: Karman | null);
    get $baseURL(): string;
    set $baseURL(value: string);
    $cacheConfig: CacheConfig;
    $requestConfig: RequestConfig<ReqStrategyTypes>;
    $hooks: AsyncHooks & SyncHooks;
    get $validation(): boolean | undefined;
    set $validation(value: boolean | undefined);
    get $scheduleInterval(): number | undefined;
    set $scheduleInterval(value: number | undefined);
    constructor(config: KarmanInstanceConfig);
    $mount<O extends object>(o: O, name?: string): void;
    /**
     * Inheriting all configurations down to the whole Karman tree from root node.
     * Only allows to be invoked once on root layer.
     */
    $inherit(): void;
    $setDependencies(...deps: (TypeCheck | PathResolver)[]): void;
    private $invokeChildrenInherit;
}
//# sourceMappingURL=karman.d.ts.map