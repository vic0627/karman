import Karman from "@/core/karman/karman";
import { AsyncHooks, SyncHooks } from "./hooks.type";
import { ReqStrategyTypes, RequestConfig, RequestExecutor } from "./http.type";
import { CacheConfig, UtilConfig } from "./karman.type";

export interface RuntimeOptions<T extends ReqStrategyTypes>
  extends SyncHooks,
    AsyncHooks,
    RequestConfig<T>,
    CacheConfig,
    Omit<UtilConfig, "scheduleInterval"> {
  cancelToken?: AbortSignal;
}

export type FinalAPI<T extends ReqStrategyTypes, D> = (
  this: Karman,
  payload: Record<string, any>,
  runtimeOptions?: RuntimeOptions<T>,
) => ReturnType<RequestExecutor<D>>;
